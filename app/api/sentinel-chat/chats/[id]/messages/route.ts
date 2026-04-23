import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import {
  SENTINEL_CHAT_TOOLS,
  SENTINEL_CHAT_SYSTEM_PROMPT,
  runTool,
  type ToolContext,
} from "@/services/ai/sentinelChat";
import { enforceLimit } from "@/lib/billing/limits";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "gpt-4o";
const MAX_TOOL_ROUNDS = 4;

type StoredMessage = {
  id: string;
  role: string;
  content: string | null;
  toolCalls: any;
  toolCallId: string | null;
  toolName: string | null;
  createdAt: Date;
};

type OpenAIMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | {
      role: "assistant";
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    }
  | { role: "tool"; content: string; tool_call_id: string };

function toOpenAIMessage(m: StoredMessage): OpenAIMessage | null {
  if (m.role === "user") {
    return { role: "user", content: m.content || "" };
  }
  if (m.role === "assistant") {
    const tc = (m.toolCalls as any[] | null) || null;
    return {
      role: "assistant",
      content: m.content,
      ...(tc && tc.length
        ? {
            tool_calls: tc.map((t) => ({
              id: t.id,
              type: "function" as const,
              function: { name: t.name, arguments: t.arguments },
            })),
          }
        : {}),
    };
  }
  if (m.role === "tool") {
    return {
      role: "tool",
      content: m.content || "",
      tool_call_id: m.toolCallId || "",
    };
  }
  return null;
}

/* ---------- GET: message history ---------- */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chat = await prisma.sentinelChat.findFirst({
    where: { id, userId: user.id, deletedAt: null },
  });
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.sentinelChatMessage.findMany({
    where: { chatId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ chat, messages });
}

/* ---------- POST: stream a turn ---------- */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chat = await prisma.sentinelChat.findFirst({
    where: { id, userId: user.id, deletedAt: null },
  });
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

  const clientWallet = typeof body.walletAddress === "string" ? body.walletAddress : undefined;
  let resolvedWallet = clientWallet;
  if (!resolvedWallet) {
    const w = await prisma.wallet.findFirst({
      where: { userId: user.id, chain: "solana" },
      orderBy: { createdAt: "desc" },
    });
    resolvedWallet = w?.address;
  }

  try {
    await enforceLimit(clerkId, 'chats');
  } catch (limitErr: any) {
    return NextResponse.json({ error: limitErr.message }, { status: 403 });
  }

  // Persist user message immediately
  const userMsg = await prisma.sentinelChatMessage.create({
    data: { chatId: id, role: "user", content },
  });

  // Auto-title on first user message
  if (chat.title === "New chat") {
    const newTitle = content.slice(0, 60);
    await prisma.sentinelChat.update({
      where: { id },
      data: { title: newTitle, updatedAt: new Date() },
    });
  } else {
    await prisma.sentinelChat.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }

  // Load full history (including the just-persisted user message)
  const history = await prisma.sentinelChatMessage.findMany({
    where: { chatId: id },
    orderBy: { createdAt: "asc" },
  });

  const openAIMessages: OpenAIMessage[] = [
    { role: "system", content: SENTINEL_CHAT_SYSTEM_PROMPT },
    ...(history.map(toOpenAIMessage).filter(Boolean) as OpenAIMessage[]),
  ];

  const toolCtx: ToolContext = {
    clerkId,
    dbUserId: user.id,
    chatId: id,
    userWalletAddress: resolvedWallet,
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          /* client closed */
        }
      };

      // Buffer of new messages to persist at end of turn (in order)
      const pending: Array<{
        role: string;
        content: string | null;
        toolCalls?: any;
        toolCallId?: string;
        toolName?: string;
      }> = [];

      send({ type: "message_saved", payload: { role: "user", id: userMsg.id } });

      try {
        let lastTokenUpdate: { address: string; chain: string } | null = null;

        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: openAIMessages as any,
            tools: SENTINEL_CHAT_TOOLS as any,
            tool_choice: "auto",
            stream: true,
            temperature: 0.4,
          });

          let assistantText = "";
          type AccTool = { id: string; name: string; arguments: string };
          const accTools: Record<number, AccTool> = {};
          let finishReason: string | null = null;

          for await (const chunk of completion) {
            const choice = chunk.choices[0];
            if (!choice) continue;
            const delta = choice.delta as any;

            if (typeof delta?.content === "string" && delta.content.length) {
              assistantText += delta.content;
              send({ type: "text_delta", payload: { text: delta.content } });
            }

            if (Array.isArray(delta?.tool_calls)) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index ?? 0;
                if (!accTools[idx]) {
                  accTools[idx] = { id: "", name: "", arguments: "" };
                }
                if (tc.id) accTools[idx].id = tc.id;
                if (tc.function?.name) accTools[idx].name += tc.function.name;
                if (tc.function?.arguments)
                  accTools[idx].arguments += tc.function.arguments;
              }
            }

            if (choice.finish_reason) finishReason = choice.finish_reason;
          }

          const toolCallsArr = Object.values(accTools).filter((t) => t.id && t.name);

          // Record assistant turn
          const assistantMsgForOpenAI: OpenAIMessage = {
            role: "assistant",
            content: assistantText || null,
            ...(toolCallsArr.length
              ? {
                  tool_calls: toolCallsArr.map((t) => ({
                    id: t.id,
                    type: "function" as const,
                    function: { name: t.name, arguments: t.arguments || "{}" },
                  })),
                }
              : {}),
          };
          openAIMessages.push(assistantMsgForOpenAI);

          pending.push({
            role: "assistant",
            content: assistantText || null,
            toolCalls: toolCallsArr.length
              ? toolCallsArr.map((t) => ({
                  id: t.id,
                  name: t.name,
                  arguments: t.arguments || "{}",
                }))
              : null,
          });

          if (!toolCallsArr.length || finishReason === "stop") {
            break;
          }

          // Run each tool call
          for (const tc of toolCallsArr) {
            let parsedArgs: any = {};
            try {
              parsedArgs = tc.arguments ? JSON.parse(tc.arguments) : {};
            } catch {
              parsedArgs = {};
            }

            send({
              type: "tool_call",
              payload: { id: tc.id, name: tc.name, arguments: parsedArgs },
            });

            const result = await runTool(tc.name, parsedArgs, toolCtx);

            if (result.ok && result.sideEffect?.updateLastToken) {
              lastTokenUpdate = result.sideEffect.updateLastToken;
            }

            // Payload sent back to LLM (compact, no big display blobs)
            const llmPayload = result.ok
              ? { ok: true, data: result.data }
              : { ok: false, error: result.error };

            send({
              type: "tool_result",
              payload: {
                id: tc.id,
                name: tc.name,
                ok: result.ok,
                display: result.display ?? null,
                ...(result.ok ? {} : { error: result.error }),
              },
            });

            const toolContent = JSON.stringify(llmPayload).slice(0, 20000);

            openAIMessages.push({
              role: "tool",
              content: toolContent,
              tool_call_id: tc.id,
            });

            pending.push({
              role: "tool",
              content: toolContent,
              toolCallId: tc.id,
              toolName: tc.name,
            });
          }
        }

        // Persist all new assistant + tool messages in order
        for (const m of pending) {
          await prisma.sentinelChatMessage.create({
            data: {
              chatId: id,
              role: m.role,
              content: m.content ?? null,
              toolCalls: m.toolCalls ?? undefined,
              toolCallId: m.toolCallId ?? null,
              toolName: m.toolName ?? null,
            },
          });
        }

        if (lastTokenUpdate) {
          await prisma.sentinelChat.update({
            where: { id },
            data: {
              lastTokenAddress: lastTokenUpdate.address,
              lastTokenChain: lastTokenUpdate.chain,
            },
          });
        }

        send({ type: "message_saved", payload: { role: "assistant" } });
        send({ type: "done" });
      } catch (err: any) {
        console.error("[SentinelChat stream error]", err);
        send({
          type: "error",
          payload: { message: err?.message || "Chat stream failed" },
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

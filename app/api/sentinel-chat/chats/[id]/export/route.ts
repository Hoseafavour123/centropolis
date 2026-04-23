import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { enforceLimit } from "@/lib/billing/limits";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
      await enforceLimit(clerkId, 'export');
  } catch (limitErr: any) {
      return NextResponse.json({ error: limitErr.message }, { status: 403 });
  }

  const chat = await prisma.sentinelChat.findFirst({
    where: { id, userId: user.id, deletedAt: null },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const payload = {
    exportedAt: new Date().toISOString(),
    chat: {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      lastTokenAddress: chat.lastTokenAddress,
      lastTokenChain: chat.lastTokenChain,
    },
    messages: chat.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      toolCalls: m.toolCalls,
      toolCallId: m.toolCallId,
      toolName: m.toolName,
      createdAt: m.createdAt,
    })),
  };

  const slug =
    (chat.title || "untitled")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "untitled";
  const date = new Date().toISOString().slice(0, 10);
  const filename = `sentinel-chat-${slug}-${date}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import { Bot, RotateCcw } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { StreamingAssistantBlock } from "./StreamingAssistantBlock";
import type {
  ChatMessage as ChatMessageType,
  StreamingToolCall,
} from "@/store/useSentinelChatStore";

interface Props {
  messages: ChatMessageType[];
  streamingText: string;
  streamingToolCalls: Record<string, StreamingToolCall>;
  streamingToolOrder: string[];
  status: "idle" | "streaming" | "error";
  error: string | null;
  onRetry?: () => void;
}

export function ChatMessageList({
  messages,
  streamingText,
  streamingToolCalls,
  streamingToolOrder,
  status,
  error,
  onRetry,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const toolResultsByCallId = useMemo(() => {
    const map: Record<string, { content: string | null }> = {};
    for (const m of messages) {
      if (m.role === "tool" && m.toolCallId) {
        map[m.toolCallId] = { content: m.content };
      }
    }
    return map;
  }, [messages]);

  const orderedStreamingTools = useMemo(
    () => streamingToolOrder.map((id) => streamingToolCalls[id]).filter(Boolean),
    [streamingToolOrder, streamingToolCalls]
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, streamingText, streamingToolOrder.length, status]);

  const showEmpty = messages.length === 0 && status === "idle";

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {showEmpty && (
        <div className="h-full min-h-[300px] flex items-center justify-center">
          <div className="text-center space-y-3 max-w-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Sentinel Chat</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ask about a Solana token, check your portfolio, search the market, or request a swap quote.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
              <span>&ldquo;Analyze BONK for rug risk&rdquo;</span>
              <span>&ldquo;Show my portfolio&rdquo;</span>
              <span>&ldquo;Quote 1 SOL to USDC&rdquo;</span>
            </div>
          </div>
        </div>
      )}

      {messages.map((m) => (
        <ChatMessage key={m.id} message={m} toolResultsByCallId={toolResultsByCallId} />
      ))}

      {status === "streaming" && (
        <StreamingAssistantBlock
          text={streamingText}
          toolCalls={orderedStreamingTools}
          isStreaming
        />
      )}

      {status === "error" && error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/5 px-3 py-2 text-xs text-rose-300 flex items-center justify-between gap-3">
          <span className="min-w-0 break-words">{error}</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="shrink-0 inline-flex items-center gap-1 rounded-md border border-rose-500/40 px-2 py-1 text-[11px] font-medium text-rose-200 hover:bg-rose-500/10 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}

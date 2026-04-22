"use client";

import { Bot, Loader2 } from "lucide-react";
import { MarkdownMessage } from "./MarkdownMessage";
import { ToolCallBlock } from "./ToolCallBlock";
import type { StreamingToolCall } from "@/store/useSentinelChatStore";

interface Props {
  text: string;
  toolCalls: StreamingToolCall[];
  isStreaming: boolean;
}

export function StreamingAssistantBlock({ text, toolCalls, isStreaming }: Props) {
  const empty = !text && toolCalls.length === 0;
  if (empty && !isStreaming) return null;

  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        {text && <MarkdownMessage content={text} />}
        {toolCalls.length > 0 && (
          <div className="space-y-1.5">
            {toolCalls.map((tc) => (
              <ToolCallBlock
                key={tc.id}
                name={tc.name}
                status={tc.status}
                display={tc.display}
                error={tc.error}
              />
            ))}
          </div>
        )}
        {isStreaming && !text && toolCalls.length === 0 && (
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Thinking…
          </div>
        )}
      </div>
    </div>
  );
}

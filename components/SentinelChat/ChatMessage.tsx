"use client";

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { MarkdownMessage } from "./MarkdownMessage";
import { PersistedToolBlock } from "./PersistedToolBlock";
import type { ChatMessage as ChatMessageType } from "@/store/useSentinelChatStore";

interface Props {
  message: ChatMessageType;
  toolResultsByCallId: Record<
    string,
    { content: string | null; display?: ChatMessageType["display"] }
  >;
}

export function ChatMessage({ message, toolResultsByCallId }: Props) {
  if (message.role === "tool") return null;

  if (message.role === "user") {
    return (
      <div className="flex gap-3 justify-end">
        <div
          className={cn(
            "max-w-[85%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3 py-2 text-sm",
            message.pending && "opacity-70"
          )}
        >
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        </div>
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  }

  // assistant
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        {message.content && <MarkdownMessage content={message.content} />}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-1.5">
            {message.toolCalls.map((tc) => {
              const result = toolResultsByCallId[tc.id];
              return (
                <PersistedToolBlock
                  key={tc.id}
                  name={tc.name}
                  args={tc.arguments}
                  resultContent={result?.content ?? null}
                  display={result?.display ?? null}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

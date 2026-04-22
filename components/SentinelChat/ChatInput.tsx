"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { Loader2, Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onSend: (text: string) => void | Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
  streaming?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onCancel,
  disabled,
  streaming,
  placeholder = "Ask Sentinel…",
}: Props) {
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const submit = async () => {
    const t = value.trim();
    if (!t || disabled || streaming) return;
    setValue("");
    if (taRef.current) taRef.current.style.height = "auto";
    await onSend(t);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  return (
    <div className="border-t border-border bg-background px-3 py-3">
      <div className="flex items-end gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 focus-within:border-primary/60 transition-colors">
        <textarea
          ref={taRef}
          rows={1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            autoGrow(e.currentTarget);
          }}
          onKeyDown={onKey}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex-1 bg-transparent resize-none text-sm leading-relaxed outline-none",
            "placeholder:text-muted-foreground/60",
            "disabled:opacity-60"
          )}
        />
        {streaming ? (
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Stop"
          >
            <Square className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !value.trim()}
            className={cn(
              "shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
            title="Send"
          >
            {disabled ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
        Enter to send · Shift+Enter for newline
      </p>
    </div>
  );
}

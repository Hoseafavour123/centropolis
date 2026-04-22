"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div
      className={cn(
        "prose prose-sm prose-invert max-w-none",
        "prose-p:my-2 prose-p:leading-relaxed",
        "prose-headings:mt-3 prose-headings:mb-2 prose-headings:font-semibold",
        "prose-ul:my-2 prose-ol:my-2 prose-li:my-0",
        "prose-pre:my-2 prose-pre:bg-muted prose-pre:text-xs",
        "prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-table:my-2 prose-table:text-xs",
        "prose-th:border prose-th:border-border prose-th:px-2 prose-th:py-1 prose-th:bg-muted",
        "prose-td:border prose-td:border-border prose-td:px-2 prose-td:py-1",
        "prose-a:text-primary hover:prose-a:underline",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOL_LABELS: Record<string, string> = {
  analyzeToken: "Sentinel analysis",
  getTokenSnapshot: "Token snapshot",
  getTokenHolders: "Top holders",
  getRecentTransactions: "Recent transactions",
  searchToken: "Token search",
  addToWatchlist: "Added to watchlist",
  removeFromWatchlist: "Removed from watchlist",
  listWatchlist: "Watchlist",
  getUserPortfolio: "Portfolio",
  getJupiterQuote: "Jupiter quote",
  prepareSwap: "Swap quote",
};

interface PersistedToolBlockProps {
  name: string;
  args?: string;
  resultContent?: string | null;
}

export function PersistedToolBlock({ name, args, resultContent }: PersistedToolBlockProps) {
  const [open, setOpen] = useState(false);
  const label = TOOL_LABELS[name] || name;

  let parsedResult: unknown = null;
  if (resultContent) {
    try {
      parsedResult = JSON.parse(resultContent);
    } catch {
      parsedResult = resultContent;
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-muted/40"
      >
        <Wrench className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="font-medium flex-1 truncate">{label}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 shrink-0 transition-transform text-muted-foreground",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="p-2 border-t border-border bg-background space-y-2">
          {args && (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Arguments</div>
              <pre className="text-[11px] bg-muted rounded p-2 overflow-x-auto">{args}</pre>
            </div>
          )}
          {parsedResult != null && (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Result</div>
              <pre className="text-[11px] bg-muted rounded p-2 max-h-60 overflow-auto whitespace-pre-wrap break-words">
                {typeof parsedResult === "string" ? parsedResult : JSON.stringify(parsedResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

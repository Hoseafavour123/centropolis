"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolDisplay } from "@/services/ai/sentinelChat";
import { ToolDisplayCard } from "./tool-displays/ToolDisplayCard";

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
  prepareSwap: "Swap preview",
};

interface PersistedToolBlockProps {
  name: string;
  args?: string;
  resultContent?: string | null;
  display?: ToolDisplay | null;
}

export function PersistedToolBlock({
  name,
  args,
  resultContent,
  display,
}: PersistedToolBlockProps) {
  // If we have a rendered display from the server, show it inline (matches the
  // live streaming UX). Raw JSON fallback hidden behind a disclosure for
  // historical messages where display was never persisted.
  const hasDisplay = !!display;
  const [rawOpen, setRawOpen] = useState(false);

  let parsedResult: unknown = null;
  if (resultContent) {
    try {
      parsedResult = JSON.parse(resultContent);
    } catch {
      parsedResult = resultContent;
    }
  }

  const label = TOOL_LABELS[name] || name;

  if (hasDisplay) {
    return (
      <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          <span className="font-medium flex-1 truncate">{label}</span>
          {(args || parsedResult != null) && (
            <button
              type="button"
              onClick={() => setRawOpen((v) => !v)}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-0.5"
            >
              raw
              <ChevronDown
                className={cn(
                  "w-3 h-3 transition-transform",
                  rawOpen && "rotate-180"
                )}
              />
            </button>
          )}
        </div>
        <div className="p-2 border-t border-border bg-background">
          <ToolDisplayCard display={display!} />
        </div>
        {rawOpen && (
          <div className="px-3 py-2 border-t border-border bg-muted/10 space-y-2">
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
                  {typeof parsedResult === "string"
                    ? parsedResult
                    : JSON.stringify(parsedResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // No persisted display (older messages) — fall back to disclosure of raw JSON.
  return (
    <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setRawOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-muted/40"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="font-medium flex-1 truncate">{label}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 shrink-0 transition-transform text-muted-foreground",
            rawOpen && "rotate-180"
          )}
        />
      </button>
      {rawOpen && (
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
                {typeof parsedResult === "string"
                  ? parsedResult
                  : JSON.stringify(parsedResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

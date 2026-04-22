"use client";

import { useState } from "react";
import { ChevronDown, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolDisplay } from "@/services/ai/sentinelChat";
import { ToolDisplayCard } from "./tool-displays/ToolDisplayCard";

export type ToolCallStatus = "running" | "done" | "error";

interface ToolCallBlockProps {
  name: string;
  status: ToolCallStatus;
  display?: ToolDisplay | null;
  error?: string;
  defaultOpen?: boolean;
}

const TOOL_LABELS: Record<string, string> = {
  analyzeToken: "Analyzing token",
  getTokenSnapshot: "Fetching token snapshot",
  getTokenHolders: "Fetching holders",
  getRecentTransactions: "Fetching transactions",
  searchToken: "Searching tokens",
  addToWatchlist: "Updating watchlist",
  removeFromWatchlist: "Updating watchlist",
  listWatchlist: "Loading watchlist",
  getUserPortfolio: "Reading portfolio",
  getJupiterQuote: "Quoting swap",
  prepareSwap: "Preparing swap",
};

export function ToolCallBlock({
  name,
  status,
  display,
  error,
  defaultOpen = true,
}: ToolCallBlockProps) {
  const [open, setOpen] = useState(defaultOpen);
  const hasBody = status === "done" && !!display;
  const label = TOOL_LABELS[name] || name;

  const StatusIcon =
    status === "running" ? Loader2 : status === "done" ? CheckCircle2 : XCircle;
  const statusColor =
    status === "running"
      ? "text-muted-foreground"
      : status === "done"
      ? "text-emerald-400"
      : "text-rose-400";

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted/20 overflow-hidden",
        status === "error" && "border-rose-500/40 bg-rose-500/5"
      )}
    >
      <button
        type="button"
        onClick={() => hasBody && setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left",
          hasBody ? "cursor-pointer hover:bg-muted/40" : "cursor-default"
        )}
      >
        <StatusIcon
          className={cn(
            "w-3.5 h-3.5 shrink-0",
            statusColor,
            status === "running" && "animate-spin"
          )}
        />
        <span className="font-medium flex-1 truncate">
          {status === "running" ? `${label}…` : label}
        </span>
        {status === "error" && error && (
          <span className="text-[11px] text-rose-400 truncate max-w-[40%]">{error}</span>
        )}
        {hasBody && (
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 shrink-0 transition-transform text-muted-foreground",
              open && "rotate-180"
            )}
          />
        )}
      </button>
      {hasBody && open && (
        <div className="p-2 border-t border-border bg-background">
          <ToolDisplayCard display={display!} />
        </div>
      )}
    </div>
  );
}

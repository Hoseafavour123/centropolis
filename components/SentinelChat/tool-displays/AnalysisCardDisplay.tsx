"use client";

import { ShieldCheck, ShieldAlert, ShieldX, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyBtn, shortAddr, StatPill } from "./_shared";
import Link from "next/link";

interface Props {
  payload: {
    analysisId: string;
    tokenAddress: string;
    tokenSymbol?: string;
    tokenName?: string;
    finalScore: number;
    summary?: string;
    rugDetection?: { verdict?: string; risks?: string[] };
    recommendation?: { action?: string; reason?: string };
    metrics?: Record<string, unknown>;
  };
}

function band(score: number) {
  if (score >= 70) return { label: "Safe", Icon: ShieldCheck, cls: "text-emerald-400 border-emerald-500/40 bg-emerald-500/5" };
  if (score >= 40) return { label: "Caution", Icon: ShieldAlert, cls: "text-amber-400 border-amber-500/40 bg-amber-500/5" };
  return { label: "Danger", Icon: ShieldX, cls: "text-rose-400 border-rose-500/40 bg-rose-500/5" };
}

export function AnalysisCardDisplay({ payload }: Props) {
  const { finalScore, tokenSymbol, tokenName, tokenAddress, summary, rugDetection, recommendation } = payload;
  const b = band(finalScore);
  const Icon = b.Icon;

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className={cn("flex items-center justify-between gap-3 px-3 py-2 border-b border-border rounded-t-lg", b.cls)}>
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-4 h-4 shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">
              {tokenSymbol || "TKN"} <span className="text-muted-foreground font-normal">· {tokenName || "Unknown"}</span>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              {shortAddr(tokenAddress, 4, 4)}
              <CopyBtn value={tokenAddress} label="Address" />
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold leading-none">{finalScore}</div>
          <div className="text-[10px] uppercase tracking-wide">{b.label}</div>
        </div>
      </div>

      <div className="p-3 space-y-2 text-sm">
        {summary && <p className="text-muted-foreground leading-relaxed">{summary}</p>}

        <div className="grid grid-cols-2 gap-2">
          {rugDetection?.verdict && (
            <StatPill label="Rug Verdict" value={rugDetection.verdict} tone={/low/i.test(rugDetection.verdict) ? "up" : /high/i.test(rugDetection.verdict) ? "down" : "warn"} />
          )}
          {recommendation?.action && (
            <StatPill label="Action" value={recommendation.action} tone={/buy|long/i.test(recommendation.action) ? "up" : /avoid|sell/i.test(recommendation.action) ? "down" : "warn"} />
          )}
        </div>

        {recommendation?.reason && (
          <div className="text-xs text-muted-foreground border-l-2 border-border pl-2">
            {recommendation.reason}
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t border-border flex items-center justify-end text-xs">
        <Link
          href={`/tokens/${tokenAddress}`}
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Open token <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

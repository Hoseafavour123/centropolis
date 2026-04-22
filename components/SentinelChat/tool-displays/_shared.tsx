"use client";

import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export function shortAddr(addr?: string | null, head = 4, tail = 4): string {
  if (!addr) return "—";
  if (addr.length <= head + tail + 2) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function formatUsd(v?: number | null, digits = 2): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(digits)}B`;
  if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(digits)}M`;
  if (abs >= 1_000) return `$${(v / 1_000).toFixed(digits)}K`;
  if (abs >= 1) return `$${v.toFixed(digits)}`;
  return `$${v.toPrecision(4)}`;
}

export function formatNum(v?: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function formatPct(v?: number | null, digits = 2): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

export function CopyBtn({ value, label }: { value: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value).then(
          () => toast.success(label ? `${label} copied` : "Copied"),
          () => toast.error("Copy failed")
        );
      }}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <Copy className="w-3 h-3" />
    </button>
  );
}

export function StatPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "up" | "down" | "warn";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 rounded-md border border-border bg-muted/40 px-2.5 py-1.5",
        tone === "up" && "border-emerald-500/40 bg-emerald-500/5",
        tone === "down" && "border-rose-500/40 bg-rose-500/5",
        tone === "warn" && "border-amber-500/40 bg-amber-500/5"
      )}
    >
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold",
          tone === "up" && "text-emerald-400",
          tone === "down" && "text-rose-400",
          tone === "warn" && "text-amber-400"
        )}
      >
        {value}
      </span>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Check, Info, ListPlus, Trash2, ExternalLink } from "lucide-react";
import { CopyBtn, shortAddr } from "./_shared";

type Action = "added" | "already_in" | "removed" | "not_in" | "list";

interface WatchItem {
  id: string;
  chain: string;
  address: string;
  createdAt: string;
}

interface Props {
  payload:
    | { action: Exclude<Action, "list">; address: string; chain: string }
    | { action: "list"; count: number; items: WatchItem[] };
}

export function WatchlistDisplay({ payload }: Props) {
  if (payload.action === "list") {
    const { items, count } = payload;
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="px-3 py-2 border-b border-border text-xs font-semibold">
          Watchlist ({count})
        </div>
        {items.length === 0 ? (
          <div className="px-3 py-4 text-xs text-muted-foreground">
            Your watchlist is empty.
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            <ul className="divide-y divide-border/60">
              {items.map((w) => (
                <li key={w.id} className="px-3 py-2 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {w.chain}
                    </span>
                    <span className="font-mono truncate">{shortAddr(w.address, 6, 6)}</span>
                    <CopyBtn value={w.address} label="Address" />
                  </div>
                  <Link
                    href={`/tokens/${w.address}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline shrink-0"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  const { action, address, chain } = payload;
  const variants = {
    added: { Icon: ListPlus, text: "Added to watchlist", cls: "text-emerald-400 border-emerald-500/40 bg-emerald-500/5" },
    already_in: { Icon: Info, text: "Already on your watchlist", cls: "text-sky-400 border-sky-500/40 bg-sky-500/5" },
    removed: { Icon: Trash2, text: "Removed from watchlist", cls: "text-amber-400 border-amber-500/40 bg-amber-500/5" },
    not_in: { Icon: Info, text: "Was not on your watchlist", cls: "text-muted-foreground border-border bg-muted/40" },
  } as const;
  const v = variants[action];
  const Icon = v.Icon;

  return (
    <div className={`rounded-lg border px-3 py-2 flex items-center gap-3 text-xs ${v.cls}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{v.text}</div>
        <div className="text-[11px] opacity-80 flex items-center gap-1">
          <span className="uppercase">{chain}</span>·
          <span className="font-mono">{shortAddr(address, 6, 6)}</span>
          <CopyBtn value={address} label="Address" />
        </div>
      </div>
      {action !== "removed" && action !== "not_in" && (
        <Check className="w-4 h-4 shrink-0" />
      )}
    </div>
  );
}

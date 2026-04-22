"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CopyBtn, formatPct, formatUsd, shortAddr } from "./_shared";

interface Result {
  address: string;
  name?: string;
  symbol?: string;
  priceUsd: number;
  liquidity: number;
  volume24h: number;
}

interface Props {
  payload: { query: string; results: Result[] };
}

export function SearchResultsDisplay({ payload }: Props) {
  const { query, results } = payload;

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-3 py-2 border-b border-border text-xs">
        <span className="text-muted-foreground">Search results for</span>{" "}
        <span className="font-semibold">&ldquo;{query}&rdquo;</span>
        <span className="text-muted-foreground"> · {results.length}</span>
      </div>
      {results.length === 0 ? (
        <div className="px-3 py-4 text-xs text-muted-foreground">No Solana tokens found.</div>
      ) : (
        <ul className="divide-y divide-border/60 max-h-72 overflow-y-auto">
          {results.map((r) => (
            <li key={r.address} className="px-3 py-2 flex items-center gap-3 text-xs">
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">
                  {r.symbol || "TKN"}{" "}
                  <span className="text-muted-foreground font-normal">· {r.name || "—"}</span>
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  {shortAddr(r.address, 6, 6)}
                  <CopyBtn value={r.address} label="Address" />
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold">
                  {formatUsd(r.priceUsd, r.priceUsd < 1 ? 6 : 4)}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Vol {formatUsd(r.volume24h)} · Liq {formatUsd(r.liquidity)}
                </div>
              </div>
              <Link
                href={`/tokens/${r.address}`}
                className="inline-flex items-center gap-1 text-primary hover:underline shrink-0"
              >
                <ExternalLink className="w-3 h-3" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

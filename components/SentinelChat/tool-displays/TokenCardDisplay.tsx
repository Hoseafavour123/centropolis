"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CopyBtn, formatPct, formatUsd, shortAddr } from "./_shared";

interface Props {
  payload: {
    address: string;
    chain: string;
    name: string;
    symbol: string;
    priceUsd?: number;
    change24h?: number;
    volume24h?: number;
    liquidity?: number;
    imageUrl?: string;
  };
}

export function TokenCardDisplay({ payload }: Props) {
  const { address, name, symbol, priceUsd, change24h, volume24h, liquidity, imageUrl } = payload;
  const up = (change24h ?? 0) >= 0;

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
          {imageUrl ? (
            <Image src={imageUrl} alt={symbol} width={40} height={40} unoptimized />
          ) : (
            <span className="text-xs font-semibold text-muted-foreground">
              {symbol?.slice(0, 3).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate">
            {symbol} <span className="text-muted-foreground font-normal">· {name}</span>
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            {shortAddr(address)}
            <CopyBtn value={address} label="Address" />
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-semibold">{formatUsd(priceUsd, priceUsd && priceUsd < 1 ? 6 : 4)}</div>
          <div className={up ? "text-xs text-emerald-400" : "text-xs text-rose-400"}>
            {formatPct(change24h)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="rounded-md border border-border bg-muted/40 px-2.5 py-1.5">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Volume 24h</div>
          <div className="font-semibold">{formatUsd(volume24h)}</div>
        </div>
        <div className="rounded-md border border-border bg-muted/40 px-2.5 py-1.5">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Liquidity</div>
          <div className="font-semibold">{formatUsd(liquidity)}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end text-xs">
        <Link
          href={`/tokens/${address}`}
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Open token <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

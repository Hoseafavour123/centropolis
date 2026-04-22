"use client";

import { CopyBtn, formatNum, formatUsd, shortAddr } from "./_shared";
import { Wallet } from "lucide-react";

interface Holding {
  mint: string;
  symbol?: string;
  name?: string;
  amount: number;
  priceUsd?: number;
  valueUsd?: number;
}

interface Props {
  payload: {
    wallet: string;
    solBalance: number;
    tokens: Holding[];
    tokenCount: number;
  };
}

export function PortfolioDisplay({ payload }: Props) {
  const { wallet, solBalance, tokens, tokenCount } = payload;
  const totalUsd = tokens.reduce((s, t) => s + (t.valueUsd || 0), 0);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Wallet className="w-4 h-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <div className="text-xs font-semibold flex items-center gap-1">
              <span className="font-mono">{shortAddr(wallet, 6, 6)}</span>
              <CopyBtn value={wallet} label="Wallet" />
            </div>
            <div className="text-[11px] text-muted-foreground">{tokenCount} tokens</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-semibold">{formatUsd(totalUsd)}</div>
          <div className="text-[11px] text-muted-foreground">{formatNum(solBalance)} SOL</div>
        </div>
      </div>

      {tokens.length === 0 ? (
        <div className="px-3 py-4 text-xs text-muted-foreground">No fungible tokens found.</div>
      ) : (
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left px-3 py-1.5">Token</th>
                <th className="text-right px-3 py-1.5">Amount</th>
                <th className="text-right px-3 py-1.5">Value</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.mint} className="border-t border-border/60">
                  <td className="px-3 py-1.5">
                    <div className="font-semibold">{t.symbol || shortAddr(t.mint)}</div>
                    {t.name && <div className="text-[10px] text-muted-foreground truncate">{t.name}</div>}
                  </td>
                  <td className="px-3 py-1.5 text-right">{formatNum(t.amount)}</td>
                  <td className="px-3 py-1.5 text-right font-semibold">{formatUsd(t.valueUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

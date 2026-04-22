"use client";

import { CopyBtn, formatNum, shortAddr } from "./_shared";

interface Holder {
  rank: number;
  address: string;
  amount: number;
}

interface Props {
  payload: {
    address: string;
    top: Holder[];
    topHoldersCombinedAmount: number;
    count: number;
  };
}

export function HoldersListDisplay({ payload }: Props) {
  const { top, topHoldersCombinedAmount, count } = payload;

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="text-xs font-semibold">Top {count} holders</div>
        <div className="text-[11px] text-muted-foreground">
          Combined: {formatNum(topHoldersCombinedAmount)}
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/40">
            <tr>
              <th className="text-left px-3 py-1.5 w-10">#</th>
              <th className="text-left px-3 py-1.5">Address</th>
              <th className="text-right px-3 py-1.5">Amount</th>
            </tr>
          </thead>
          <tbody>
            {top.map((h) => (
              <tr key={h.address} className="border-t border-border/60">
                <td className="px-3 py-1.5 text-muted-foreground">{h.rank}</td>
                <td className="px-3 py-1.5 font-mono">
                  <span className="inline-flex items-center gap-1">
                    {shortAddr(h.address, 6, 6)}
                    <CopyBtn value={h.address} label="Address" />
                  </span>
                </td>
                <td className="px-3 py-1.5 text-right font-semibold">{formatNum(h.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

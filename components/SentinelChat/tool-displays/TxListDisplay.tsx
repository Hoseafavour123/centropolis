"use client";

import { CopyBtn, shortAddr } from "./_shared";

interface Tx {
  signature: string;
  timestamp?: number;
  type?: string;
  source?: string;
  fee?: number;
  feePayer?: string;
}

interface Props {
  payload: {
    address: string;
    count: number;
    txs: Tx[];
  };
}

function formatWhen(ts?: number): string {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  return d.toLocaleString();
}

export function TxListDisplay({ payload }: Props) {
  const { txs, count } = payload;

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-3 py-2 border-b border-border text-xs font-semibold">
        Recent transactions ({count})
      </div>
      <div className="max-h-72 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/40">
            <tr>
              <th className="text-left px-3 py-1.5">When</th>
              <th className="text-left px-3 py-1.5">Type</th>
              <th className="text-left px-3 py-1.5">Signature</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.signature} className="border-t border-border/60">
                <td className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">
                  {formatWhen(t.timestamp)}
                </td>
                <td className="px-3 py-1.5">{t.type || t.source || "—"}</td>
                <td className="px-3 py-1.5 font-mono">
                  <span className="inline-flex items-center gap-1">
                    <a
                      href={`https://solscan.io/tx/${t.signature}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {shortAddr(t.signature, 6, 6)}
                    </a>
                    <CopyBtn value={t.signature} label="Signature" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

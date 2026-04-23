"use client";

import { useState, useEffect } from "react";
import { ArrowRight, ShieldCheck, ShieldAlert, ShieldX, Loader2, AlertTriangle } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatNum, formatPct, StatPill } from "./_shared";

export interface TradeQuotePayload {
  quoteResponse?: unknown;
  userPublicKey?: string | null;
  inputMint: string;
  outputMint: string;
  inputSymbol?: string;
  outputSymbol?: string;
  inAmount: number;
  outAmount: number;
  priceImpactPct: number;
  slippageBps: number;
  feeMint?: string | null;
  feeStrategy?: "output" | "input" | "none";
  manualFeeAtoms?: string;
  sentinelScore?: number | null;
  route?: string[];
  requiresUserConfirmation?: boolean;
  quotedAt?: string;
}

interface Props {
  payload: TradeQuotePayload;
}

function sentinelBand(score?: number | null) {
  if (score == null) return null;
  if (score >= 70) return { Icon: ShieldCheck, label: `Sentinel ${score} · Safe`, cls: "text-emerald-400" };
  if (score >= 40) return { Icon: ShieldAlert, label: `Sentinel ${score} · Caution`, cls: "text-amber-400" };
  return { Icon: ShieldX, label: `Sentinel ${score} · Danger`, cls: "text-rose-400" };
}

export function TradeQuoteCardDisplay({ payload }: Props) {
  const [executing, setExecuting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const band = sentinelBand(payload.sentinelScore);
  const Icon = band?.Icon;
  const executable = !!payload.quoteResponse;
  const walletConnected = !!publicKey;
  const highRisk = payload.sentinelScore != null && payload.sentinelScore < 40;

  const [isStale, setIsStale] = useState(false);

  // Poll every second to check if the quote has expired
  useEffect(() => {
    if (!payload.quotedAt || !executable) return;
    const checkStale = () => {
      const elapsed = Date.now() - new Date(payload.quotedAt!).getTime();
      if (elapsed > 30000) {
        setIsStale(true);
      }
    };
    checkStale();
    const interval = setInterval(checkStale, 1000);
    return () => clearInterval(interval);
  }, [payload.quotedAt, executable]);

  const handleExecute = async () => {
    if (!executable) {
      toast.info("This is a quote preview only. Ask the assistant to prepare the swap to execute.");
      return;
    }
    if (!publicKey || !sendTransaction) {
      toast.error("Connect a Solana wallet first.");
      return;
    }
    setExecuting(true);
    setError(null);
    try {
      const res = await fetch("/api/trade/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: payload.quoteResponse,
          userPublicKey: publicKey.toBase58(),
          inputMint: payload.inputMint,
          outputMint: payload.outputMint,
          feeStrategy: payload.feeStrategy,
          feeMint: payload.feeMint,
          manualFeeAtoms: payload.manualFeeAtoms,
        }),
      });
      const json = await res.json();
      if (!res.ok || json?.error) {
        throw new Error(json?.error || `Swap failed: ${res.status}`);
      }

      const swapTransactionB64: string | undefined = json.swapTransaction;
      const recordId: string | undefined = json.recordId;
      if (!swapTransactionB64) {
        throw new Error("Missing swap transaction from server");
      }

      const buf = Buffer.from(swapTransactionB64, "base64");
      const transaction = VersionedTransaction.deserialize(buf);

      toast.loading("Please sign the transaction in your wallet…", { id: "chat-swap" });

      const latestBlockhash = await connection.getLatestBlockhash();
      const signature = await sendTransaction(transaction, connection);
      setTxId(signature);

      if (recordId) {
        fetch(`/api/trade/status/${recordId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txHash: signature, status: "PENDING" }),
        }).catch(() => {});
      }

      toast.loading("Confirming transaction…", { id: "chat-swap" });

      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );

      if (confirmation.value.err) {
        if (recordId) {
          fetch(`/api/trade/status/${recordId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "FAILED",
              errorLogs: JSON.stringify(confirmation.value.err),
            }),
          }).catch(() => {});
        }
        throw new Error("Transaction failed on-chain");
      }

      if (recordId) {
        fetch(`/api/trade/status/${recordId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "SUCCESS" }),
        }).catch(() => {});
      }

      toast.success("Swap successful!", { id: "chat-swap" });
    } catch (err: any) {
      const msg = err?.message || "Swap failed";
      setError(msg);
      toast.error(`Swap failed: ${msg}`, { id: "chat-swap" });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between gap-2">
        <div className="text-xs font-semibold">
          {executable ? "Swap preview" : "Quote"}
        </div>
        {band && Icon && (
          <div className={cn("flex items-center gap-1 text-[11px] font-medium", band.cls)}>
            <Icon className="w-3.5 h-3.5" />
            {band.label}
          </div>
        )}
      </div>

      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0 text-right">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">You pay</div>
            <div className="text-lg font-semibold">{formatNum(payload.inAmount)}</div>
            <div className="text-xs text-muted-foreground">{payload.inputSymbol || "—"}</div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">You receive</div>
            <div className="text-lg font-semibold">{formatNum(payload.outAmount)}</div>
            <div className="text-xs text-muted-foreground">{payload.outputSymbol || "—"}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <StatPill
            label="Price impact"
            value={formatPct(payload.priceImpactPct)}
            tone={Math.abs(payload.priceImpactPct) >= 5 ? "down" : Math.abs(payload.priceImpactPct) >= 1 ? "warn" : "up"}
          />
          <StatPill
            label="Slippage"
            value={`${(payload.slippageBps / 100).toFixed(2)}%`}
          />
        </div>

        {payload.route && payload.route.length > 0 && (
          <div className="text-[11px] text-muted-foreground">
            Route: {payload.route.join(" › ")}
          </div>
        )}

        {executable && highRisk && (
          <div className="flex items-start gap-2 rounded-md border border-rose-500/40 bg-rose-500/5 px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-rose-300 leading-relaxed">
              Sentinel scored this token as high risk. Proceed only if you understand the token fundamentals and trust the source.
            </div>
          </div>
        )}

        {executable && (
          <>
            <button
              type="button"
              onClick={handleExecute}
              disabled={executing || !walletConnected || isStale}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold transition-colors",
                highRisk && !isStale
                  ? "bg-rose-500 text-white hover:bg-rose-500/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {executing && <Loader2 className="w-4 h-4 animate-spin" />}
              {txId
                ? "Submitted"
                : executing
                  ? "Executing…"
                  : !walletConnected
                    ? "Connect wallet to execute"
                    : isStale
                      ? "Quote expired, re-ask Sentinel"
                      : highRisk
                        ? "Execute swap anyway"
                        : "Execute swap"}
            </button>
            {txId && (
              <a
                href={`https://solscan.io/tx/${txId}`}
                target="_blank"
                rel="noreferrer"
                className="block text-center text-xs text-primary hover:underline"
              >
                View on Solscan
              </a>
            )}
            {error && <div className="text-xs text-rose-400">{error}</div>}
            <p className="text-[10px] text-muted-foreground text-center">
              Requires your wallet signature. Nothing is sent until you click execute.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

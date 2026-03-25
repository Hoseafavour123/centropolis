"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, Wallet, RotateCcw } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useWalletData } from "@/hooks/useWalletData";
import { useWalletStore } from "@/store/useWalletStore";
import { cn } from "@/lib/utils";
import {
  useTradeTokenStore,
  DEFAULT_FROM_TOKEN,
  DEFAULT_TO_TOKEN,
} from "@/store/useTradeTokenStore";

const USDC_MINT = "EPjFW36DP7mVQC7i57K6BgnUpWMT8Dz6enwbp9z96Utm";

// Deterministic color per symbol (matches TrendingGrid)
function symbolColor(symbol: string): string {
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
    "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
  ];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// Initials for avatar (up to 3 chars)
function initials(symbol: string): string {
  return symbol.slice(0, 3).toUpperCase();
}

export function QuickTrade() {
  const { balance: solBalance, tokens, isLoading: isDataLoading } = useWalletData();
  const { isConnected } = useWalletStore();
  const { selectedToken, resetToDefault } = useTradeTokenStore();

  const [fromAmount, setFromAmount] = useState("");
  const [isSwapped, setIsSwapped] = useState(false);

  // ── Derive from/to based on store ────────────────────────────────────────
  // When a trending token is selected:
  //   DEFAULT direction → SOL (from) → SelectedToken (to)
  // When no token selected:
  //   DEFAULT direction → SOL (from) → USDC (to)
  const baseFrom = DEFAULT_FROM_TOKEN;
  const baseTo = selectedToken ?? DEFAULT_TO_TOKEN;

  const fromToken = isSwapped ? baseTo : baseFrom;
  const toToken = isSwapped ? baseFrom : baseTo;

  // Reset swap direction when a new token is selected
  useEffect(() => {
    setIsSwapped(false);
    setFromAmount("");
  }, [selectedToken?.symbol]);

  // ── Balances ─────────────────────────────────────────────────────────────
  const usdcBalance = useMemo(() => {
    if (!tokens) return 0;
    const token = tokens.find((t: any) => t.id === USDC_MINT);
    if (!token?.token_info) return 0;
    return token.token_info.balance / Math.pow(10, token.token_info.decimals);
  }, [tokens]);

  const solBalanceSafe = solBalance || 0;

  // For custom trending tokens we don't have balance, show "—"
  const isCustomToken = selectedToken !== null;
  const fromBalance =
    fromToken.symbol === "SOL"
      ? solBalanceSafe
      : fromToken.symbol === "USDC"
        ? usdcBalance
        : 0;
  const toBalance =
    toToken.symbol === "SOL"
      ? solBalanceSafe
      : toToken.symbol === "USDC"
        ? usdcBalance
        : null; // null = unknown for custom tokens

  // ── Exchange rate estimate ────────────────────────────────────────────────
  const SOL_USD = 140.5; // rough estimate; real swap would use Jupiter
  const toAmountEstimate = useMemo(() => {
    const n = parseFloat(fromAmount);
    if (!n || isNaN(n)) return "0.00";
    // Convert fromToken → USD → toToken
    const fromUsd =
      fromToken.symbol === "SOL"
        ? n * SOL_USD
        : fromToken.symbol === "USDC"
          ? n
          : n * (fromToken.priceUsd ?? 1);
    const toUsd =
      toToken.symbol === "SOL"
        ? fromUsd / SOL_USD
        : toToken.symbol === "USDC"
          ? fromUsd
          : toToken.priceUsd
            ? fromUsd / toToken.priceUsd
            : fromUsd;
    return toUsd.toFixed(toToken.symbol === "SOL" ? 4 : toToken.symbol === "USDC" ? 2 : 6);
  }, [fromAmount, fromToken, toToken]);

  const isOverBalance = fromBalance > 0 && parseFloat(fromAmount || "0") > fromBalance;

  // ── Swap direction ────────────────────────────────────────────────────────
  function handleSwap() {
    setIsSwapped((v) => !v);
    setFromAmount("");
  }

  // ── Avatar ────────────────────────────────────────────────────────────────
  function TokenAvatar({ symbol, size = 8 }: { symbol: string; size?: number }) {
    return (
      <div
        className={`w-${size} h-${size} rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0`}
        style={{ background: symbolColor(symbol) }}
      >
        {initials(symbol)}
      </div>
    );
  }

  return (
    <Card className="glass-panel h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">Quick Trade</span>
          <div className="flex items-center gap-2">
            {/* Reset to SOL/USDC button if a custom token is active */}
            {isCustomToken && (
              <button
                onClick={resetToDefault}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                title="Reset to SOL/USDC"
              >
                <RotateCcw size={11} />
                SOL/USDC
              </button>
            )}
            {isConnected && (
              <div className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                <Wallet className="w-3 h-3" />
                <span>Connected</span>
              </div>
            )}
          </div>
        </CardTitle>

        {/* Token context banner */}
        {isCustomToken && (
          <p className="text-[10px] text-primary font-medium">
            Buying <span className="font-bold">{selectedToken.name} ({selectedToken.symbol})</span> with SOL
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs text-muted-foreground">From</label>
            <button
              onClick={() => setFromAmount(fromBalance.toString())}
              className="text-[10px] text-primary hover:underline font-medium"
              disabled={!isConnected || fromBalance === 0}
            >
              Max:{" "}
              {isDataLoading
                ? "..."
                : fromBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </button>
          </div>
          <div
            className={cn(
              "flex items-center justify-between p-3 rounded-xl bg-muted/50 border transition-colors",
              isOverBalance ? "border-red-500/50" : "border-border"
            )}
          >
            <div className="flex items-center gap-2">
              <TokenAvatar symbol={fromToken.symbol} />
              <div>
                <div className="font-bold">{fromToken.symbol}</div>
                <div className="text-[10px] text-muted-foreground">
                  {fromBalance > 0
                    ? `Balance: ${fromBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}`
                    : fromToken.symbol !== "SOL" && fromToken.symbol !== "USDC"
                      ? "Trending token"
                      : "Balance: 0"}
                </div>
              </div>
            </div>
            <input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="bg-transparent text-right font-mono text-lg outline-none w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Swap direction button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={handleSwap}
            className="p-2 rounded-full bg-card border border-border shadow-lg hover:bg-muted transition-transform active:scale-95"
            title="Swap direction"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs text-muted-foreground">To</label>
            <span className="text-[10px] text-muted-foreground">
              {toBalance !== null
                ? `Balance: ${toBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}`
                : "Balance: —"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2">
              <TokenAvatar symbol={toToken.symbol} />
              <div>
                <div className="font-bold">{toToken.symbol}</div>
                <div className="text-[10px] text-muted-foreground">
                  {isCustomToken && toToken.symbol === selectedToken?.symbol
                    ? `~$${selectedToken.priceUsd?.toFixed(6) ?? "—"}/token`
                    : "Est. Output"}
                </div>
              </div>
            </div>
            <div className="font-mono text-lg text-muted-foreground">
              ~ {toAmountEstimate}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <Button
            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
            disabled={
              !isConnected ||
              !fromAmount ||
              parseFloat(fromAmount) <= 0 ||
              isOverBalance
            }
          >
            {isOverBalance
              ? "Insufficient Balance"
              : isConnected
                ? `Swap ${fromToken.symbol} → ${toToken.symbol}`
                : "Connect Wallet"}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            {isCustomToken
              ? `Est. rate via Jupiter · Fee: 0.15%`
              : `1 SOL = ${SOL_USD} USDC · Fee: 0.15%`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

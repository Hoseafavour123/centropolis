"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, Wallet, RotateCcw, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useWalletData } from "@/hooks/useWalletData";
import { useWalletStore } from "@/store/useWalletStore";
import { cn } from "@/lib/utils";
import { useTrade } from "@/hooks/useTrade";
import { useSolPrice } from "@/hooks/useSolPrice";
import {
  useTradeTokenStore,
  DEFAULT_FROM_TOKEN,
  DEFAULT_TO_TOKEN,
} from "@/store/useTradeTokenStore";
import { SOL_MINT, USDC_MINT } from "@/lib/solana/constants";

// Deterministic color per symbol
function symbolColor(symbol: string): string {
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
    "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
  ];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(symbol: string): string {
  return symbol.slice(0, 3).toUpperCase();
}

export function QuickTrade() {
  const { balance: solBalance, tokens, isLoading: isDataLoading } = useWalletData();
  const { solPrice, isLoading: isSolPriceLoading } = useSolPrice();
  const { isConnected } = useWalletStore();
  const { selectedToken, resetToDefault } = useTradeTokenStore();

  const [fromAmount, setFromAmount] = useState("");
  const [isSwapped, setIsSwapped] = useState(false);

  // New hook instance
  const { tradeState, quote, error, fetchQuote, executeSwap } = useTrade();

  const baseFrom = DEFAULT_FROM_TOKEN;
  const baseTo = selectedToken ?? DEFAULT_TO_TOKEN;

  const fromToken = isSwapped ? baseTo : baseFrom;
  const toToken = isSwapped ? baseFrom : baseTo;

  const fromMint = fromToken.mint || SOL_MINT;
  const toMint = toToken.mint || SOL_MINT;

  // Removed: Quote fetching on input change.
  // The quote is now sourced dynamically right before executing the swap.

  // Reset swap direction when a new token is selected
  useEffect(() => {
    setIsSwapped(false);
    setFromAmount("");
  }, [selectedToken?.symbol]);

  const usdcBalance = useMemo(() => {
    if (!tokens) return 0;
    const token = tokens.find((t: any) => t.id === USDC_MINT);
    if (!token?.token_info) return 0;
    return token.token_info.balance / Math.pow(10, token.token_info.decimals);
  }, [tokens]);

  const solBalanceSafe = solBalance || 0;
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
        : null;

  // Real output formatting
  const toAmountEstimate = useMemo(() => {
    if (tradeState === "quoting" || tradeState === "swapping") return "Calculating...";
    return "0.00";
  }, [tradeState]);

  const isOverBalance = fromBalance > 0 && parseFloat(fromAmount || "0") > fromBalance;

  function handleSwap() {
    setIsSwapped((v) => !v);
    setFromAmount("");
  }

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
        {isCustomToken && (
          <p className="text-[10px] text-primary font-medium">
            Trading <span className="font-bold">{selectedToken.name} ({selectedToken.symbol})</span>
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* API Error / Info Banner */}
        {error && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs text-muted-foreground">From</label>
            <button
              onClick={() => setFromAmount(fromBalance.toString())}
              className="text-[10px] text-primary hover:underline font-medium"
              disabled={!isConnected || fromBalance === 0}
            >
              Max: {isDataLoading ? "..." : fromBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </button>
          </div>
          <div className={cn("flex items-center justify-between p-3 rounded-xl bg-muted/50 border transition-colors", isOverBalance ? "border-red-500/50" : "border-border")}>
            <div className="flex items-center gap-2">
              <TokenAvatar symbol={fromToken.symbol} />
              <div>
                <div className="font-bold">{fromToken.symbol}</div>
                <div className="text-[10px] text-muted-foreground">
                  {fromBalance > 0 ? `Bal: ${fromBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : "Bal: 0"}
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

        <div className="flex justify-center -my-3 relative z-10">
          <button onClick={handleSwap} className="p-2 rounded-full bg-card border border-border shadow-lg hover:bg-muted transition-transform active:scale-95">
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center">
            <label className="text-xs text-muted-foreground">To</label>
            <span className="text-[10px] text-muted-foreground">
              {toBalance !== null ? `Bal: ${toBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : "Bal: —"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2">
              <TokenAvatar symbol={toToken.symbol} />
              <div>
                <div className="font-bold">{toToken.symbol}</div>
              </div>
            </div>
            <div className={cn("font-mono text-lg", tradeState === "quoting" ? "text-primary animate-pulse text-sm" : "text-foreground")}>
              {quote ? `~ ${toAmountEstimate}` : toAmountEstimate}
            </div>
          </div>
        </div>

        {/* Removed Intelligence Layer UI */}

        <div className="pt-2">
          <Button
            className="w-full h-12 text-lg font-semibold transition-all bg-primary hover:bg-primary/90"
            onClick={() => executeSwap({ inputMint: fromMint, outputMint: toMint, amount: fromAmount })}
            disabled={
              !isConnected ||
              !fromAmount ||
              parseFloat(fromAmount) <= 0 ||
              isOverBalance ||
              tradeState === "swapping" ||
              tradeState === "quoting" // used internally by useTrade when finding best route
            }
          >
            {isOverBalance
              ? "Insufficient Balance"
              : tradeState === "swapping" || tradeState === "quoting"
                ? "Signing & Swapping..."
                : !isConnected
                  ? "Connect Wallet to Swap"
                  : `Swap ${fromToken.symbol} → ${toToken.symbol}`}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            {isCustomToken
              ? `Est. rate via Jupiter · Fee: 15%`
              : isSolPriceLoading
                ? `Fetching SOL price... · Fee: 15%`
                : solPrice
                  ? `1 SOL ≈ $${solPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} · Fee: 15%`
                  : `Est. rate via Jupiter · Fee: 15%`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

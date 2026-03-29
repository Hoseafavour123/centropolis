"use client"

import { MarketOverview } from "./MarketOverview";
import { WalletSnapshot } from "./WalletSnapshot";
import { RightTradePanel } from "./RightTradePanel";
import { useTradeTokenStore } from "@/store/useTradeTokenStore";

const USDC_MINT = "EPjFW36DP7mVQC7i57K6BgnUpWMT8Dz6enwbp9z96Utm";

export function RightPanel() {
  const selectedToken = useTradeTokenStore((state) => state.selectedToken);

  return (
    <div className="space-y-6">
      <RightTradePanel
        chain="solana"
        fromToken="SOL"
        toToken={selectedToken?.symbol || "USDC"}
        toAddress={selectedToken?.mint || USDC_MINT}
        amountUsd="0.1"
      />
      <MarketOverview />
      <WalletSnapshot />
    </div>
  );
}

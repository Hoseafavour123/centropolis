/**
 * ============================================================================
 * TRADE TOKEN STORE
 * ============================================================================
 * Holds the currently selected token for the Quick Trade panel.
 * When a user clicks a token in TrendingGrid (or any other selector),
 * this store is updated and QuickTrade reacts to it.
 *
 * Default: SOL → USDC  (the classic pair)
 * ============================================================================
 */

import { create } from "zustand";

export interface TradeToken {
    symbol: string;
    name: string;
    /** Mint address (undefined means native SOL) */
    mint?: string;
    /** Informal price in USD — used to estimate "to" amounts */
    priceUsd?: number;
    /** Token logo URL from DexScreener / Jupiter / Helius */
    logoUrl?: string;
}

/** The baseline pair that is always used when nothing is selected */
export const DEFAULT_FROM_TOKEN: TradeToken = {
    symbol: "SOL",
    name: "Solana",
    mint: undefined,
};

export const DEFAULT_TO_TOKEN: TradeToken = {
    symbol: "USDC",
    name: "USD Coin",
    mint: "EPjFW36DP7mVQC7i57K6BgnUpWMT8Dz6enwbp9z96Utm",
};

interface TradeTokenState {
    /** The token a user wants to BUY (base/from on the trending-click path is SOL, target is this token) */
    selectedToken: TradeToken | null;
    setSelectedToken: (token: TradeToken | null) => void;
    /** Reset to default SOL/USDC pair */
    resetToDefault: () => void;
}

export const useTradeTokenStore = create<TradeTokenState>()((set) => ({
    selectedToken: null,
    setSelectedToken: (token) => set({ selectedToken: token }),
    resetToDefault: () => set({ selectedToken: null }),
}));

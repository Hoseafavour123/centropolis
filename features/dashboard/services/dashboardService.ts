/**
 * ============================================================================
 * DASHBOARD SERVICE LAYER
 * ============================================================================
 * Orchestrates data from DexScreener, CoinGecko, and Helius.
 * Transforms raw API data into UI-ready types.
 * ============================================================================
 */

import { Token, TradeActivity } from "@/lib/types";
import { dexscreenerService } from "@/services/dexscreenerService";
import { coingeckoService, MarketCoin } from "@/services/coingeckoService";
import { heliusService, HeliusTransaction } from "@/services/heliusService";

// ─── Safety Score Heuristic ──────────────────────────────────────────────────

function computeSafetyScore(volume24h: number, change24h: number, liquidity: number): number {
    let score = 50;
    if (volume24h > 1_000_000) score += 20;
    if (change24h > 0) score += 10;
    if (liquidity < 50_000) score -= 20;
    return Math.max(0, Math.min(100, score));
}

// ─── Trending Tokens ─────────────────────────────────────────────────────────

export const dashboardService = {
    getTrendingTokens: async (limit = 8): Promise<Token[]> => {
        const raw = await dexscreenerService.getTrendingTokens(limit);
        return raw.map((t) => ({
            id: t.id,
            address: t.address || t.id,
            symbol: t.symbol,
            name: t.name || t.symbol,
            price: t.price,
            change24h: parseFloat(t.change24h.toFixed(2)),
            volume24h: t.volume24h,
            marketCap: 0,
            logoUrl: t.logoUrl || "",
            chain: "solana" as const,
            safetyScore: computeSafetyScore(t.volume24h, t.change24h, t.liquidity),
        }));
    },

    // ─── Live Activity ──────────────────────────────────────────────────────────

    getLiveActivity: async (): Promise<TradeActivity[]> => {
        const txs: HeliusTransaction[] = await heliusService.getRecentTransactions();

        return txs
            .filter((tx) => tx.feePayer && tx.timestamp)
            .map((tx, index) => {
                let usdValue = 0;
                let tokenSymbol = "SOL";
                let amountStr = "0";

                // 1. Prioritize Native SOL transfers if present
                if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
                    const solValue = tx.nativeTransfers[0].amount / 1_000_000_000;
                    usdValue = solValue * 150; // estimate $150/SOL
                    amountStr = solValue.toFixed(2);
                }
                // 2. Fallback to SPL Token transfers
                else if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
                    const tt = tx.tokenTransfers[0];
                    // Assume 6 decimals as a generic heuristic for stablecoins/memecoins
                    // (Real USD estimation requires an oracle like Pyth or Jupiter)
                    const tokenAmt = tt.tokenAmount / 1_000_000;

                    // If it looks like USDC/USDT mint
                    if (tt.mint === "EPjFW36DP7mVQC7i57K6BgnUpWMT8Dz6enwbp9z96Utm" || tt.mint === "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB") {
                        usdValue = tokenAmt;
                        tokenSymbol = tt.mint === "EPjFW36DP7mVQC7i57K6BgnUpWMT8Dz6enwbp9z96Utm" ? "USDC" : "USDT";
                    } else {
                        usdValue = tokenAmt * 0.1; // fallback unknown token price
                        tokenSymbol = tt.mint.slice(0, 4).toUpperCase();
                    }
                    amountStr = tokenAmt.toFixed(2);
                }

                const isWhale = usdValue > 5_000;     // Lowered from $10k to $5k for more data
                const isSmartMoney = usdValue > 10_000; // Lowered from $50k to $10k

                const wallet = tx.feePayer
                    ? `${tx.feePayer.slice(0, 4)}...${tx.feePayer.slice(-4)}`
                    : "Unknown";

                return {
                    id: tx.signature ?? String(index),
                    type: isWhale ? ("whale_move" as const) : ("buy" as const),
                    tokenSymbol,
                    amount: parseFloat(amountStr),
                    value: parseFloat(usdValue.toFixed(2)),
                    wallet,
                    timestamp: new Date((tx.timestamp ?? Date.now() / 1000) * 1000),
                    isSmartMoney,
                };
            });
    },

    // ─── Market Overview ─────────────────────────────────────────────────────────

    getMarketOverview: async (): Promise<MarketCoin[]> => {
        return coingeckoService.getMarketOverview();
    },
};

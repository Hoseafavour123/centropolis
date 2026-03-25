/**
 * ============================================================================
 * DEXSCREENER SERVICE
 * ============================================================================
 * Fetches trending Solana tokens from the DexScreener public API.
 * Strategy:
 *   1. Hit the /token-boosts/top/v1 endpoint to get currently promoted Solana
 *      tokens (these are the real "trending" ones on DexScreener).
 *   2. Hydrate those addresses with live pair data (price, volume, liquidity).
 *   3. Fallback: search for high-volume SOL/USDC pairs if the boost list is empty.
 * ============================================================================
 */

import axios from "axios";

const DEXSCREENER_SEARCH_API = "https://api.dexscreener.com/latest/dex/search";
const DEXSCREENER_BOOST_API = "https://api.dexscreener.com/token-boosts/top/v1";

export interface DexScreenerToken {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    volume24h: number;
    liquidity: number;
}

interface DexScreenerPair {
    pairAddress: string;
    chainId: string;
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    priceUsd: string;
    priceChange: {
        h24: number;
    };
    volume: {
        h24: number;
    };
    liquidity: {
        usd: number;
    };
}

interface BoostedToken {
    tokenAddress: string;
    chainId: string;
    url: string;
    icon?: string;
}

export const dexscreenerService = {
    /**
     * Fetch trending Solana tokens.
     * Uses the DexScreener boost/trending endpoint to get real trending tokens,
     * then hydrates with live pair data. Falls back to search if needed.
     *
     * @param limit - max tokens to return (default 20 for "View All", 8 for dashboard)
     */
    getTrendingTokens: async (limit = 20): Promise<DexScreenerToken[]> => {
        try {
            // ── Step 1: Get the top boosted Solana token addresses ────────────
            const { data: boosted } = await axios.get<BoostedToken[]>(
                DEXSCREENER_BOOST_API,
                { timeout: 10_000 }
            );

            const solanaAddresses = (boosted ?? [])
                .filter((t) => t.chainId === "solana")
                .slice(0, limit)
                .map((t) => t.tokenAddress);

            // ── Step 2: Hydrate with live pair data ───────────────────────────
            if (solanaAddresses.length > 0) {
                const chunks: DexScreenerPair[] = [];
                // DexScreener tokens endpoint accepts up to 30 comma-separated addresses
                for (let i = 0; i < solanaAddresses.length; i += 30) {
                    const batch = solanaAddresses.slice(i, i + 30).join(",");
                    const { data } = await axios.get<{ pairs: DexScreenerPair[] }>(
                        `https://api.dexscreener.com/latest/dex/tokens/${batch}`,
                        { timeout: 10_000 }
                    );
                    chunks.push(...(data.pairs ?? []));
                }

                // De-duplicate: keep the highest-volume pair per token address
                const seen = new Set<string>();
                const pairs = chunks
                    .filter(
                        (p) =>
                            p.chainId === "solana" &&
                            p.priceUsd &&
                            (p.liquidity?.usd ?? 0) > 0
                    )
                    .sort((a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0))
                    .filter((p) => {
                        const key = p.baseToken.address;
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    })
                    .slice(0, limit);

                if (pairs.length > 0) {
                    return pairs.map((pair) => ({
                        id: pair.pairAddress,
                        symbol: pair.baseToken.symbol,
                        name: pair.baseToken.name,
                        price: parseFloat(pair.priceUsd) || 0,
                        change24h: pair.priceChange?.h24 ?? 0,
                        volume24h: pair.volume?.h24 ?? 0,
                        liquidity: pair.liquidity?.usd ?? 0,
                    }));
                }
            }

            // ── Fallback: high-volume Solana pairs search ─────────────────────
            const { data: fallback } = await axios.get<{ pairs: DexScreenerPair[] }>(
                `${DEXSCREENER_SEARCH_API}?q=SOL%2FUSDC`,
                { timeout: 10_000 }
            );

            const fallbackPairs = (fallback.pairs ?? [])
                .filter(
                    (pair) =>
                        pair.chainId === "solana" &&
                        (pair.liquidity?.usd ?? 0) > 0 &&
                        (pair.volume?.h24 ?? 0) > 0 &&
                        pair.priceUsd
                )
                .sort((a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0))
                .slice(0, limit);

            return fallbackPairs.map((pair) => ({
                id: pair.pairAddress,
                symbol: pair.baseToken.symbol,
                name: pair.baseToken.name,
                price: parseFloat(pair.priceUsd) || 0,
                change24h: pair.priceChange?.h24 ?? 0,
                volume24h: pair.volume?.h24 ?? 0,
                liquidity: pair.liquidity?.usd ?? 0,
            }));
        } catch (error) {
            console.error("[dexscreenerService] getTrendingTokens error:", error);
            return [];
        }
    },
};

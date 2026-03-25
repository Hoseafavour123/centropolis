/**
 * ============================================================================
 * COINGECKO SERVICE
 * ============================================================================
 * Fetches BTC, ETH, SOL market overview from the CoinGecko public API.
 * Uses axios (consistent with the rest of the codebase) to avoid
 * Next.js extended fetch timeouts.
 * ============================================================================
 */

import axios from "axios";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export interface MarketCoin {
    symbol: string;
    price: number;
    change: number;
}

interface CoinGeckoMarketEntry {
    id: string;
    symbol: string;
    current_price: number;
    price_change_percentage_24h: number;
}

export const coingeckoService = {
    /**
     * Fetch current price and 24h change for BTC, ETH, and SOL.
     */
    getMarketOverview: async (): Promise<MarketCoin[]> => {
        try {
            const { data } = await axios.get<CoinGeckoMarketEntry[]>(
                `${COINGECKO_API}/coins/markets`,
                {
                    params: {
                        vs_currency: "usd",
                        ids: "bitcoin,ethereum,solana",
                        order: "market_cap_desc",
                        per_page: 3,
                        page: 1,
                    },
                    timeout: 10_000,
                }
            );

            return data.map((coin) => ({
                symbol: coin.symbol.toUpperCase(),
                price: coin.current_price,
                change: parseFloat((coin.price_change_percentage_24h ?? 0).toFixed(2)),
            }));
        } catch (error) {
            console.error("[coingeckoService] getMarketOverview error:", error);
            return [];
        }
    },
};

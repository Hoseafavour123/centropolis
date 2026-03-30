/**
 * ============================================================================
 * DEXSCREENER SERVICE
 * ============================================================================
 * Description: Fetches real-time pair data for a given token address.
 * ============================================================================
 */

export interface DexScreenerPair {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    quoteToken: {
        address: string;
        name: string;
        symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    txns: {
        m5: { buys: number; sells: number };
        h1: { buys: number; sells: number };
        h6: { buys: number; sells: number };
        h24: { buys: number; sells: number };
    };
    volume: {
        h24: number;
        h6: number;
        h1: number;
        m5: number;
    };
    priceChange: {
        m5: number;
        h1: number;
        h6: number;
        h24: number;
    };
    liquidity?: {
        usd: number;
        base: number;
        quote: number;
    };
    pairCreatedAt?: number;
}

export interface DexScreenerResponse {
    schemaVersion: string;
    pairs: DexScreenerPair[] | null;
}

export const dexScreenerService = {
    /**
     * Fetch all pairs for a specific token address
     */
    async getTokenPairs(address: string): Promise<DexScreenerPair[]> {
        const url = `https://api.dexscreener.com/latest/dex/tokens/${address}`;

        try {
            const response = await fetch(url, {
                next: { revalidate: 30 } // 30 second cache
            });

            if (!response.ok) {
                throw new Error(`DexScreener API error: ${response.status}`);
            }

            const data: DexScreenerResponse = await response.json();
            return data.pairs || [];
        } catch (error) {
            console.error("Error fetching from DexScreener:", error);
            throw error;
        }
    }
};
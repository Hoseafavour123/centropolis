import axios from 'axios';

export interface DexScreenerMarketData {
    priceUsd: number;
    volume24h: number;
    liquidity: number;
    change24h: number;
}

export const dexscreenerTokenService = {
    /**
     * Fetch token market data from DexScreener.
     */
    getTokenMarketData: async (address: string): Promise<Partial<DexScreenerMarketData>> => {
        try {
            const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${address}`, { timeout: 15000 });
            const pairs = response.data.pairs || [];
            if (pairs.length === 0) return {};

            // Find the best Solana pair (filtered by volume)
            const solanaPair = pairs
                .filter((p: any) => p.chainId === "solana")
                .sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))[0] || pairs[0];

            return {
                priceUsd: parseFloat(solanaPair.priceUsd) || 0,
                volume24h: solanaPair.volume?.h24 || 0,
                liquidity: solanaPair.liquidity?.usd || 0,
                change24h: solanaPair.priceChange?.h24 || 0,
            };
        } catch (error) {
            console.error('[dexscreenerTokenService] getTokenMarketData error:', error);
            return {};
        }
    }
};

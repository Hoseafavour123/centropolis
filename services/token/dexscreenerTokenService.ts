import axios from 'axios';

export interface DexScreenerMarketData {
    priceUsd: number;
    volume24h: number;
    liquidity: number;
    change24h: number;
}

export const dexscreenerTokenService = {
    getTokenMarketData: async (address: string): Promise<Partial<DexScreenerMarketData>> => {
        let retries = 2;
        while (retries >= 0) {
            try {
                const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${address}`, { timeout: 10000 });
                const pairs = response.data.pairs || [];
                if (pairs.length === 0) return {};

                const solanaPair = pairs
                    .filter((p: any) => p.chainId === "solana")
                    .sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))[0] || pairs[0];

                return {
                    priceUsd: parseFloat(solanaPair.priceUsd) || 0,
                    volume24h: solanaPair.volume?.h24 || 0,
                    liquidity: solanaPair.liquidity?.usd || 0,
                    change24h: solanaPair.priceChange?.h24 || 0,
                };
            } catch (error: any) {
                if ((error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') && retries > 0) {
                    console.warn(`[dexscreenerTokenService] Retrying fetch due to ${error.code}...`);
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }
                console.error('[dexscreenerTokenService] getTokenMarketData error:', error.message);
                return {};
            }
        }
        return {};
    }
};

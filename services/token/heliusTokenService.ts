import axios from 'axios';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export interface HeliusMetadata {
    symbol: string;
    name: string;
    decimals: number;
    totalSupply: string;
    logoUrl?: string;
    mintAuthority?: string | null;
    freezeAuthority?: string | null;
}

export const heliusTokenService = {
    getTokenMetadata: async (address: string): Promise<Partial<HeliusMetadata>> => {
        let retries = 2;
        while (retries >= 0) {
            try {
                const response = await axios.post(HELIUS_RPC_URL, {
                    jsonrpc: "2.0",
                    id: "token-meta",
                    method: "getAsset",
                    params: { id: address }
                }, { timeout: 10000 });

                const asset = response.data.result;
                if (!asset) return {};

                const metadata = asset.content?.metadata || {};
                const links = asset.content?.links || {};

                return {
                    symbol: metadata.symbol || asset.token_info?.symbol,
                    name: metadata.name || asset.token_info?.name,
                    decimals: asset.token_info?.decimals,
                    totalSupply: asset.token_info?.supply,
                    logoUrl: links.image || asset.content?.files?.[0]?.uri,
                    mintAuthority: asset.token_info?.mint_authority,
                    freezeAuthority: asset.token_info?.freeze_authority,
                };
            } catch (error: any) {
                if ((error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') && retries > 0) {
                    console.warn(`[heliusTokenService] Retrying metadata fetch due to ${error.code}...`);
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }
                console.error('[heliusTokenService] getTokenMetadata error:', error.message);
                return {};
            }
        }
        return {};
    },

    /**
     * Fetch token supply using Helius RPC.
     */
    getTokenSupply: async (address: string) => {
        let retries = 2;
        while (retries >= 0) {
            try {
                const response = await axios.post(HELIUS_RPC_URL, {
                    jsonrpc: "2.0",
                    id: "token-supply",
                    method: "getTokenSupply",
                    params: [address]
                }, { timeout: 10000 });

                const result = response.data.result?.value;
                if (!result) return null;

                return {
                    totalSupply: result.amount,
                    decimals: result.decimals,
                };
            } catch (error: any) {
                if ((error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') && retries > 0) {
                    console.warn(`[heliusTokenService] Retrying supply fetch due to ${error.code}...`);
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }
                console.error('[heliusTokenService] getTokenSupply error:', error.message);
                return null;
            }
        }
        return null;
    }
};

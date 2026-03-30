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
    /**
     * Fetch token metadata using Helius DAS API (getAsset).
     */
    getTokenMetadata: async (address: string): Promise<Partial<HeliusMetadata>> => {
        try {
            const response = await axios.post(HELIUS_RPC_URL, {
                jsonrpc: "2.0",
                id: "token-meta",
                method: "getAsset",
                params: { id: address }
            }, { timeout: 15000 });

            const asset = response.data.result;
            if (!asset) return {};

            const metadata = asset.content?.metadata || {};
            const links = asset.content?.links || {};
            const authorities = asset.authorities || [];

            return {
                symbol: metadata.symbol || asset.token_info?.symbol,
                name: metadata.name || asset.token_info?.name,
                decimals: asset.token_info?.decimals,
                totalSupply: asset.token_info?.supply,
                logoUrl: links.image || asset.content?.files?.[0]?.uri,
                mintAuthority: asset.token_info?.mint_authority,
                freezeAuthority: asset.token_info?.freeze_authority,
            };
        } catch (error) {
            console.error('[heliusTokenService] getTokenMetadata error:', error);
            return {};
        }
    },

    /**
     * Fetch token supply using Helius RPC.
     */
    getTokenSupply: async (address: string) => {
        try {
            const response = await axios.post(HELIUS_RPC_URL, {
                jsonrpc: "2.0",
                id: "token-supply",
                method: "getTokenSupply",
                params: [address]
            }, { timeout: 15000 });

            const result = response.data.result?.value;
            if (!result) return null;

            return {
                totalSupply: result.amount,
                decimals: result.decimals,
            };
        } catch (error) {
            console.error('[heliusTokenService] getTokenSupply error:', error);
            return null;
        }
    }
};
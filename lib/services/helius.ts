/**
 * ============================================================================
 * HELIUS SERVICE
 * ============================================================================
 * Description: Interacts with Helius RPC to fetch on-chain Solana data.
 * ============================================================================
 */

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export interface HeliusLargestAccount {
    address: string;
    amount: string;
    decimals: number;
    uiAmount: number;
    uiAmountString: string;
}

export interface TokenSupply {
    amount: string;
    decimals: number;
    uiAmount: number;
    uiAmountString: string;
}

export const heliusService = {
    /**
     * Fetch the largest token accounts for a given mint address
     */
    async getTokenLargestAccounts(mintAddress: string): Promise<HeliusLargestAccount[]> {
        if (!HELIUS_API_KEY) throw new Error("HELIUS_API_KEY is not configured");

        const response = await fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: "1",
                method: "getTokenLargestAccounts",
                params: [mintAddress]
            }),
            next: { revalidate: 60 } // 60 second cache
        });

        if (!response.ok) {
            throw new Error(`Helius RPC error: ${response.status}`);
        }

        const data = await response.json();
        return data.result?.value || [];
    },

    /**
     * Fetch the total supply for a given mint address
     */
    async getTokenSupply(mintAddress: string): Promise<TokenSupply> {
        if (!HELIUS_API_KEY) throw new Error("HELIUS_API_KEY is not configured");

        const response = await fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: "1",
                method: "getTokenSupply",
                params: [mintAddress]
            }),
            next: { revalidate: 60 }
        });

        if (!response.ok) {
            throw new Error(`Helius RPC error: ${response.status}`);
        }

        const data = await response.json();
        return data.result?.value;
    }
};
import axios from 'axios';

/**
 * ============================================================================
 * HELIUS SERVICE
 * ============================================================================
 * Description: Interacts with Helius API to fetch wallet data (balance, tokens, transactions).
 * ============================================================================
 */

const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL || `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

export const heliusService = {
    /**
     * Fetch SOL balance for a wallet address.
     */
    getWalletBalance: async (address: string) => {
        try {
            const response = await axios.post(HELIUS_RPC_URL, {
                jsonrpc: '2.0',
                id: '1',
                method: 'getBalance',
                params: [address],
            });
            // Returns balance in lamports, convert to SOL
            return response.data.result.value / 1_000_000_000;
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
            throw new Error('Failed to fetch wallet balance');
        }
    },

    /**
     * Fetch all fungible tokens for a wallet address using DAS API.
     */
    getTokenBalances: async (address: string) => {
        try {
            const response = await axios.post(HELIUS_RPC_URL, {
                jsonrpc: '2.0',
                id: '1',
                method: 'getAssetsByOwner',
                params: {
                    ownerAddress: address,
                    page: 1,
                    limit: 100,
                    displayOptions: {
                        showFungible: true,
                    },
                },
            });
            return response.data.result.items;
        } catch (error) {
            console.error('Error fetching token balances:', error);
            throw new Error('Failed to fetch token balances');
        }
    },

    /**
     * Fetch parsed transaction history for a wallet address.
     */
    getTransactionHistory: async (address: string) => {
        // Basic validation: Solana addresses are base58 and typically 32-44 chars
        if (!address || address.length < 32 || address.length > 44) {
            return [];
        }

        try {
            const response = await axios.get(
                `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${process.env.HELIUS_API_KEY}`
            );
            return response.data;
        } catch (error: any) {
            // Suppress 400 Bad Request which usually indicates an invalid address format
            if (error.response?.status === 400) {
                return [];
            }
            console.error('Error fetching transactions:', error.message || error);
            throw new Error('Failed to fetch transaction history');
        }
    },

    /**
     * Fetch recent on-chain transactions from popular Solana programs
     * (Jupiter Aggregator, Raydium, Orca) to power a live activity feed.
     * Falls back to an empty array on error.
     */
    getRecentTransactions: async (): Promise<HeliusTransaction[]> => {
        // Well-known Solana program wallets with constant activity
        const ACTIVE_ADDRESSES = [
            'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter v6
            '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium AMM
            '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP', // Orca Whirlpool
        ];

        const apiKey = process.env.HELIUS_API_KEY;
        if (!apiKey) {
            console.warn('[heliusService] HELIUS_API_KEY is not set');
            return [];
        }

        try {
            // Pick one address at random to vary the feed
            const address = ACTIVE_ADDRESSES[Math.floor(Math.random() * ACTIVE_ADDRESSES.length)];
            const response = await axios.get<HeliusTransaction[]>(
                `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}&limit=50`
            );
            return response.data ?? [];
        } catch (error) {
            console.error('[heliusService] getRecentTransactions error:', error);
            return [];
        }
    },
};

export interface HeliusTransaction {
    signature: string;
    timestamp: number;
    fee: number;
    feePayer: string;
    nativeTransfers?: {
        fromUserAccount: string;
        toUserAccount: string;
        amount: number; // lamports
    }[];
    tokenTransfers?: {
        mint: string;
        tokenAmount: number;
        fromUserAccount: string;
        toUserAccount: string;
    }[];
    type?: string;
    source?: string;
}

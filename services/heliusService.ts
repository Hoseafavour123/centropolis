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
        try {
            const response = await axios.get(
                `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${process.env.HELIUS_API_KEY}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw new Error('Failed to fetch transaction history');
        }
    },
};

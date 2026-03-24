import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useWalletStore } from '@/store/useWalletStore';

/**
 * ============================================================================
 * USE WALLET DATA HOOK
 * ============================================================================
 * Description: Fetches and caches Solana wallet data (balance, tokens, txs).
 * ============================================================================
 */

export const useWalletData = () => {
    const { walletAddress, isConnected } = useWalletStore();

    const balanceQuery = useQuery({
        queryKey: ['wallet-balance', walletAddress],
        queryFn: async () => {
            const { data } = await axios.get(`/api/wallet/balance?address=${walletAddress}`);
            return data.balance;
        },
        enabled: isConnected && !!walletAddress,
        staleTime: 30 * 1000, // 30 seconds
    });

    const tokensQuery = useQuery({
        queryKey: ['wallet-tokens', walletAddress],
        queryFn: async () => {
            const { data } = await axios.get(`/api/wallet/tokens?address=${walletAddress}`);
            return data.tokens;
        },
        enabled: isConnected && !!walletAddress,
        staleTime: 60 * 1000, // 60 seconds
    });

    const transactionsQuery = useQuery({
        queryKey: ['wallet-transactions', walletAddress],
        queryFn: async () => {
            const { data } = await axios.get(`/api/wallet/transactions?address=${walletAddress}`);
            return data.transactions;
        },
        enabled: isConnected && !!walletAddress,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    return {
        balance: balanceQuery.data,
        tokens: tokensQuery.data,
        transactions: transactionsQuery.data,
        isLoading: balanceQuery.isLoading || tokensQuery.isLoading || transactionsQuery.isLoading,
        isError: balanceQuery.isError || tokensQuery.isError || transactionsQuery.isError,
        refetch: () => {
            balanceQuery.refetch();
            tokensQuery.refetch();
            transactionsQuery.refetch();
        },
    };
};

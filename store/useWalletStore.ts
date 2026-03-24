import { create } from 'zustand';

/**
 * ============================================================================
 * WALLET STORE (ZUSTAND)
 * ============================================================================
 * Description: Global state for the connected Solana wallet.
 * ============================================================================
 */

export interface WalletState {
    publicKey: string | null;
    isConnected: boolean;
    walletAddress: string | null;
    chain: "solana";
    connecting: boolean;

    // Actions
    setWallet: (address: string) => void;
    disconnectWallet: () => void;
    setConnecting: (connecting: boolean) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
    publicKey: null,
    isConnected: false,
    walletAddress: null,
    chain: "solana",
    connecting: false,

    setWallet: (address) =>
        set({
            publicKey: address,
            isConnected: true,
            walletAddress: address,
            connecting: false,
        }),

    disconnectWallet: () =>
        set({
            publicKey: null,
            isConnected: false,
            walletAddress: null,
            connecting: false,
        }),

    setConnecting: (connecting) => set({ connecting }),
}));
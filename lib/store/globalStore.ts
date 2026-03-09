/**
 * ============================================================================
 * STATE MANAGEMENT (ZUSTAND)
 * ============================================================================
 * Description: Global UI state for wallet, theme, and sidebar.
 * ============================================================================
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GlobalState {
  // Wallet
  isConnected: boolean;
  walletAddress: string | null;
  connect: (address: string) => void;
  disconnect: () => void;

  // UI
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Chain
  selectedChain: "solana" | "ethereum" | "base";
  setChain: (chain: "solana" | "ethereum" | "base") => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      isConnected: false,
      walletAddress: null,
      connect: (address) => set({ isConnected: true, walletAddress: address }),
      disconnect: () => set({ isConnected: false, walletAddress: null }),

      sidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      selectedChain: "solana",
      setChain: (chain) => set({ selectedChain: chain }),
    }),
    {
      name: "centropolis-storage",
      partialize: (state) => ({ selectedChain: state.selectedChain }),
    },
  ),
);

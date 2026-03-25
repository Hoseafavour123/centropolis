"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { useEffect, useCallback } from "react";
import { useWalletStore } from "@/store/useWalletStore";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

/**
 * ============================================================================
 * WALLET CONNECT BUTTON
 * ============================================================================
 * Description: Standard Solana connection button that syncs with Prisma backend.
 * ============================================================================
 */

export function WalletConnectButton() {
    const { publicKey, connected } = useWallet();
    const { setWallet, disconnectWallet } = useWalletStore();
    const { user, isLoaded } = useUser();

    const syncWithBackend = useCallback(async (address: string) => {
        try {
            await axios.post("/api/wallet/connect", { address });
            console.log("Wallet synced with Prisma");
        } catch (error) {
            console.error("Failed to sync wallet with Prisma:", error);
        }
    }, []);

    useEffect(() => {
        if (connected && publicKey && isLoaded && user) {
            const address = publicKey.toBase58();
            setWallet(address);
            syncWithBackend(address);
        } else if (!connected) {
            disconnectWallet();
        }
    }, [connected, publicKey, isLoaded, user, setWallet, disconnectWallet, syncWithBackend]);

    return (
        <div className="wallet-adapter-btn-container">
            <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !rounded-lg !h-10 !px-4 !py-2 !transition-colors !text-sm !font-medium" />
        </div>
    );
}

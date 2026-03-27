"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { useEffect, useCallback, useState } from "react";
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
    const { publicKey, connected, connecting } = useWallet();
    const { setWallet, disconnectWallet, setConnecting } = useWalletStore();
    const { user, isLoaded } = useUser();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync connecting state separately
    useEffect(() => {
        setConnecting(connecting);
    }, [connecting, setConnecting]);

    const syncWithBackend = useCallback(async (address: string) => {
        try {
            await axios.post("/api/wallet/connect", { address });
            console.log("Wallet synced with Prisma");
        } catch (error) {
            console.error("Failed to sync wallet with Prisma:", error);
        }
    }, []);

    useEffect(() => {
        if (connected && publicKey) {
            const address = publicKey.toBase58();
            setWallet(address);

            // Only sync with backend if we have a Clerk user session
            if (isLoaded && user) {
                syncWithBackend(address);
            }
        } else if (!connected && !connecting) {
            disconnectWallet();
        }
    }, [connected, connecting, publicKey, isLoaded, user, setWallet, disconnectWallet, syncWithBackend]);

    if (!mounted) {
        return (
            <div className="wallet-adapter-btn-container">
                <button className="wallet-adapter-button wallet-adapter-button-trigger !bg-primary hover:!bg-primary/90 !rounded-lg !h-10 !px-4 !py-2 !transition-colors !text-sm !font-medium" style={{ pointerEvents: 'none' }}>
                    Connect Wallet
                </button>
            </div>
        );
    }

    return (
        <div className="wallet-adapter-btn-container">
            <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !rounded-lg !h-10 !px-4 !py-2 !transition-colors !text-sm !font-medium" />
        </div>
    );
}

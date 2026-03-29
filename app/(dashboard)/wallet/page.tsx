"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWalletStore } from '@/store/useWalletStore';
import BalanceSummary from '@/components/wallet/BalanceSummary';
import PositionCards from '@/components/wallet/PositionCards';
import TxTimeline from '@/components/wallet/TxTimeline';

import { Suspense } from 'react';

function WalletContent() {
    const searchParams = useSearchParams();
    const queryAddress = searchParams.get('address');
    const { walletAddress: connectedAddress } = useWalletStore();

    const [targetAddress, setTargetAddress] = useState<string | null>(null);

    // Prioritize query parameter, then connected wallet
    useEffect(() => {
        const trackEvent = (eventName: string, payload: any) => {
            fetch('/api/telemetry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: eventName, payload }),
            }).catch(console.error);
        };

        if (queryAddress) {
            setTargetAddress(queryAddress);
            trackEvent('wallet_analysis_requested', { address: queryAddress });
        } else if (connectedAddress) {
            setTargetAddress(connectedAddress);
            trackEvent('wallet_connected', { address: connectedAddress });
        } else {
            setTargetAddress(null);
        }
    }, [queryAddress, connectedAddress]);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col pt-24">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-6">
                Wallet Viewer
            </h1>

            {!targetAddress ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-gray-400 mb-4">Connect your wallet or search an address to view holdings.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                    {/* Left: Chain Selector & Balances */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Networks</h3>
                            <button className="w-full flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl transition-colors hover:bg-purple-500/20">
                                <div className="flex items-center gap-3">
                                    <img src="/solana-logo.png" alt="Solana" className="w-6 h-6 rounded-full" onError={(e) => { e.currentTarget.src = 'https://cryptologos.cc/logos/solana-sol-logo.png'; }} />
                                    <span className="font-semibold text-white">Solana</span>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </button>
                        </div>
                    </div>

                    {/* Middle: Main Balances & Positions */}
                    <div className="lg:col-span-6 space-y-6">
                        <BalanceSummary address={targetAddress} />
                        <PositionCards address={targetAddress} />
                    </div>

                    {/* Right: Transactions Timeline */}
                    <div className="lg:col-span-3">
                        <TxTimeline address={targetAddress} />
                    </div>
                </div>
            )}
        </main>
    );
}

export default function WalletPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        }>
            <WalletContent />
        </Suspense>
    );
}

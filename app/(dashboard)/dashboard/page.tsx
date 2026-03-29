'use client';

// (Home / Trading Dashboard)
import { useEffect } from 'react';
import { HeroChart } from "@/features/dashboard/HeroChart";
import { SolanaDashboardCard } from "@/features/dashboard/SolanaDashboardCard";
import { TrendingGrid } from "@/features/dashboard/TrendingGrid";
import { LiveFeed } from "@/features/dashboard/LiveFeed";
import Link from 'next/link';
import { useRightPanelStore } from '@/store/useRightPanelStore';
import { RightTradePanel } from '@/components/Shared/RightTradePanel';
import { MarketOverview } from '@/components/Shared/MarketOverview';
import { WalletSnapshot } from '@/components/Shared/WalletSnapshot';
import { useTradeTokenStore } from '@/store/useTradeTokenStore';

const USDC_MINT = "EPjFW36DP7mVQC7i57K6BgnUpWMT8Dz6enwbp9z96Utm";

export default function DashboardPage() {
    const setRightPanel = useRightPanelStore((state) => state.setComponent);
    const selectedToken = useTradeTokenStore((state) => state.selectedToken);

    useEffect(() => {
        setRightPanel(
            <div className="space-y-6">
                <RightTradePanel
                    chain="solana"
                    fromToken="SOL"
                    toToken={selectedToken?.symbol || "USDC"}
                    toAddress={selectedToken?.mint || USDC_MINT}
                    amountUsd="0.1"
                />
                <MarketOverview />
                <WalletSnapshot />
            </div>
        );
        return () => setRightPanel(null);
    }, [setRightPanel, selectedToken]);

    return (
        <div className="space-y-6">
            {/* Top Section: Chart & AI */}
            <Link
                href="/test-hub"
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 text-sm font-medium hover:bg-amber-500/20 transition-colors"
            >
                🧪 Test Mock
            </Link>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <HeroChart />
                <div className="lg:col-span-1">
                    <SolanaDashboardCard />
                </div>
            </div>

            {/* Middle Section: Trending */}
            <TrendingGrid />

            {/* Bottom Section: Live Feed */}
            <LiveFeed />
        </div>
    );
}

'use client'

import {
    Bot,
    LineChart,
    Star,
    Bell,
    TrendingUp,
    Wallet,
    Zap,
    Search,
    ShieldCheck,
    FileDown,
} from 'lucide-react'

const FEATURES = [
    {
        icon: Bot,
        title: 'Sentinel Chat',
        desc: 'Ask in plain English. It calls real tools and streams the evidence.',
    },
    {
        icon: LineChart,
        title: 'Token pages',
        desc: 'Chart, holders, liquidity, safety — deep-dive any mint in one view.',
    },
    {
        icon: Wallet,
        title: 'Portfolio sync',
        desc: 'Connect your Solana wallet. See positions, PnL, and activity live.',
    },
    {
        icon: Star,
        title: 'Watchlists',
        desc: 'Pin tokens you care about. Sidebar, chat, and alerts stay in sync.',
    },
    {
        icon: TrendingUp,
        title: 'Trending feed',
        desc: 'New launches, smart-money buys, and community heat — refreshed daily.',
    },
    {
        icon: Bell,
        title: 'Smart alerts',
        desc: 'Price moves, score drops, whale trades. Ping, not spam.',
    },
    {
        icon: Zap,
        title: 'One-click swaps',
        desc: 'Jupiter-routed, slippage-aware, non-custodial. Sign from your wallet.',
    },
    {
        icon: ShieldCheck,
        title: 'Sentinel Score',
        desc: 'Every token scored 0–100 from on-chain signals. Red flags stop surprising you.',
    },
    {
        icon: Search,
        title: 'Universal search',
        desc: 'Tokens, addresses, wallets — all from the same keyboard-first bar.',
    },
    {
        icon: FileDown,
        title: 'Export everything',
        desc: 'Download chat history, analyses, and trade records as JSON. Your data, your rails.',
    },
]

export function Features() {
    return (
        <section id="features" className="relative border-t border-white/5 py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="max-w-2xl mb-10">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-3">
                        Everything in one place
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-tight">
                        Built for the whole trade, not just the quote.
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-white/5 border border-white/5 rounded-lg overflow-hidden">
                    {FEATURES.map((f) => (
                        <div
                            key={f.title}
                            className="bg-[#0b0b12] p-5 hover:bg-white/[0.02] transition-colors flex flex-col gap-2"
                        >
                            <f.icon className="w-4 h-4 text-white/55" />
                            <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                            <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

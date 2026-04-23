'use client'

import {
    Bot,
    ShieldCheck,
    TrendingUp,
    Wallet,
    Zap,
    Star,
    Search,
    FileSearch,
    Users,
    Activity,
} from 'lucide-react'

const PROMPTS: { icon: any; text: string }[] = [
    { icon: ShieldCheck, text: 'Analyze BONK for rug risk' },
    { icon: Wallet, text: 'Show my portfolio breakdown' },
    { icon: TrendingUp, text: "What's trending on Solana right now?" },
    { icon: Zap, text: 'Quote 1 SOL to USDC' },
    { icon: Users, text: 'Who are the top 10 holders of WIF?' },
    { icon: FileSearch, text: 'Pull recent transactions for this wallet' },
    { icon: Star, text: 'Add JUP to my watchlist' },
    { icon: Search, text: 'Find tokens like PONKE' },
    { icon: Activity, text: 'Is this liquidity safe to swap through?' },
    { icon: ShieldCheck, text: 'Check mint authority on this token' },
]

export function PromptMarquee() {
    // Duplicate the list so the CSS translateX(-50%) produces an infinite seam.
    const row = [...PROMPTS, ...PROMPTS]
    const rowReverse = [...PROMPTS.slice().reverse(), ...PROMPTS.slice().reverse()]

    return (
        <section className="relative border-t border-white/5 py-20 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10">
                <div className="max-w-2xl">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-3">
                        Ask the Sentinel
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-tight">
                        Plain English in. Real answers out.
                    </h2>
                    <p className="text-sm text-white/55 mt-2">
                        Paste an address, name a token, or just type what you want. Sentinel picks
                        the tools, runs them, and brings back a card you can act on.
                    </p>
                </div>
            </div>

            <div className="space-y-3 mask-fade-x">
                <MarqueeRow items={row} className="animate-marquee" />
                <MarqueeRow items={rowReverse} className="animate-marquee-reverse" />
            </div>
        </section>
    )
}

function MarqueeRow({
    items,
    className,
}: {
    items: { icon: any; text: string }[]
    className: string
}) {
    return (
        <div className="flex overflow-hidden">
            <div className={`flex gap-3 shrink-0 px-1.5 ${className}`}>
                {items.map((p, i) => (
                    <div
                        key={`${p.text}-${i}`}
                        className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 whitespace-nowrap"
                    >
                        <Bot className="w-3 h-3 text-white/35 shrink-0" />
                        <span className="text-[11px] font-mono text-white/75">
                            &ldquo;{p.text}&rdquo;
                        </span>
                        <p.icon className="w-3 h-3 text-white/35 shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    )
}

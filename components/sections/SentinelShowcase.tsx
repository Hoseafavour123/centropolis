'use client'

import {
    ArrowRight,
    Bot,
    CheckCircle2,
    Sparkles,
    Zap,
    Terminal,
    ShieldCheck,
} from 'lucide-react'

export function SentinelShowcase() {
    return (
        <section
            id="sentinel-chat"
            className="relative border-t border-white/5 py-20"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid md:grid-cols-2 gap-10 items-start">
                    {/* Left: pitch */}
                    <div className="space-y-5">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                            The Sentinel
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-tight">
                            An AI that actually calls the tools — and shows you every step.
                        </h2>
                        <p className="text-sm text-white/60 leading-relaxed">
                            Sentinel isn\'t a chatbot with search access. Ask it a question and
                            watch it run the pipelines: rug detection, portfolio lookups, Jupiter
                            quotes. Every result lands as a card you can act on.
                        </p>

                        <ul className="space-y-2.5 pt-1">
                            {[
                                {
                                    icon: Terminal,
                                    text: 'One terminal for research, risk, portfolio, and execution',
                                },
                                {
                                    icon: Sparkles,
                                    text: 'Streams the exact tools it runs — no black box',
                                },
                                {
                                    icon: ShieldCheck,
                                    text: 'Sentinel Score warns you before you sign anything shady',
                                },
                                {
                                    icon: Zap,
                                    text: 'Swaps sign from your wallet — non-custodial, end to end',
                                },
                            ].map((f) => (
                                <li key={f.text} className="flex items-start gap-2.5 text-sm text-white/75">
                                    <f.icon className="w-4 h-4 text-white/50 mt-0.5 shrink-0" />
                                    {f.text}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: terminal mockup */}
                    <div className="rounded-lg border border-white/10 bg-[#0b0b12] overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-500/70" />
                                <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
                                <span className="w-2 h-2 rounded-full bg-green-500/70" />
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-white/45">
                                <Bot className="w-3 h-3" /> sentinel-chat
                            </div>
                            <span className="text-[9px] uppercase tracking-wider text-white/30">demo</span>
                        </div>

                        <div className="p-4 space-y-3 text-sm">
                            {/* User */}
                            <div className="flex gap-2 justify-end">
                                <div className="max-w-[82%] rounded-lg rounded-tr-sm border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-white/90">
                                    Analyze BONK and quote 0.5 SOL into it
                                </div>
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-semibold">
                                    U
                                </div>
                            </div>

                            {/* Assistant — tool call: analyze */}
                            <div className="flex gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-500/80 flex items-center justify-center shrink-0">
                                    <Bot className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="inline-flex items-center gap-1.5 text-[10px] text-white/60 border border-white/10 rounded-full px-2 py-0.5 font-mono">
                                        <Sparkles className="w-2.5 h-2.5" /> analyze_token
                                    </div>
                                    <div className="rounded-md border border-white/10 bg-white/[0.02] p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[9px] font-bold text-black">
                                                    B
                                                </span>
                                                <div>
                                                    <div className="text-xs font-semibold">BONK</div>
                                                    <div className="text-[9px] text-white/40">liquidity $18.4M</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] text-white/40">Sentinel</div>
                                                <div className="text-lg font-mono font-semibold text-emerald-400 leading-none">
                                                    78
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                            {[
                                                'Contract verified',
                                                'LP locked 24 mo',
                                                'Top 10 holders 42%',
                                                'Volume +38% (24h)',
                                            ].map((r) => (
                                                <div
                                                    key={r}
                                                    className="flex items-center gap-1.5 rounded border border-white/5 bg-white/[0.02] px-1.5 py-1"
                                                >
                                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                                    <span className="text-white/65">{r}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Assistant — tool call: quote */}
                            <div className="flex gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-500/80 flex items-center justify-center shrink-0">
                                    <Bot className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="inline-flex items-center gap-1.5 text-[10px] text-white/60 border border-white/10 rounded-full px-2 py-0.5 font-mono">
                                        <Zap className="w-2.5 h-2.5" /> prepare_swap
                                    </div>
                                    <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
                                        <div className="flex items-center justify-between text-xs mb-2">
                                            <span className="font-mono text-white/70">0.5 SOL</span>
                                            <ArrowRight className="w-3 h-3 text-white/35" />
                                            <span className="font-mono text-amber-300">~2.41M BONK</span>
                                            <span className="text-[9px] text-white/35">Jupiter · 0.5%</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button className="flex-1 inline-flex items-center justify-center gap-1 rounded bg-white text-black text-[10px] font-semibold py-1.5">
                                                <Zap className="w-2.5 h-2.5" /> Execute
                                            </button>
                                            <button className="inline-flex items-center justify-center rounded border border-white/15 bg-white/[0.02] text-white/75 text-[10px] px-2">
                                                Watchlist
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

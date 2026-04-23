'use client'

import { ShieldCheck, Sparkles, Zap } from 'lucide-react'

const PILLARS = [
    {
        icon: ShieldCheck,
        title: 'Know what you\'re holding',
        body:
            'Every token gets a Sentinel Score from on-chain signals — contract flags, liquidity depth, holder concentration. Red flags stop being invisible.',
        accent: 'text-emerald-400',
    },
    {
        icon: Sparkles,
        title: 'Ask instead of click',
        body:
            'Chat with Sentinel like it\'s an analyst on your desk. It calls the same tools you would — portfolio lookups, rug checks, swap quotes — and shows its work.',
        accent: 'text-indigo-400',
    },
    {
        icon: Zap,
        title: 'Trade without tab-switching',
        body:
            'Swap straight from chat, from the dashboard, or from a token page. Jupiter-routed, non-custodial, and always double-checked against your Sentinel score.',
        accent: 'text-amber-400',
    },
]

export function WhatItDoes() {
    return (
        <section className="relative border-t border-white/5 py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="max-w-2xl mb-12">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-3">
                        What Binocs does
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-tight">
                        Three things, done well — so you stop juggling six tabs.
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-lg overflow-hidden">
                    {PILLARS.map((p) => (
                        <div
                            key={p.title}
                            className="bg-[#0b0b12] p-6 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors"
                        >
                            <p.icon className={`w-5 h-5 ${p.accent}`} />
                            <h3 className="text-base font-semibold text-white">{p.title}</h3>
                            <p className="text-sm text-white/55 leading-relaxed">{p.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

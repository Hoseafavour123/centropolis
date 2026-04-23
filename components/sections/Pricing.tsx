'use client'

import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { PLAN_LIMITS } from '@/lib/billing/limits'

interface PricingPlan {
    id: 'FREE' | 'PRO' | 'WHALE'
    name: string
    tagline: string
    cta: string
    href: string
    popular?: boolean
    features: string[]
}

function fmt(n: number) {
    if (n === -1) return 'Unlimited'
    return n.toLocaleString()
}

const PLANS: PricingPlan[] = [
    {
        id: 'FREE',
        name: 'Free',
        tagline: 'Poke around. See if the Sentinel earns a seat on your desk.',
        cta: 'Start free',
        href: '/sign-up',
        features: [
            `${fmt(PLAN_LIMITS.FREE.maxAnalysesPerMonth)} AI analyses / month`,
            `${fmt(PLAN_LIMITS.FREE.maxChatsPerDay)} chat messages / day`,
            `${fmt(PLAN_LIMITS.FREE.maxWatchlistItems)} watchlist slots`,
            `${fmt(PLAN_LIMITS.FREE.maxApiKeys)} API key`,
            'Full trading with Jupiter routing',
            'Standard support',
        ],
    },
    {
        id: 'PRO',
        name: 'Pro',
        tagline: 'Built for the people who actually trade every day.',
        cta: 'Upgrade to Pro',
        href: '/sign-up',
        popular: true,
        features: [
            `${fmt(PLAN_LIMITS.PRO.maxAnalysesPerMonth)} AI analyses / month`,
            `${fmt(PLAN_LIMITS.PRO.maxChatsPerDay)} chat messages / day`,
            'Unlimited watchlist',
            `${fmt(PLAN_LIMITS.PRO.maxApiKeys)} API keys`,
            'Chat history export',
            'Priority support',
        ],
    },
    {
        id: 'WHALE',
        name: 'Whale',
        tagline: 'For desks, funds, and people who move markets.',
        cta: 'Go Whale',
        href: '/sign-up',
        features: [
            'Unlimited AI analyses',
            'Unlimited chats',
            'Unlimited watchlist',
            'Unlimited API keys',
            'Chat history export',
            'Dedicated account manager',
        ],
    },
]

export function Pricing() {
    return (
        <section id="pricing" className="relative border-t border-white/5 py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="max-w-2xl mb-10">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-3">
                        Pricing
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-tight">
                        Fair tiers. No surprise fees. Pay with USDC on Solana.
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {PLANS.map((plan) => {
                        const price = PLAN_LIMITS[plan.id].price
                        return (
                            <div
                                key={plan.id}
                                className={`relative rounded-lg border bg-[#0b0b12] p-6 flex flex-col ${plan.popular
                                    ? 'border-white/30'
                                    : 'border-white/10'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-2.5 left-6 inline-flex items-center rounded-full bg-white text-black text-[10px] font-semibold px-2 py-0.5">
                                        Most popular
                                    </div>
                                )}
                                <div className="flex items-baseline gap-2 mb-1">
                                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                                </div>
                                <p className="text-xs text-white/50 leading-relaxed mb-5">
                                    {plan.tagline}
                                </p>

                                <div className="flex items-baseline gap-1.5 mb-6">
                                    <span className="text-3xl font-semibold text-white">
                                        {price === 0 ? '$0' : `$${price}`}
                                    </span>
                                    <span className="text-xs text-white/45">/ month</span>
                                </div>

                                <Link
                                    href={plan.href}
                                    className={`inline-flex items-center justify-center gap-2 h-9 rounded-md text-sm font-medium transition-colors mb-6 ${plan.popular
                                        ? 'bg-white text-black hover:bg-white/90'
                                        : 'border border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06]'
                                        }`}
                                >
                                    {plan.cta}
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>

                                <ul className="space-y-2.5 text-sm">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2 text-white/70">
                                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                            <span className="text-[13px]">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}
                </div>

                <p className="text-[11px] text-white/40 mt-6">
                    Pay with USDC on Solana — no credit card, no subscription lock-in. Cancel any time.
                </p>
            </div>
        </section>
    )
}

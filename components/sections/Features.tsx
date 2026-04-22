'use client'

import { motion } from 'framer-motion'
import {
  Bot,
  LineChart,
  Star,
  Bell,
  TrendingUp,
  Wallet,
  Zap,
  Search,
} from 'lucide-react'
import { ScrollReveal } from '../effects/ScrollReveal'

const features = [
  {
    icon: Bot,
    title: 'Sentinel Chat',
    desc: 'A conversational assistant that calls real tools — rug checks, quotes, portfolio, swaps — and streams the results inline.',
    badge: 'AI',
  },
  {
    icon: LineChart,
    title: 'Token detail pages',
    desc: 'Deep-dive charts, holders, liquidity, and the full Sentinel Score breakdown for any token you research.',
    badge: 'Research',
  },
  {
    icon: Wallet,
    title: 'Portfolio tracking',
    desc: 'Connect your Solana wallet to see positions, PnL, and history — live-synced across the whole app.',
    badge: 'Portfolio',
  },
  {
    icon: Star,
    title: 'Watchlists',
    desc: 'Pin tokens you care about and jump back to them in one click from the sidebar or from chat.',
    badge: 'Tracking',
  },
  {
    icon: TrendingUp,
    title: 'Trending on Solana',
    desc: 'Surfaced daily — new launches, smart-money buys, and tokens heating up in community chatter.',
    badge: 'Discovery',
  },
  {
    icon: Bell,
    title: 'Smart notifications',
    desc: 'Get pinged on score changes, price moves, and watchlist events — quietly, without spam.',
    badge: 'Alerts',
  },
  {
    icon: Zap,
    title: 'One-click swaps',
    desc: 'Jupiter-routed, slippage-aware, non-custodial. Sign from your wallet right inside the chat.',
    badge: 'Execution',
  },
  {
    icon: Search,
    title: 'Universal search',
    desc: 'Find any token, address, or wallet from anywhere in the app — keyboard-driven and fast.',
    badge: 'UX',
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-indigo-400 font-semibold tracking-wider uppercase text-sm">
              Everything in one place
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6">
              One workspace for the{' '}
              <span className="text-gradient">whole trade</span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Research, risk, execution, and tracking — no more stitching together six apps to place
              a single trade.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.05}>
              <motion.div
                whileHover={{ y: -4 }}
                className="h-full rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:border-indigo-500/40 hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    <f.icon size={18} />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-white/40">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{f.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

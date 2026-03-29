'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Brain, Puzzle, TrendingDown } from 'lucide-react'
import { ScrollReveal } from '../effects/ScrollReveal'
import { GlassCard } from '../ui/GlassCard'

const problems = [
  {
    icon: Brain,
    title: "Information Overload",
    description: "Hundreds of new tokens daily, conflicting signals, complex on-chain data that takes hours to analyze.",
    color: "text-red-400",
  },
  {
    icon: Puzzle,
    title: "Fragmented Tools",
    description: "Juggling TradingView, Dune Analytics, Discord, and multiple exchanges just to make one trade.",
    color: "text-orange-400",
  },
  {
    icon: AlertTriangle,
    title: "Technical Barriers",
    description: "Existing tools require expertise. Nansen and Dune are powerful but have steep learning curves.",
    color: "text-yellow-400",
  },
  {
    icon: TrendingDown,
    title: "Costly Mistakes",
    description: "Rug pulls and scams cost retail traders billions annually. One mistake can wipe out your portfolio.",
    color: "text-pink-400",
  },
]

export function Problem() {
  return (
    <section id="problem" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-indigo-400 font-semibold tracking-wider uppercase text-sm">
              The Problem
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6">
              Trading Shouldn't Be This{' '}
              <span className="text-red-400">Hard</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Retail traders are fighting an uphill battle against information overload 
              and sophisticated bad actors.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {problems.map((problem, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <GlassCard className="h-full group">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-white/5 ${problem.color}`}>
                    <problem.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-indigo-400 transition-colors">
                      {problem.title}
                    </h3>
                    <p className="text-white/60 leading-relaxed">
                      {problem.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Stats */}
        <ScrollReveal delay={0.4}>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "$2.8B", label: "Lost to scams annually" },
              { value: "50K+", label: "Daily active traders" },
              { value: "6+", label: "Apps needed per trade" },
              { value: "4hrs", label: "Avg. research time" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
                whileHover={{ scale: 1.05, borderColor: 'rgba(99,102,241,0.5)' }}
              >
                <div className="text-3xl sm:text-4xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
'use client'

import { motion } from 'framer-motion'
import { Bot, ShieldCheck, Zap, MessageSquare } from 'lucide-react'
import { ScrollReveal } from '../effects/ScrollReveal'
import { GlassCard } from '../ui/GlassCard'

const features = [
  {
    icon: Bot,
    title: "The Sentinel AI",
    description: "Analytical AI that analyzes any token in seconds. Just type a name or address.",
    highlight: "Rug detection • Technical analysis • Whale tracking",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Zap,
    title: "One-Click Execution",
    description: "Integrated with Jupiter for best price routing. Execute trades without leaving the chat.",
    highlight: "MEV protection • Slippage optimization • Instant swaps",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: MessageSquare,
    title: "Social Intelligence",
    description: "Real-time trending tokens and community sentiment. Discover alpha before it pumps.",
    highlight: "Trending searches • Query velocity • Smart money",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: ShieldCheck,
    title: "Safety First",
    description: "Every token gets a 1-100 safety score. Clear risk indicators protect your capital.",
    highlight: "Contract audits • Liquidity checks • Holder analysis",
    color: "from-green-500 to-emerald-500",
  },
]

export function Solution() {
  return (
    <section id="solution" className="relative py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-cyan-400 font-semibold tracking-wider uppercase text-sm">
              The Solution
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6">
              The <span className="text-gradient">Binocs</span> Blueprint
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Binocs combines AI analysis, instant execution, and social intelligence
              into a unified, chat-based interface.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <ScrollReveal key={i} delay={i * 0.15}>
              <GlassCard className="h-full relative overflow-hidden group">
                {/* Gradient border on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="text-white" size={24} />
                  </div>

                  <h3 className="text-2xl font-bold mb-3 text-white">
                    {feature.title}
                  </h3>

                  <p className="text-white/70 mb-4 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {feature.highlight.split(' • ').map((item, j) => (
                      <span
                        key={j}
                        className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Interactive Demo Preview */}
        <ScrollReveal delay={0.4} >
          <motion.div
            className="hidden mt-16 relative rounded-3xl overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="hidden absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20" />
            <div className="relative bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 p-8 md:p-12">
              <div className="grid md:grid-cols-1 gap-8 items-center">
                <div>
                  <h3 className="text-3xl font-bold mb-4">
                    Experience the{' '}
                    <span className="text-gradient">Sentinel</span>
                  </h3>
                  <p className="text-white/60 mb-6">
                    Get instant analysis. Execute immediately.
                    No more tab switching. No more missed opportunities.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Natural language queries",
                      "Real-time safety scores",
                      "Integrated Jupiter swaps",
                      "Social sentiment tracking"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/80">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                          <span className="text-green-400 text-xs">✓</span>
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* <div className="hidden relative">
                  <div className="bg-[#0f0f1a] rounded-2xl p-6 border border-white/10 font-mono text-sm shadow-2xl">
                    <div className="flex items-center gap-2 mb-4 text-white/40 text-xs">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500/60" />
                        <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
                        <span className="w-2 h-2 rounded-full bg-green-500/60" />
                      </div>
                      <span>sentinel-chat</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                          U
                        </div>
                        <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-2 text-white/90">
                          analyze $BONK
                        </div>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <div className="bg-indigo-600/30 rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]">
                          <p className="text-cyan-400 font-semibold mb-1">Safety Score: 78/100 ✅</p>
                          <p className="text-white/80 text-xs space-y-1">
                            • Contract verified, liquidity locked<br/>
                            • RSI oversold on 4h (buy signal)<br/>
                            • Whale bought $50K 2 mins ago<br/>
                            • Social mentions +40% (24h)
                          </p>
                          <div className="mt-3 flex gap-2">
                            <button className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs">
                              Buy $100
                            </button>
                            <button className="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-xs">
                              Track
                            </button>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                          <Bot size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  )
}
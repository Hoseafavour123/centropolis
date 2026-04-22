'use client'

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

      </div>
    </section>
  )
}
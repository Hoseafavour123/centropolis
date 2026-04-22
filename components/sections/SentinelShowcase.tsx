'use client'

import { motion } from 'framer-motion'
import {
  Bot,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Zap,
  Sparkles,
  MessageSquare,
  Terminal,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { ScrollReveal } from '../effects/ScrollReveal'

const capabilities = [
  {
    icon: ShieldCheck,
    title: 'Rug-check any token',
    prompt: '"Analyze BONK for rug risk"',
    color: 'text-emerald-300',
    tint: 'bg-emerald-500/10 border-emerald-500/30',
  },
  {
    icon: Wallet,
    title: 'Inspect your portfolio',
    prompt: '"Show my portfolio performance"',
    color: 'text-indigo-300',
    tint: 'bg-indigo-500/10 border-indigo-500/30',
  },
  {
    icon: TrendingUp,
    title: 'Find what’s moving',
    prompt: '"What’s trending on Solana right now?"',
    color: 'text-cyan-300',
    tint: 'bg-cyan-500/10 border-cyan-500/30',
  },
  {
    icon: Zap,
    title: 'Quote & execute swaps',
    prompt: '"Quote 1 SOL to USDC and execute"',
    color: 'text-yellow-300',
    tint: 'bg-yellow-500/10 border-yellow-500/30',
  },
]

const unique = [
  {
    icon: Terminal,
    title: 'One terminal, every workflow',
    body: 'Research, risk, portfolio, and execution collapse into a single chat — no tab-switching, no copy-pasting addresses.',
  },
  {
    icon: Sparkles,
    title: 'Tool-calling that shows its work',
    body: 'Sentinel streams the exact tools it runs and renders the results as live cards you can act on, not walls of text.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety-scored by default',
    body: 'Every token gets a 1–100 Sentinel Score. Low-score swaps trigger a warning before you sign anything.',
  },
  {
    icon: Zap,
    title: 'Sign in your wallet, not ours',
    body: 'Trades are Jupiter-routed and signed non-custodially from your connected wallet. Keys never leave your device.',
  },
]

export function SentinelShowcase() {
  return (
    <section
      id="sentinel-chat"
      className="relative py-32 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-600/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-indigo-200 bg-indigo-500/10 border border-indigo-500/30">
              <Bot size={14} />
              The Sentinel Chat Terminal
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-6">
              A trading assistant you can{' '}
              <span className="text-gradient">actually talk to</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Ask a question in plain English. Sentinel calls the right tools, returns the evidence, and
              lets you execute — all in a single streaming conversation.
            </p>
          </div>
        </ScrollReveal>

        {/* Live-looking terminal mock */}
        <ScrollReveal delay={0.1}>
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-cyan-500/40 rounded-3xl blur-2xl opacity-40" />
            <div className="relative rounded-2xl border border-white/10 bg-[#0b0b12]/90 backdrop-blur-xl shadow-2xl">
              {/* Window chrome */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Bot size={14} className="text-indigo-300" />
                  sentinel-chat
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">live demo</div>
              </div>

              <div className="p-5 sm:p-7 space-y-4">
                {/* User prompt */}
                <motion.div
                  className="flex gap-3 justify-end"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="max-w-[78%] rounded-2xl rounded-tr-sm px-4 py-2.5 bg-indigo-500/15 border border-indigo-500/30 text-sm text-white/90">
                    Analyze BONK and quote 0.5 SOL into it
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold shrink-0">
                    U
                  </div>
                </motion.div>

                {/* Assistant tool call: analyze */}
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="inline-flex items-center gap-2 text-[11px] text-cyan-200 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-2.5 py-1">
                      <Sparkles size={12} /> calling analyze_token
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs font-bold text-yellow-200">
                            B
                          </div>
                          <div>
                            <div className="text-sm font-semibold">BONK</div>
                            <div className="text-[10px] text-white/50">Solana • liquidity $18.4M</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-white/50">Sentinel Score</div>
                          <div className="text-2xl font-bold text-emerald-300">78</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {[
                          { label: 'Contract verified', ok: true },
                          { label: 'LP locked 24 mo', ok: true },
                          { label: 'Top 10 holders 42%', ok: true },
                          { label: 'Volume +38% (24h)', ok: true },
                        ].map((r) => (
                          <div
                            key={r.label}
                            className="flex items-center gap-2 rounded-md bg-white/[0.04] border border-white/5 px-2 py-1.5"
                          >
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            <span className="text-white/75">{r.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Assistant tool call: quote */}
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="inline-flex items-center gap-2 text-[11px] text-purple-200 bg-purple-500/10 border border-purple-500/30 rounded-full px-2.5 py-1">
                      <Zap size={12} /> calling get_swap_quote
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs">
                            0.5 SOL
                          </span>
                          <ArrowRight size={14} className="text-white/40" />
                          <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-200">
                            ~2.41M BONK
                          </span>
                        </div>
                        <span className="text-[10px] text-white/50">Jupiter route • 0.5% slippage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold px-3 py-1.5 shadow-lg shadow-indigo-500/30"
                        >
                          <Zap size={12} /> Execute swap
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 text-xs px-3 py-1.5"
                        >
                          Add to watchlist
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Streaming text */}
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="max-w-[78%] rounded-2xl rounded-tl-sm px-4 py-2.5 bg-white/[0.04] border border-white/10 text-sm text-white/85">
                    BONK looks healthy at a Sentinel Score of 78 — LP locked, contract verified,
                    and volume up 38% in the last 24h. Hit execute to swap at the quoted rate, or ask for a
                    lower-slippage route.
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Capability chips */}
        <ScrollReveal delay={0.2}>
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {capabilities.map((c) => (
              <div
                key={c.title}
                className={`rounded-xl border ${c.tint} p-4 flex items-start gap-3`}
              >
                <div className={`p-2 rounded-lg bg-black/30 ${c.color}`}>
                  <c.icon size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{c.title}</div>
                  <div className="text-[11px] text-white/50 mt-0.5 font-mono">{c.prompt}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Uniqueness grid */}
        <ScrollReveal delay={0.3}>
          <div className="mt-16 grid md:grid-cols-2 gap-4">
            {unique.map((u) => (
              <div
                key={u.title}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex gap-4"
              >
                <div className="p-2 h-fit rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  <u.icon size={18} />
                </div>
                <div>
                  <div className="text-base font-semibold text-white mb-1">{u.title}</div>
                  <p className="text-sm text-white/60 leading-relaxed">{u.body}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

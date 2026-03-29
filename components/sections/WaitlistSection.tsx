'use client'

import { motion } from 'framer-motion'
import { WaitlistForm } from '@/components/waitlist/WaitlistForm'
import { Sparkles, Users, Clock } from 'lucide-react'
import { ScrollReveal } from '../effects/ScrollReveal'

export function WaitlistSection() {
  return (
    <section id="waitlist" className="relative py-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={16} className="text-indigo-400" />
              <span className="text-sm text-indigo-300">Limited Early Access</span>
            </motion.div>

            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Join the{' '}
              <span className="text-gradient">Waitlist</span>
            </h2>
            <p className="text-xl text-white/60 max-w-xl mx-auto">
              Be among the first to experience the future of crypto trading.
              Early members receive lifetime benefits and exclusive features.
            </p>
          </div>
        </ScrollReveal>

        {/* Stats */}
        <ScrollReveal delay={0.2}>
          <div className="flex justify-center gap-8 mb-12">
            <div className="flex items-center gap-2 text-white/60">
              <Users size={20} className="text-cyan-400" />
              <span className="text-sm">2,400+ traders waiting</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Clock size={20} className="text-purple-400" />
              <span className="text-sm">Launching Q4 2026</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Custom Waitlist Form */}
        <ScrollReveal delay={0.3}>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            {/* Glow container */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl blur opacity-30" />

            <div className="relative bg-[#0f0f1a]/80 backdrop-blur-2xl rounded-2xl border border-white/10 p-8 md:p-12">
              <WaitlistForm />
            </div>
          </motion.div>
        </ScrollReveal>

        {/* Trust badges */}
        <ScrollReveal delay={0.4}>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/40">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              No spam, ever
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Early access benefits
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Unsubscribe anytime
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
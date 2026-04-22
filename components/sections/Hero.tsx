'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { Button } from '../ui/Btn'
import { GradientText } from '../ui/GradientText'

export function Hero() {
  const { isSignedIn } = useUser()
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-xs text-indigo-200">Introducing the Sentinel Chat Terminal</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Chat your way to{' '}
          <GradientText>smarter trades</GradientText>
          <br />
          <span className="text-white">on Solana</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Binocs turns token research into a conversation. Ask the Sentinel to analyze rugs,
          check your portfolio, or quote a swap — and execute without ever leaving the chat.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {isSignedIn ? (
            <>
              <Button href="/dashboard" size="lg" className="cursor-pointer flex items-center gap-2">
                Open dashboard <ArrowRight size={18} />
              </Button>
              <Button href="/sentinel" size="lg" variant="outline" className="cursor-pointer">
                Launch Sentinel Chat
              </Button>
            </>
          ) : (
            <>
              <Button href="/sign-up" size="lg" className="cursor-pointer flex items-center gap-2">
                Get started free <ArrowRight size={18} />
              </Button>
              <Button href="/sign-in" size="lg" variant="outline" className="cursor-pointer">
                Sign in
              </Button>
            </>
          )}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-green-400" />
            <span>Non-custodial</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" />
            <span>Built on Solana</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <span>Jupiter-routed swaps</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

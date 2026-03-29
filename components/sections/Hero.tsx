'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'
import { Button } from '../ui/Btn'
import { GradientText } from '../ui/GradientText'

export function Hero() {
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

        {/* Main Headline */}
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Trade with{' '}
          <GradientText>Intelligence</GradientText>
          <br />
          <span className="text-white">Not Information Overload</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Binocs combines AI-powered analysis with one-click execution.
          The first trading terminal that actually thinks for you.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button href="/waitlist" size="lg" className="cursor-pointer flex items-center gap-2">
            Join Waitlist
          </Button>
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
            <span>Bank-grade Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" />
            <span>Built on Solana</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <span>AI-Powered</span>
          </div>
        </motion.div>


      </div>
    </section>
  )
}
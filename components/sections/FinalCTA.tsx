'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { Button } from '../ui/Btn'
import { ScrollReveal } from '../effects/ScrollReveal'

export function FinalCTA() {
  const { isSignedIn } = useUser()
  return (
    <section id="get-started" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-glow" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/15 border border-indigo-500/30 mb-6"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Sparkles size={16} className="text-indigo-300" />
            <span className="text-sm text-indigo-200">Free to start • No credit card</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-5">
            Start trading with{' '}
            <span className="text-gradient">the Sentinel</span>
          </h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
            Create an account and you’ll land straight in the dashboard with Sentinel Chat ready to go.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isSignedIn ? (
              <>
                <Button
                  href="/dashboard"
                  size="lg"
                  className="cursor-pointer flex items-center gap-2"
                >
                  Go to dashboard <ArrowRight size={18} />
                </Button>
                <Button
                  href="/sentinel"
                  size="lg"
                  variant="outline"
                  className="cursor-pointer"
                >
                  Open Sentinel Chat
                </Button>
              </>
            ) : (
              <>
                <Button
                  href="/sign-up"
                  size="lg"
                  className="cursor-pointer flex items-center gap-2"
                >
                  Create your account <ArrowRight size={18} />
                </Button>
                <Button
                  href="/sign-in"
                  size="lg"
                  variant="outline"
                  className="cursor-pointer"
                >
                  I already have an account
                </Button>
              </>
            )}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-white/40">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Non-custodial wallet
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Jupiter-routed swaps
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Cancel anytime
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

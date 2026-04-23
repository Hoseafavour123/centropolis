'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { AppMockup } from '@/components/landing/AppMockup'

export function Hero() {
  const { isSignedIn } = useUser()

  return (
    <section className="relative pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/70 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          New · Sentinel Chat is live
          <span className="text-white/40">→</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-[64px] leading-[1.05] font-semibold tracking-tight text-white mb-5">
          A Solana terminal that<br className="hidden sm:block" />
          <span className="text-white/55"> actually does the homework.</span>
        </h1>

        <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-8 leading-relaxed">
          Research, risk-check, and trade Solana tokens from one place.
          Binocs runs the pipelines — you make the call.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 h-10 rounded-md bg-white text-black text-sm font-medium px-5 hover:bg-white/90 transition-colors"
              >
                Open dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sentinel"
                className="inline-flex items-center gap-2 h-10 rounded-md border border-white/15 bg-white/[0.03] text-white text-sm font-medium px-5 hover:bg-white/[0.06] transition-colors"
              >
                Launch Sentinel Chat
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 h-10 rounded-md bg-white text-black text-sm font-medium px-5 hover:bg-white/90 transition-colors"
              >
                Start free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 h-10 rounded-md border border-white/15 bg-white/[0.03] text-white text-sm font-medium px-5 hover:bg-white/[0.06] transition-colors"
              >
                Sign in
              </Link>
            </>
          )}
        </div>

        <p className="text-xs text-white/40 mb-12">
          Non-custodial · Jupiter-routed · no card required
        </p>

        {/* Product mockup */}
        <div id="product" className="relative">
          <div className="absolute inset-x-0 -top-8 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent blur-2xl -z-10" />
          <AppMockup />
        </div>
      </div>
    </section>
  )
}

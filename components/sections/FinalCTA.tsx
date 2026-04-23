'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

export function FinalCTA() {
    const { isSignedIn } = useUser()

    return (
        <section className="relative border-t border-white/5 py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight mb-4">
                    Ready to trade Solana with a little backup?
                </h2>
                <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">
                    Sign up in under a minute. Connect a wallet when you&apos;re ready.
                    Cancel whenever — your history is yours to keep.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {isSignedIn ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 h-10 rounded-md bg-white text-black text-sm font-medium px-5 hover:bg-white/90 transition-colors"
                            >
                                Go to dashboard <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/sentinel"
                                className="inline-flex items-center gap-2 h-10 rounded-md border border-white/15 bg-white/[0.03] text-white text-sm font-medium px-5 hover:bg-white/[0.06] transition-colors"
                            >
                                Open Sentinel Chat
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 h-10 rounded-md bg-white text-black text-sm font-medium px-5 hover:bg-white/90 transition-colors"
                            >
                                Create your account <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/sign-in"
                                className="inline-flex items-center gap-2 h-10 rounded-md border border-white/15 bg-white/[0.03] text-white text-sm font-medium px-5 hover:bg-white/[0.06] transition-colors"
                            >
                                I already have an account
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

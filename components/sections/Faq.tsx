'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

const FAQS: { q: string; a: string }[] = [
    {
        q: 'Do you hold my funds?',
        a: 'No. Binocs is fully non-custodial. You connect a Solana wallet (Phantom, Solflare, Backpack, etc.), and every trade is signed locally. We never see or touch your keys.',
    },
    {
        q: 'What can Sentinel actually do?',
        a: 'Sentinel runs real tools — not a search engine. It can score tokens for rug risk, pull your portfolio, fetch holders and recent transactions, quote Jupiter swaps, manage your watchlist, and prepare signable trades. Every tool call and result is streamed in the chat.',
    },
    {
        q: 'Which chains do you support?',
        a: 'Solana today. Ethereum and Base are on the roadmap — most of the plumbing (analytics, chat tools, rug scoring) is chain-abstract, so adding them is mostly a data-source question.',
    },
    {
        q: 'How is the Sentinel Score calculated?',
        a: 'A 0–100 blend of on-chain signals: contract flags (mint/freeze authority, immutable metadata), liquidity depth, holder concentration, 24h volume, and a few heuristics we\'re conservative about publishing. Every score comes with the underlying evidence so you can judge it yourself.',
    },
    {
        q: 'Do I need a Pro plan to trade?',
        a: 'No. Trading works on every plan — even Free. Plans limit how much AI analysis and chat you get per month; the underlying Jupiter trading path is the same.',
    },
    {
        q: 'Can I export my data?',
        a: 'Yes. Chat history exports as JSON on Pro and above. We don\'t lock you into our UI — your analyses, watchlist, and order history are yours.',
    },
    {
        q: 'What happens if a Sentinel Score is wrong?',
        a: 'Sentinel is a signal, not a guarantee. We flag uncertainty explicitly (the "Caution" band), show the evidence, and every swap card warns you again below a score of 40. The call is always yours.',
    },
]

export function Faq() {
    const [open, setOpen] = useState<number | null>(0)

    return (
        <section id="faq" className="relative border-t border-white/5 py-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <div className="mb-10">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-3">
                        FAQ
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-tight">
                        Questions, answered honestly.
                    </h2>
                </div>

                <div className="rounded-lg border border-white/10 overflow-hidden divide-y divide-white/5">
                    {FAQS.map((f, i) => {
                        const isOpen = open === i
                        return (
                            <div key={f.q} className="bg-[#0b0b12]">
                                <button
                                    type="button"
                                    onClick={() => setOpen(isOpen ? null : i)}
                                    className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                                    aria-expanded={isOpen}
                                >
                                    <span className="text-sm font-medium text-white">{f.q}</span>
                                    <Plus
                                        className={`w-4 h-4 text-white/50 shrink-0 mt-0.5 transition-transform ${isOpen ? 'rotate-45' : ''
                                            }`}
                                    />
                                </button>
                                {isOpen && (
                                    <div className="px-5 pb-5 -mt-1 text-sm text-white/60 leading-relaxed">
                                        {f.a}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

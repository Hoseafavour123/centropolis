'use client'

import Link from 'next/link'
import { X, MessageCircle } from 'lucide-react'

const LINKS = {
    Product: ['Features', 'Pricing', 'Roadmap', 'Changelog'],
    Company: ['About', 'Blog', 'Careers', 'Contact'],
    Legal: ['Privacy', 'Terms', 'Security'],
}

export function Footer() {
    return (
        <footer className="relative border-t border-white/5 bg-[#0a0a0f]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
                <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 mb-10">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-sm overflow-hidden">
                                <img src="/Binocs.jpg" alt="Binocs" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-semibold tracking-tight">Binocs</span>
                        </div>
                        <p className="text-xs text-white/45 max-w-xs leading-relaxed">
                            A clean, non-custodial Solana terminal with an AI that actually calls the tools.
                        </p>
                        <div className="flex gap-2 mt-5">
                            <a
                                href="https://twitter.com/binocs_ai"
                                className="w-8 h-8 rounded-md border border-white/10 flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.04] transition-colors"
                                aria-label="X"
                            >
                                <X className="w-3.5 h-3.5" />
                            </a>
                            <a
                                href="https://t.me/binocs_ai"
                                className="w-8 h-8 rounded-md border border-white/10 flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.04] transition-colors"
                                aria-label="Telegram"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(LINKS).map(([category, items]) => (
                        <div key={category}>
                            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/45 mb-3">
                                {category}
                            </h4>
                            <ul className="space-y-2">
                                {items.map((item) => (
                                    <li key={item}>
                                        <Link
                                            href="#"
                                            className="text-sm text-white/65 hover:text-white transition-colors"
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <p className="text-[11px] text-white/35">
                        © {new Date().getFullYear()} Binocs. All rights reserved.
                    </p>
                    <p className="text-[11px] text-white/35 font-mono">
                        Built on Solana · Powered by Jupiter
                    </p>
                </div>
            </div>
        </footer>
    )
}

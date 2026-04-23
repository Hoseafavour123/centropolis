"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Bot,
    ShieldCheck,
    Wallet,
    TrendingUp,
    Zap,
    Sparkles,
} from "lucide-react";

const PROMPT_HINTS = [
    { icon: ShieldCheck, text: "Analyze BONK for rug risk", cls: "text-emerald-400" },
    { icon: Wallet, text: "Show my portfolio performance", cls: "text-indigo-300" },
    { icon: TrendingUp, text: "What's trending on Solana?", cls: "text-cyan-300" },
    { icon: Zap, text: "Quote 0.5 SOL → BONK", cls: "text-amber-300" },
];

export function SentinelDashboardCard() {
    return (
        <Card className="glass-panel overflow-hidden h-full flex flex-col relative group border-primary/30 hover:border-primary/60 transition-all duration-500">
            {/* Background gradient wash */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-purple-500/5 to-cyan-500/10 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Decorative blur */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/30 rounded-full blur-3xl group-hover:bg-primary/40 transition-all duration-700" />
            <div className="absolute -bottom-16 -left-8 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />

            <CardContent className="relative z-10 p-6 flex flex-col h-full justify-between gap-5">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="relative p-3 rounded-2xl bg-primary/20 text-primary shadow-[0_0_20px_rgba(99,102,241,0.35)]">
                            <Bot className="w-6 h-6" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-bold text-primary uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" />
                            Built-in
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <h3 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Sentinel
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Chat with an AI that actually calls the tools. Research tokens, inspect
                            your portfolio, and execute swaps — in one conversation.
                        </p>
                    </div>

                    {/* Prompt chips */}
                    <ul className="space-y-1.5">
                        {PROMPT_HINTS.map((p) => (
                            <li
                                key={p.text}
                                className="flex items-center gap-2 rounded-md border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-mono text-muted-foreground"
                            >
                                <p.icon className={`w-3.5 h-3.5 shrink-0 ${p.cls}`} />
                                <span className="truncate">{p.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <Link href="/sentinel" className="block">
                    <Button
                        className="w-full group/btn relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Open Sentinel Chat
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

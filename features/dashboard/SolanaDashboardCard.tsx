"use client";

import { useSolPrice } from "@/hooks/useSolPrice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

export function SolanaDashboardCard() {
    const { solPrice, isLoading } = useSolPrice();
    const { theme } = useTheme();
    const SOL_ADDRESS = "So11111111111111111111111111111111111111112";

    return (
        <Card className="glass-panel overflow-hidden h-full flex flex-col relative group border-primary/20 hover:border-primary/50 transition-all duration-500">
            {/* Background Animated Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Decorative Blur */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700" />

            <CardContent className="relative z-10 p-6 flex flex-col h-full justify-between">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-3 rounded-2xl bg-primary/20 text-primary shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                            <Zap className="w-6 h-6 fill-primary/20" />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                            Featured Asset
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                            SOLANA
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-4xl font-mono font-bold tracking-tight">
                                {isLoading ? "---.--" : `$${solPrice?.toFixed(2)}`}
                            </span>
                            <div className="flex items-center text-green-400 text-sm font-bold">
                                <TrendingUp className="w-4 h-4 mr-0.5" />
                                Live
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                        Experience the fastest ecosystem in Web3. Analyze deep liquidity and trade SOL instantly.
                    </p>
                </div>

                <div className="space-y-3 pt-6 hidden">
                    <Link href={`/token/solana/${SOL_ADDRESS}`}>
                        <Button className="w-full group/btn relative overflow-hidden bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-[0_4px_20px_rgba(168,85,247,0.4)] transition-all hover:scale-[1.02] active:scale-95">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                DEEP DIVE ANALYSIS
                                <BarChart3 className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </span>
                        </Button>
                    </Link>

                    <Link href={`/trade?to=${SOL_ADDRESS}`} className="hidden">
                        <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5 text-xs font-bold h-10 tracking-widest uppercase">
                            QUICK TRADE SOL
                            <ArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import Link from "next/link";
import { Waitlist } from "@clerk/nextjs";
import { Shield, Zap, TrendingUp, BarChart3, Lock, Globe, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-bold text-xl">C</div>
            <span className="text-xl font-bold tracking-tighter">Centropolis</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#sentinel" className="hover:text-white transition-colors">Sentinel AI</a>
            <a href="#trading" className="hover:text-white transition-colors">Trading</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <a href="#waitlist" className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-emerald-400 transition-all duration-300 scale-100 hover:scale-105 active:scale-95">
              Join Waitlist
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Zap className="w-3 h-3" /> The Future of Web3 Trading
            </div>
            <h1 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              TRADE SMARTER<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">WITH SENTINEL AI</span>
            </h1>
            <p className="text-gray-400 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
              Centropolis is the next-generation trading terminal powered by real-time safety analysis,
              instant liquidity aggregation, and institutional-grade risk management.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
              <a href="#waitlist" className="group bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-2 transition-all hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] hover:scale-105">
                Join the Elite <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link href="/dashboard" className="px-8 py-4 rounded-2xl font-bold text-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                Launch Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Dashboard Preview */}
        <div className="mt-20 relative max-w-6xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-32 duration-1500 delay-700">
          <div className="relative rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10" />
            <img
              src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop"
              alt="Centropolis Dashboard"
              className="w-full grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-100 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <button className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-black hover:scale-110 transition-transform shadow-3xl">
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 lg:py-40 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard
              icon={Shield}
              title="Sentinel Security"
              description="Real-time contract analysis and rug-pull detection powered by our proprietary AI engine."
              color="emerald"
            />
            <FeatureCard
              icon={Zap}
              title="Instant Swaps"
              description="Optimized routing across all major DEXs with sub-second execution and minimal slippage."
              color="blue"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Smart Analytics"
              description="Advanced charting and portfolio tracking that reveals patterns others miss."
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20 lg:py-40 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-xl mx-auto bg-zinc-900/50 backdrop-blur-3xl border border-white/10 p-8 lg:p-12 rounded-[2rem] shadow-2xl text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight">JOIN THE WAITLIST</h2>
              <p className="text-gray-400">Be among the first to experience the next evolution of trading. Limited early access spots available.</p>
            </div>

            {/* Clerk Waitlist Component */}
            <div className="waitlist-container overflow-hidden rounded-2xl">
              <Waitlist />
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Early Access</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Beta Perks</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Priority Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-black font-bold text-sm">C</div>
              <span className="font-bold tracking-tighter">Centropolis</span>
            </div>
            <div className="flex items-center gap-10 text-sm text-gray-500 font-medium">
              <a href="#" className="hover:text-white transition-colors">Term of Service</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">X (Twitter)</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
            </div>
            <p className="text-sm text-gray-600">© 2026 Centropolis Protocol. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
  const colorClasses: any = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  return (
    <div className="group p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 hover:scale-[1.02] hover:border-white/10">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${colorClasses[color]}`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

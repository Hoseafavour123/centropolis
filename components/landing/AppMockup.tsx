import {
    Bot,
    CheckCircle2,
    LineChart,
    Search,
    Star,
    TrendingUp,
    Wallet,
    Zap,
    ShieldCheck,
    Bell,
} from 'lucide-react'

/**
 * Static, pixel-accurate mockup of the Binocs dashboard. Pure CSS + SVG — no
 * decorative stock art, no fake screenshots. Designed to read like the real
 * app: sidebar, header, hero chart, trending grid row, right trade panel.
 */
export function AppMockup() {
    return (
        <div className="relative mx-auto w-full max-w-6xl rounded-xl border border-white/10 bg-[#0b0b12] shadow-2xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="text-[10px] font-mono text-white/50 bg-white/5 border border-white/10 rounded px-2 py-0.5">
                        binocs.app/dashboard
                    </div>
                </div>
                <div className="w-14" />
            </div>

            {/* App layout */}
            <div className="flex h-[520px]">
                {/* Sidebar */}
                <aside className="hidden md:flex w-48 shrink-0 border-r border-white/10 flex-col">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-sm bg-indigo-500/80" />
                        <span className="text-xs font-semibold">Binocs</span>
                    </div>
                    <nav className="py-3 space-y-0.5 text-[12px]">
                        {[
                            { icon: LineChart, label: 'Dashboard', active: true },
                            { icon: Bot, label: 'Sentinel' },
                            { icon: Wallet, label: 'Portfolio' },
                            { icon: Star, label: 'Watchlist' },
                            { icon: TrendingUp, label: 'Trade' },
                        ].map((it) => (
                            <div
                                key={it.label}
                                className={`flex items-center gap-2 mx-2 px-2 py-1.5 rounded-md ${it.active
                                        ? 'bg-white/[0.06] text-white'
                                        : 'text-white/55'
                                    }`}
                            >
                                <it.icon className="w-3.5 h-3.5" />
                                {it.label}
                            </div>
                        ))}
                    </nav>
                    <div className="mt-auto px-3 py-3 border-t border-white/5 text-[10px] text-white/40">
                        PRO · 78 analyses left
                    </div>
                </aside>

                {/* Main column */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* App header */}
                    <header className="px-5 py-2.5 border-b border-white/10 flex items-center gap-3">
                        <div className="flex-1 max-w-md">
                            <div className="flex items-center gap-2 h-8 rounded-md border border-white/10 bg-white/[0.03] px-2.5">
                                <Search className="w-3.5 h-3.5 text-white/40" />
                                <span className="text-[11px] text-white/40 font-mono">
                                    Search tokens, wallets…
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="inline-flex items-center gap-1.5 px-2 h-7 rounded-full bg-white/[0.04] border border-white/10 text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                solana
                            </div>
                            <div className="relative">
                                <Bell className="w-4 h-4 text-white/55" />
                                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-rose-400" />
                            </div>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                        </div>
                    </header>

                    {/* Body: grid (main + right panel) */}
                    <div className="flex-1 flex min-h-0">
                        <main className="flex-1 p-5 space-y-4 overflow-hidden">
                            {/* Top row: chart + Sentinel card */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-white/40">
                                                Solana
                                            </div>
                                            <div className="text-lg font-mono font-semibold">$167.42</div>
                                        </div>
                                        <div className="text-[10px] text-emerald-400">+4.12%</div>
                                    </div>
                                    <ChartSvg />
                                </div>

                                <div className="rounded-lg border border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="inline-flex items-center gap-1.5 text-[10px] text-indigo-300 font-semibold">
                                            <Bot className="w-3 h-3" /> Sentinel
                                        </div>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    </div>
                                    <div className="text-[11px] text-white/75 leading-snug">
                                        &ldquo;Analyze BONK for rug risk&rdquo;
                                    </div>
                                    <div className="space-y-1">
                                        {[
                                            'Contract verified',
                                            'LP locked 24 mo',
                                            'Sentinel 78 / Safe',
                                        ].map((t) => (
                                            <div key={t} className="flex items-center gap-1.5 text-[10px] text-white/60">
                                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                                {t}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Trending grid */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="text-[11px] font-semibold">Trending on Solana</div>
                                    <div className="text-[10px] text-white/40">view all →</div>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { sym: 'BONK', pct: '+38.2', color: 'bg-amber-500' },
                                        { sym: 'JUP', pct: '+12.4', color: 'bg-emerald-500' },
                                        { sym: 'WIF', pct: '+4.6', color: 'bg-pink-500' },
                                        { sym: 'JTO', pct: '-1.2', color: 'bg-indigo-500', neg: true },
                                    ].map((t) => (
                                        <div
                                            key={t.sym}
                                            className="rounded-md border border-white/10 bg-white/[0.02] p-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`w-4 h-4 rounded-full ${t.color}`} />
                                                    <span className="text-[11px] font-semibold">{t.sym}</span>
                                                </div>
                                                <span
                                                    className={`text-[10px] font-mono ${t.neg ? 'text-rose-400' : 'text-emerald-400'
                                                        }`}
                                                >
                                                    {t.pct}%
                                                </span>
                                            </div>
                                            <div className="mt-1.5 h-0.5 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-400/70 w-[70%]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Live feed */}
                            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-[11px] font-semibold">Live feed</div>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                </div>
                                <div className="space-y-1.5">
                                    {[
                                        { t: 'whale_move', txt: 'Wallet FJp3…aD2 bought $142K BONK', time: '2m' },
                                        { t: 'swap', txt: '0.5 SOL → 2.41M BONK via Jupiter', time: '4m' },
                                        { t: 'alert', txt: 'Watchlist: WIF pumped +4.6% (1h)', time: '6m' },
                                    ].map((r) => (
                                        <div
                                            key={r.txt}
                                            className="flex items-center gap-2 text-[10px] font-mono text-white/65"
                                        >
                                            <span
                                                className={`w-1 h-1 rounded-full ${r.t === 'whale_move'
                                                        ? 'bg-amber-400'
                                                        : r.t === 'swap'
                                                            ? 'bg-indigo-400'
                                                            : 'bg-rose-400'
                                                    }`}
                                            />
                                            <span className="flex-1 truncate">{r.txt}</span>
                                            <span className="text-white/30">{r.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </main>

                        {/* Right trade panel */}
                        <aside className="hidden lg:flex w-[240px] shrink-0 border-l border-white/10 p-4 flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="text-[11px] font-semibold">Quick Trade</div>
                                <span className="text-[9px] text-white/40">Jupiter</span>
                            </div>

                            <div className="rounded-md border border-white/10 bg-white/[0.02] p-2">
                                <div className="text-[9px] uppercase text-white/40 mb-1">From</div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                                        <span className="text-xs font-semibold">SOL</span>
                                    </div>
                                    <span className="text-xs font-mono">0.5</span>
                                </div>
                            </div>

                            <div className="rounded-md border border-white/10 bg-white/[0.02] p-2">
                                <div className="text-[9px] uppercase text-white/40 mb-1">To</div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-4 h-4 rounded-full bg-amber-500" />
                                        <span className="text-xs font-semibold">BONK</span>
                                    </div>
                                    <span className="text-xs font-mono">~2.41M</span>
                                </div>
                            </div>

                            <div className="space-y-1 text-[10px]">
                                <Row label="Price impact" value="0.12%" tone="good" />
                                <Row label="Slippage" value="0.50%" />
                                <Row
                                    label="Sentinel"
                                    value={
                                        <span className="inline-flex items-center gap-1 text-emerald-400">
                                            <ShieldCheck className="w-3 h-3" /> 78 Safe
                                        </span>
                                    }
                                />
                            </div>

                            <button
                                type="button"
                                className="mt-auto w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-white text-black text-xs font-semibold py-2"
                            >
                                <Zap className="w-3.5 h-3.5" /> Swap SOL → BONK
                            </button>
                            <div className="text-[9px] text-white/40 text-center">
                                Non-custodial · signs from your wallet
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Row({
    label,
    value,
    tone,
}: {
    label: string
    value: React.ReactNode
    tone?: 'good' | 'warn'
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-white/45">{label}</span>
            <span
                className={`font-mono ${tone === 'good'
                        ? 'text-emerald-400'
                        : tone === 'warn'
                            ? 'text-amber-400'
                            : 'text-white/85'
                    }`}
            >
                {value}
            </span>
        </div>
    )
}

function ChartSvg() {
    return (
        <svg viewBox="0 0 300 80" className="w-full h-16">
            <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path
                d="M0 60 L30 52 L60 58 L90 42 L120 46 L150 30 L180 36 L210 22 L240 28 L270 14 L300 18 L300 80 L0 80 Z"
                fill="url(#chartFill)"
            />
            <path
                d="M0 60 L30 52 L60 58 L90 42 L120 46 L150 30 L180 36 L210 22 L240 28 L270 14 L300 18"
                fill="none"
                stroke="#818cf8"
                strokeWidth="1.5"
            />
        </svg>
    )
}

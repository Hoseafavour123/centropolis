// app/test-hub/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

// Token data for testing
const TEST_TOKENS = [
  {
    chain: 'solana',
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    type: 'Layer 1',
    safetyScore: 72,
    price: 136.82,
    change24h: 4.12,
    featured: true,
  },
  {
    chain: 'solana',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    type: 'Stablecoin',
    safetyScore: 98,
    price: 1.00,
    change24h: 0.01,
    featured: true,
  },
  {
    chain: 'solana',
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    symbol: 'BONK',
    name: 'Bonk',
    type: 'Meme Coin',
    safetyScore: 65,
    price: 0.0000198,
    change24h: 12.45,
    featured: true,
  },
  {
    chain: 'ethereum',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    type: 'Wrapped',
    safetyScore: 95,
    price: 3456.78,
    change24h: -1.23,
    featured: false,
  },
  {
    chain: 'base',
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    name: 'Wrapped Ether (Base)',
    type: 'L2 Wrapped',
    safetyScore: 88,
    price: 3456.78,
    change24h: -1.23,
    featured: false,
  },
  {
    chain: 'solana',
    address: 'randomtestaddress123',
    symbol: 'TEST',
    name: 'Random Test Token',
    type: 'Unknown',
    safetyScore: 45,
    price: 0.42,
    change24h: -5.67,
    featured: false,
  },
];

// Page categories
const PAGES = [
  {
    category: 'Token Detail Pages',
    description: 'Full token dossier with charts, holders, pools, and trading',
    icon: '📊',
    items: TEST_TOKENS.map(t => ({
      name: `${t.name} (${t.symbol})`,
      path: `/token/${t.chain}/${t.address}`,
      badge: t.chain,
      meta: `Safety: ${t.safetyScore}/100 | $${t.price}`,
      featured: t.featured,
    })),
  },
  {
    category: 'Sentinel AI Analysis',
    description: 'AI-powered security and investment analysis',
    icon: '🤖',
    items: [
      {
        name: 'SOL Analysis',
        path: '/sentinel?token=So11111111111111111111111111111111111111112&chain=solana',
        badge: 'Demo',
        meta: 'Full streaming analysis with rug detection',
        featured: true,
      }
    ],
  },
  {
    category: 'Trading (NOT ACTIVE YET)',
    description: 'Swap interface with route optimization',
    icon: '💱',
    items: [
      {
        name: 'Trade SOL/USDC',
        path: '/trade?chain=solana&from=USDC&to=SOL&prefillFrom=hub',
        badge: 'Jupiter',
        meta: 'MEV-protected via Jito',
        featured: true,
      },
    ],
  },
  {
    category: 'Wallet Analysis (NOT ACTIVE YET)',
    description: 'Portfolio and transaction analysis',
    icon: '👛',
    items: [
      {
        name: 'Whale Wallet',
        path: '/wallet/5D1f...BL5w',
        badge: 'Demo',
        meta: 'Large holder analysis',
        featured: true,
      },
    ],
  },
//   {
//     category: 'API Testing',
//     description: 'Direct API endpoint testing',
//     icon: '🔧',
//     items: [
//       {
//         name: 'Token Metadata API',
//         path: '/api/token/solana/So11111111111111111111111111111111111111112/meta',
//         badge: 'GET',
//         meta: 'JSON response',
//         featured: false,
//       },
//       {
//         name: 'Price History API',
//         path: '/api/price/solana/So11111111111111111111111111111111111111112?range=1d',
//         badge: 'GET',
//         meta: 'OHLCV candles',
//         featured: false,
//       },
//       {
//         name: 'Trade Quote API',
//         path: '/api/trade/quote?chain=solana&from=USDC&to=SOL&amount=1000',
//         badge: 'GET',
//         meta: 'Route comparison',
//         featured: false,
//       },
//     ],
//   },
];

export default function TestHubPage() {
  const [filter, setFilter] = useState<'all' | 'featured'>('all');
  const [search, setSearch] = useState('');

  const filteredPages = PAGES.map(category => ({
    ...category,
    items: category.items.filter(item => {
      const matchesFilter = filter === 'all' || item.featured;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.meta.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    }),
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-xl">
              C
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">Centropolis</h1>
              <p className="text-xs text-slate-500">Developer Test Hub</p>
            </div>
          </div>
          <Link 
            href="/"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors"
          >
            ← Back to App
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">🧪 Testing Hub</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Quick access to all pages and components. Use this to test token details, 
            AI analysis, trading flows, and API endpoints.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('featured')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'featured' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Featured ⭐
            </button>
          </div>
        </div>

        {/* Page Categories */}
        <div className="space-y-8">
          {filteredPages.map((category) => (
            <section key={category.category} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-white">{category.category}</h3>
                  <p className="text-sm text-slate-500">{category.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="group block p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {item.name}
                      </h4>
                      {item.featured && (
                        <span className="text-yellow-500 text-lg">⭐</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.badge === 'GET' 
                          ? 'bg-green-500/10 text-green-500' 
                          : item.badge === 'solana'
                          ? 'bg-purple-500/10 text-purple-500'
                          : item.badge === 'ethereum'
                          ? 'bg-blue-500/10 text-blue-500'
                          : item.badge === 'base'
                          ? 'bg-cyan-500/10 text-cyan-500'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-500">{item.meta}</p>
                    
                    <div className="mt-3 flex items-center text-xs text-slate-600 font-mono truncate">
                      {item.path}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Empty State */}
        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No pages match your search.</p>
            <button 
              onClick={() => { setSearch(''); setFilter('all'); }}
              className="mt-2 text-blue-500 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">🚀 Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/token/solana/So11111111111111111111111111111111111111112"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              Open SOL Token →
            </Link>
            <Link
              href="/sentinel"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
            >
              Launch Sentinel
            </Link>
            <Link
              href="/trade"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
            >
              Open Trade
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard label="API Routes" status="online" />
          <StatusCard label="WebSocket" status="online" />
          <StatusCard label="Price Stream" status="online" />
          <StatusCard label="Database" status="mock" />
        </div>
      </main>
    </div>
  );
}

function StatusCard({ label, status }: { label: string; status: 'online' | 'offline' | 'mock' }) {
  const colors = {
    online: 'bg-green-500/10 text-green-500 border-green-500/20',
    offline: 'bg-red-500/10 text-red-500 border-red-500/20',
    mock: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  };
  
  return (
    <div className={`p-3 rounded-lg border text-center ${colors[status]}`}>
      <div className="text-xs uppercase tracking-wider opacity-80">{label}</div>
      <div className="font-semibold capitalize">{status}</div>
    </div>
  );
}
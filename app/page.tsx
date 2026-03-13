// (Home / Trading Dashboard)
import { HeroChart } from "@/features/dashboard/HeroChart";
import { SentinelCard } from "@/features/dashboard/SentinelCard";
import { TrendingGrid } from "@/features/dashboard/TrendingGrid";
import { LiveFeed } from "@/features/dashboard/LiveFeed";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Top Section: Chart & AI */}
      <Link 
        href="/test-hub"
        className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 text-sm font-medium hover:bg-amber-500/20 transition-colors"
      >
        🧪 Test Mock
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HeroChart />
        <div className="lg:col-span-1">
          <SentinelCard />
        </div>
      </div>

      {/* Middle Section: Trending */}
      <TrendingGrid />

      {/* Bottom Section: Live Feed */}
      <LiveFeed />
    </div>
  );
}

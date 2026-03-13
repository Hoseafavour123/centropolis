// components/layout/Sidebar.tsx
"use client";

import { useGlobalStore } from "@/lib/store/globalStore";
import {
  TrendingUp,
  Activity,
  Star,
  Wallet,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: TrendingUp, label: "Trending", href: "/" },
  { icon: Activity, label: "Smart Money", href: "/smart-money" },
  { icon: Star, label: "Watchlist", href: "/watchlist" },
  { icon: ShieldAlert, label: "Sentinel", href: "/sentinel" },
  { icon: Users, label: "Social", href: "/social" },
];

export function Sidebar() {
  const { sidebarOpen } = useGlobalStore();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border/40 bg-background/95 backdrop-blur transition-transform duration-300 ease-in-out lg:translate-x-0",
        !sidebarOpen && "-translate-x-full lg:hidden",
      )}
    >
      <div className="flex h-full flex-col gap-2 p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-1">
          <Link
            href="/wallet"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Wallet className="h-4 w-4" />
            My Wallet
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}


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
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ShieldAlert, label: "Sentinel", href: "/sentinel" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: Star, label: "Watchlist Tracker", href: "/watchlist" },
  { icon: Activity, label: "Orders and History", href: "/orders" },
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
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/settings")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Settings className="h-4 w-4" />
            Settings & Billing
          </Link>
        </div>
      </div>
    </aside>
  );
}


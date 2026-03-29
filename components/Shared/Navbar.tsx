"use client";

import { useGlobalStore } from "@/lib/store/globalStore";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useWalletStore } from "@/store/useWalletStore";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";

export function Navbar() {
  const { toggleSidebar } = useGlobalStore();
  const { walletAddress, chain, isConnected } = useWalletStore();
  const { user } = useCurrentUser();

  const { data: notificationsRes } = useQuery({
    queryKey: ['notifications-nav'],
    queryFn: async () => {
      if (!user) return { notifications: [] };
      const res = await axios.get('/api/notifications');
      return res.data;
    },
    enabled: !!user,
    refetchInterval: 10000
  });

  const notifications = notificationsRes?.notifications || [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;
  const hasUnread = unreadCount > 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              B
            </div>
            <span className="text-xl font-bold tracking-tight hidden md:inline-block">
              Binocs
            </span>
          </Link>
        </div>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tokens, wallets..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-muted border-none focus:ring-2 focus:ring-primary outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {chain}
          </div>

          <Link href="/watchlist" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors mr-2">
            <Bell className="h-5 w-5" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-background animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <WalletConnectButton />

          {user ? (
            <UserButton />
          ) : (
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

// components/layout/Navbar.tsx
"use client";

import { useGlobalStore } from "@/lib/store/globalStore";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { toggleSidebar, walletAddress, connect, disconnect, isConnected } =
    useGlobalStore();

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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              C
            </div>
            <span className="text-xl font-bold tracking-tight hidden md:inline-block">
              Centropolis
            </span>
          </div>
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
            Solana
          </div>

          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
          </button>

          {isConnected ? (
            <Button
              variant="outline"
              onClick={disconnect}
              className="font-mono"
            >
              {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
            </Button>
          ) : (
            <Button
              onClick={() => connect("7x9vB2mN...4pQ")}
              className="bg-primary hover:bg-primary/90"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

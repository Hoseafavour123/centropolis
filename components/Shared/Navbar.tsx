"use client";

import { useGlobalStore } from "@/lib/store/globalStore";
import { Search, Bell, Menu, BellRing, CheckCircle2, XCircle, X, ShieldCheck, Wallet, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useWalletStore } from "@/store/useWalletStore";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { TokenAvatar } from "@/components/Shared/TokenAvatar";
import type { SearchResult } from "@/app/api/search/route";

// ── Debounce hook ─────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ── Price helpers ─────────────────────────────────────────────────────────────

function formatPrice(price?: number): string {
  if (!price) return "";
  if (price < 0.000001) return `$${price.toExponential(2)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

// ── Search Dropdown ───────────────────────────────────────────────────────────

function SearchDropdown({
  query,
  results,
  isLoading,
  onSelect,
  onClose,
}: {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  onSelect: (r: SearchResult) => void;
  onClose: () => void;
}) {
  const [activeIdx, setActiveIdx] = useState(-1);

  // Reset highlight when results change
  useEffect(() => setActiveIdx(-1), [results]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        onSelect(results[activeIdx]);
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [results, activeIdx, onSelect, onClose]);

  return (
    <div className="absolute top-full mt-2 left-0 right-0 z-[100] rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-2xl overflow-hidden">
      {/* Loading skeletons */}
      {isLoading && (
        <div className="px-3 py-2 space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-2.5 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-muted rounded w-28" />
                <div className="h-2 bg-muted rounded w-16" />
              </div>
              <div className="h-3 bg-muted rounded w-14" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!isLoading && results.length > 0 && (
        <div className="py-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {results[0].type === "wallet" ? "Wallet" : "Tokens"}
          </div>
          {results.map((r, i) => (
            <button
              key={r.address}
              onClick={() => onSelect(r)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left group",
                activeIdx === i ? "bg-primary/10" : "hover:bg-muted/60"
              )}
            >
              {/* Icon / Avatar */}
              {r.type === "wallet" ? (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                </div>
              ) : (
                <TokenAvatar logoUrl={r.logoUrl} symbol={r.symbol || r.address.slice(0, 3)} size="sm" />
              )}

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm truncate">
                    {r.type === "wallet" ? "Wallet" : r.name}
                  </span>
                  {r.type === "token" && r.symbol && (
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                      {r.symbol}
                    </span>
                  )}
                  {/* Chain pill */}
                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-mono capitalize shrink-0">
                    {r.chain}
                  </span>
                </div>
                {r.type === "wallet" ? (
                  <p className="text-xs text-muted-foreground font-mono truncate">{r.address}</p>
                ) : (
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {r.address.slice(0, 8)}…{r.address.slice(-4)}
                  </p>
                )}
              </div>

              {/* Price + change */}
              {r.type === "token" && r.priceUsd && (
                <div className="text-right shrink-0">
                  <p className="text-xs font-mono font-medium">{formatPrice(r.priceUsd)}</p>
                  {r.change24h !== undefined && (
                    <p className={cn(
                      "text-[10px] font-medium",
                      r.change24h >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {r.change24h >= 0 ? "+" : ""}{r.change24h.toFixed(2)}%
                    </p>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && results.length === 0 && query.length >= 2 && (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
          <TrendingUp className="w-7 h-7 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No tokens found for &ldquo;{query}&rdquo;</p>
          <p className="text-xs text-muted-foreground/60">Try a token name, symbol, or paste an address</p>
        </div>
      )}

      {/* Footer hint */}
      {!isLoading && results.length > 0 && (
        <div className="border-t border-border/50 px-3 py-1.5 flex items-center gap-3 text-[10px] text-muted-foreground/60">
          <span><kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">↑↓</kbd> navigate</span>
          <span><kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">↵</kbd> select</span>
          <span><kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">Esc</kbd> close</span>
        </div>
      )}
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

export function Navbar() {
  const { toggleSidebar } = useGlobalStore();
  const { chain } = useWalletStore();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const router = useRouter();

  // ── Notifications state ──────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ── Search state ─────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Ctrl+K / Cmd+K shortcut to focus search
  useEffect(() => {
    function handleShortcut(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const input = searchRef.current?.querySelector("input");
        input?.focus();
        setSearchFocused(true);
      }
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  // ── Search query ─────────────────────────────────────────────────────────
  const { data: searchResults = [], isFetching: isSearching } = useQuery<SearchResult[]>({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  const handleSearchSelect = useCallback((result: SearchResult) => {
    setSearchFocused(false);
    setSearchQuery("");
    if (result.type === "wallet") {
      router.push(`/wallet?address=${result.address}`);
    } else {
      router.push(`/token/${result.chain}/${result.address}`);
    }
  }, [router]);

  const showDropdown = searchFocused && debouncedQuery.length >= 2;

  // ── Notifications ─────────────────────────────────────────────────────────
  const { data: notificationsRes } = useQuery({
    queryKey: ["notifications-nav"],
    queryFn: async () => {
      if (!user) return { notifications: [] };
      const res = await axios.get("/api/notifications");
      return res.data;
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  const notifications: any[] = notificationsRes?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  const markRead = useMutation({
    mutationFn: (id?: string) => axios.patch("/api/notifications", { id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications-nav"] }),
  });

  const deleteNotif = useMutation({
    mutationFn: (id?: string) =>
      axios.delete(`/api/notifications${id ? `?id=${id}` : ""}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications-nav"] }),
  });

  const typeIcon = (type: string) =>
    type === "ALARM" ? (
      <BellRing className="w-3.5 h-3.5 text-orange-400 shrink-0" />
    ) : type === "INFO" ? (
      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
    ) : (
      <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
    );

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left */}
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
              <img src="/Binocs.jpg" alt="Logo" className="w-8 h-8 rounded-lg" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden md:inline-block">
              Binocs
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block" ref={searchRef}>
          <div className="relative">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
            <input
              id="navbar-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search tokens, addresses…"
              className="w-full h-10 pl-10 pr-10 rounded-full bg-muted border border-transparent focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
              autoComplete="off"
              spellCheck={false}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSearchFocused(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Dropdown */}
            {showDropdown && (
              <SearchDropdown
                query={debouncedQuery}
                results={searchResults}
                isLoading={isSearching && debouncedQuery.length >= 2}
                onSelect={handleSearchSelect}
                onClose={() => setSearchFocused(false)}
              />
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {chain}
          </div>

          {/* ── Notification Bell ── */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => {
                setOpen((v) => !v);
                if (!open && hasUnread) markRead.mutate(undefined);
              }}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {hasUnread && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-background animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Panel */}
            {open && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-background shadow-2xl z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-primary" />
                    Notifications
                    {hasUnread && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-3">
                    {notifications.length > 0 && (
                      <button
                        onClick={() => deleteNotif.mutate(undefined)}
                        className="text-[11px] text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      onClick={() => setOpen(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-[420px] overflow-y-auto divide-y divide-border/50">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                      <Bell className="w-8 h-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No notifications yet</p>
                      <p className="text-xs text-muted-foreground/60">
                        Set a watchlist alert to get notified
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif: any) => (
                      <div
                        key={notif.id}
                        className={cn(
                          "flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group",
                          !notif.read && "bg-primary/5"
                        )}
                      >
                        {/* Icon */}
                        <div className="mt-0.5">
                          {typeIcon(notif.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              "text-sm font-medium leading-tight",
                              notif.read ? "text-muted-foreground" : "text-foreground"
                            )}>
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap shrink-0 mt-0.5">
                              {timeAgo(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotif.mutate(notif.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 mt-0.5 shrink-0"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="border-t border-border px-4 py-2.5 flex justify-between items-center">
                    <Link
                      href="/watchlist"
                      onClick={() => setOpen(false)}
                      className="text-xs text-primary hover:underline"
                    >
                      View all alerts →
                    </Link>
                    <span className="text-[11px] text-muted-foreground">
                      {notifications.length} total
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors"
              title="Admin Center"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}

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

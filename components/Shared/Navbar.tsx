"use client";

import { useGlobalStore } from "@/lib/store/globalStore";
import { Search, Bell, Menu, BellRing, CheckCircle2, XCircle, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useWalletStore } from "@/store/useWalletStore";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { toggleSidebar } = useGlobalStore();
  const { chain } = useWalletStore();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

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

  // Mark one or all as read
  const markRead = useMutation({
    mutationFn: (id?: string) => axios.patch("/api/notifications", { id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications-nav"] }),
  });

  // Delete one or all
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
              <img src="/public/Binocs.jpg" alt="Logo" className="w-8 h-8 rounded-lg" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden md:inline-block">
              Binocs
            </span>
          </Link>
        </div>

        {/* Search */}
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
                // Auto mark all as read when opening
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

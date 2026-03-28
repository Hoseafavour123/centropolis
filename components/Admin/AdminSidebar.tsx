"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    History,
    FileSearch,
    Settings,
    ShieldCheck,
    ArrowLeft
} from "lucide-react";

const menuItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "User Management",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Transactions",
        href: "/admin/transactions",
        icon: History,
    },
    {
        title: "Sentinel Logs",
        href: "/admin/sentinel",
        icon: FileSearch,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card/50 backdrop-blur-xl">
            <div className="flex h-full flex-col px-3 py-4">
                <div className="mb-8 flex items-center px-3">
                    <ShieldCheck className="mr-3 h-8 w-8 text-primary" />
                    <span className="text-xl font-bold tracking-tight">Admin Center</span>
                </div>

                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <Icon className="mr-3 h-5 w-5" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-border pt-4">
                    <Link
                        href="/"
                        className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        <ArrowLeft className="mr-3 h-5 w-5" />
                        Back to App
                    </Link>
                </div>
            </div>
        </aside>
    );
}

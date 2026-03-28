'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { User, CreditCard, Shield, Key } from 'lucide-react';

interface SettingsLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'apikeys', name: 'API Keys', icon: Key },
];

export function SettingsLayout({ children, activeTab, setActiveTab }: SettingsLayoutProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 py-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
                <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap",
                                    isActive
                                        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                <span className="font-medium">{tab.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden group">
                    {/* Decorative gradients */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full group-hover:bg-primary/10 transition-colors duration-500" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full group-hover:bg-secondary/10 transition-colors duration-500" />

                    <div className="relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}

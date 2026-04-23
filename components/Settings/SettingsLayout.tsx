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
    { id: 'profile',  name: 'Profile',  icon: User },
    { id: 'billing',  name: 'Billing',  icon: CreditCard },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'apikeys',  name: 'API Keys', icon: Key },
];

export function SettingsLayout({ children, activeTab, setActiveTab }: SettingsLayoutProps) {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            {/* ── Horizontal Tab Bar ── */}
            <div className="w-full overflow-x-auto">
                <div className="flex gap-1 p-1 bg-muted/50 border border-border/50 rounded-2xl w-fit min-w-full sm:min-w-0">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-1 sm:flex-none justify-center sm:justify-start",
                                    isActive
                                        ? "bg-background text-primary shadow-sm border border-border/50"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                )}
                            >
                                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                                <span className="hidden sm:inline">{tab.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden group">
                {/* Decorative gradients */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full group-hover:bg-primary/10 transition-colors duration-500" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full group-hover:bg-secondary/10 transition-colors duration-500" />

                <div className="relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {children}
                </div>
            </div>
        </div>
    );
}

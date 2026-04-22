'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Monitor, History, Smartphone } from 'lucide-react';

export function SecuritySettings() {
    const { user } = useUser();

    const handleToggle2FA = () => {
        // Open Clerk profile in a new tab for 2FA setup as it's more secure
        window.open('https://accounts.centropolis.io/user/security', '_blank');
    };

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">Security Settings</h2>
                <p className="text-muted-foreground text-sm">Enhanced protection for your account and trading data.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 2FA Card */}
                <div className="bg-card/40 border border-border/50 rounded-3xl p-6 flex flex-col justify-between group hover:border-primary/30 transition-all duration-300">
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-2">Two-Factor Authentication</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Add an extra layer of security to your account. 2FA is strongly recommended for users holding large assets.
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/20">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider">Status: Disabled</span>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleToggle2FA}
                            className="rounded-xl border-primary/20 text-primary hover:bg-primary/10 transition-all"
                        >
                            Setup 2FA
                        </Button>
                    </div>
                </div>

                {/* Sessions Card */}
                <div className="bg-card/40 border border-border/50 rounded-3xl p-6 flex flex-col justify-between group hover:border-secondary/30 transition-all duration-300">
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Monitor className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-2">Active Sessions</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                View and manage all the devices and browsers currently logged into your account.
                            </p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <Button
                            variant="outline"
                            className="w-full rounded-xl border-secondary/20 text-secondary hover:bg-secondary/10"
                            onClick={handleToggle2FA}
                        >
                            <History className="w-4 h-4 mr-2" />
                            Manage Sessions
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-muted/10 border border-border/50 rounded-2xl p-6 flex items-start gap-4">
                <Smartphone className="w-6 h-6 text-muted-foreground mt-1" />
                <div>
                    <h4 className="font-bold text-sm mb-1">Mobile App Verification</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Register your mobile device to receive push notifications for trade confirmations and high-risk alerts.
                    </p>
                    <Button variant="link" className="text-primary text-xs p-0 h-auto mt-2">Link device soon →</Button>
                </div>
            </div>
        </div>
    );
}

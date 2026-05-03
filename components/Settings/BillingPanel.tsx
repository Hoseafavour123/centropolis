'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Check, Zap, AlertTriangle, CalendarX2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CheckoutModal } from './CheckoutModal';
import { toast } from 'sonner';
import { differenceInDays, format } from 'date-fns';

export function BillingPanel() {
    const { user } = useUser();
    const [plan, setPlan] = useState('FREE');
    const [planExpiresAt, setPlanExpiresAt] = useState<Date | null>(null);
    const [usage, setUsage] = useState<any>(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'WHALE'>('PRO');
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/user/${user.id}/plan?t=${Date.now()}`);
            if (!res.ok) return;
            const data = await res.json();
            if (data.plan) setPlan(data.plan);
            if (data.usage) setUsage(data.usage);
            if (data.planExpiresAt) setPlanExpiresAt(new Date(data.planExpiresAt));
            else setPlanExpiresAt(null);
        } catch {
            // fallback
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpgradeClick = (p: 'PRO' | 'WHALE') => {
        setSelectedPlan(p);
        setIsCheckoutOpen(true);
    };

    const handleCancelPlan = async () => {
        if (!confirm("Are you sure you want to cancel your plan? This will take effect immediately and you will lose access to premium features.")) return;
        
        try {
            const res = await fetch('/api/payment/cancel', { method: 'POST' });
            if (res.ok) {
                toast.success('Subscription cancelled successfully.');
                loadData();
            } else {
                toast.error('Failed to cancel subscription.');
            }
        } catch {
            toast.error('An error occurred.');
        }
    };

    const isExpiredGracePeriod = plan !== 'FREE' && planExpiresAt && planExpiresAt < new Date();
    const daysUntilExpiry = planExpiresAt ? differenceInDays(planExpiresAt, new Date()) : null;

    const plans = [
        {
            id: 'FREE',
            name: 'Free',
            price: '0',
            description: 'Perfect for exploring the platform features.',
            features: ['5 AI Analyses/mo', '5 Watchlist Items', 'Standard Support', '20 Chats/day'],
            color: 'muted'
        },
        {
            id: 'PRO',
            name: 'Pro',
            price: '0.1', // testing price, change to 29.99 in production
            description: 'Advanced tools for serious individual traders.',
            features: ['100 AI Analyses/mo', 'Unlimited Watchlist', 'Priority Support', '500 Chats/day', 'Export Chat History'],
            color: 'primary',
            popular: true
        },
        {
            id: 'WHALE',
            name: 'Whale',
            price: '199',
            description: 'The ultimate setup for institutional-grade trading.',
            features: ['Unlimited AI Analyses', 'Unlimited Watchlist', 'Dedicated Account Manager', 'Infinite Chat Usage', 'Export Chat History'],
            color: 'secondary'
        }
    ];

    if (isLoading) return <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Billing & Plan</h2>
                    <p className="text-muted-foreground text-sm">Manage your subscription and monitor your usage limits.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl flex items-center gap-3">
                        <Zap className="w-5 h-5 text-primary fill-primary" />
                        <div>
                            <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Current Plan</p>
                            <p className="text-sm font-bold text-foreground">{plan}</p>
                        </div>
                    </div>
                </div>
            </div>

            {isExpiredGracePeriod && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="font-bold">Subscription Expired</h4>
                            <p className="text-sm">Your plan has expired. You are currently in a 3-day grace period. Please renew to avoid losing access.</p>
                        </div>
                    </div>
                    <Button onClick={() => handleUpgradeClick(plan as 'PRO' | 'WHALE')} className="bg-red-500 hover:bg-red-600 text-white whitespace-nowrap">
                        Renew Now
                    </Button>
                </div>
            )}

            {!isExpiredGracePeriod && plan !== 'FREE' && planExpiresAt && (
                <div className="bg-muted/30 border border-border/50 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <div className="flex items-center gap-3">
                        <CalendarX2 className="w-5 h-5 text-muted-foreground" />
                        <div className="text-sm">
                            <span className="text-muted-foreground">Renews on: </span>
                            <span className="font-semibold">{format(planExpiresAt, 'MMM do, yyyy')}</span>
                            {daysUntilExpiry !== null && daysUntilExpiry <= 5 && daysUntilExpiry >= 0 && (
                                <span className="ml-2 text-yellow-500 font-medium">({daysUntilExpiry} days left)</span>
                            )}
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleCancelPlan} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20">
                        Cancel Plan
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {plans.map((p) => (
                    <div
                        key={p.id}
                        className={cn(
                            "relative rounded-3xl p-6 border transition-all duration-300 hover:scale-[1.02] flex flex-col",
                            p.id === plan
                                ? "bg-muted/10 border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.05)]"
                                : "bg-background/40 border-border/50 hover:border-muted-foreground/30"
                        )}
                    >
                        {p.popular && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                Most Popular
                            </span>
                        )}

                        <div className="mb-6 flex-grow">
                            <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">${p.price}</span>
                                <span className="text-muted-foreground text-sm">USDC/month</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{p.description}</p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {p.features.map(f => (
                                <li key={f} className="flex items-start gap-3 group">
                                    <div className="mt-1 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{f}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-auto">
                            {p.id === plan ? (
                                <Button className="w-full py-6 rounded-2xl font-bold text-sm bg-muted text-foreground cursor-default hover:bg-muted" disabled>
                                    Current Plan
                                </Button>
                            ) : p.id === 'FREE' ? (
                                <Button className="w-full py-6 rounded-2xl font-bold text-sm bg-muted hover:bg-muted-foreground/20 text-foreground" onClick={handleCancelPlan}>
                                    Downgrade to Free
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handleUpgradeClick(p.id as 'PRO' | 'WHALE')}
                                    className={cn(
                                        "w-full py-6 rounded-2xl font-bold text-sm transition-all shadow-xl",
                                        p.id === 'PRO'
                                            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
                                            : "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-secondary/20"
                                    )}
                                >
                                    Upgrade to {p.name}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {usage && (
                <div className="bg-muted/10 border border-border/50 rounded-2xl p-6">
                    <h4 className="font-bold mb-4">Current Billing Cycle Usage</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                <span>Sentinel Analyses (Monthly)</span>
                                <span>
                                    {usage.analysesCount.toLocaleString()} / {usage.apiLimit === -1 ? 'Unlimited' : usage.apiLimit.toLocaleString()}
                                </span>
                            </div>
                            <div className="h-3 bg-muted/20 rounded-full overflow-hidden border border-border/20">
                                <div
                                    className={cn("h-full relative shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]", usage.apiLimit === -1 ? "bg-green-500/50" : "bg-gradient-to-r from-primary to-secondary")}
                                    style={{
                                        width: usage.apiLimit === -1 ? '100%' : `${Math.min(100, Math.round((usage.analysesCount / usage.apiLimit) * 100))}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                <span>Watchlist Items</span>
                                <span>
                                    {usage.watchlistCount.toLocaleString()} {plan === 'FREE' ? '/ 5' : ''}
                                </span>
                            </div>
                             <div className="h-3 bg-muted/20 rounded-full overflow-hidden border border-border/20">
                                <div
                                    className="h-full bg-blue-500 relative"
                                    style={{
                                        width: plan === 'FREE' ? `${Math.min(100, Math.round((usage.watchlistCount / 5) * 100))}%` : '100%',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <CheckoutModal 
                isOpen={isCheckoutOpen} 
                onClose={() => setIsCheckoutOpen(false)} 
                planId={selectedPlan}
                onSuccess={loadData}
            />
        </div>
    );
}

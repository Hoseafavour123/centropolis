'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BillingPanel() {
    const { user } = useUser();
    const [plan, setPlan] = React.useState('FREE');
    const [usage, setUsage] = React.useState<{ apiCalls: number; apiLimit: number } | null>(null);

    React.useEffect(() => {
        if (!user) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/user/${user.id}/plan`);
                if (!res.ok) return;
                const data = await res.json();
                if (cancelled) return;
                if (data.plan) setPlan(data.plan);
                if (data.usage) setUsage({ apiCalls: data.usage.apiCalls, apiLimit: data.usage.apiLimit });
            } catch {
                // keep defaults
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);

    const plans = [
        {
            id: 'FREE',
            name: 'Free',
            price: '$0',
            description: 'Perfect for exploring the platform features.',
            features: ['Basic Analytics', '5 Alerts', 'Standard Support', 'Public API (Limit 5k/mo)'],
            color: 'muted'
        },
        {
            id: 'PRO',
            name: 'Pro',
            price: '$29',
            description: 'Advanced tools for serious individual traders.',
            features: ['Advanced Sentiment AI', 'Unlimited Alerts', 'Priority Support', 'Full API Access (50k/mo)'],
            color: 'primary',
            popular: true
        },
        {
            id: 'WHALE',
            name: 'Whale',
            price: '$199',
            description: 'The ultimate setup for institutional-grade trading.',
            features: ['Real-time Risk Engine', 'Early Access Tokens', 'Dedicated Account Manager', 'Infinite API Usage'],
            color: 'secondary'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Billing & Plan</h2>
                    <p className="text-muted-foreground text-sm">Manage your subscription and monitor your usage limits.</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary fill-primary" />
                    <div>
                        <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Current Plan</p>
                        <p className="text-sm font-bold text-foreground">{plan}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {plans.map((p) => (
                    <div
                        key={p.id}
                        className={cn(
                            "relative rounded-3xl p-6 border transition-all duration-300 hover:scale-[1.02]",
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

                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">{p.price}</span>
                                <span className="text-muted-foreground text-sm">/month</span>
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

                        <Button
                            className={cn(
                                "w-full py-6 rounded-2xl font-bold text-sm transition-all shadow-xl",
                                p.id === plan
                                    ? "bg-muted text-foreground cursor-default hover:bg-muted"
                                    : p.id === 'PRO'
                                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
                                        : "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-secondary/20"
                            )}
                            disabled={p.id === plan}
                        >
                            {p.id === plan ? 'Current Plan' : `Upgrade to ${p.name}`}
                        </Button>
                    </div>
                ))}
            </div>

            {/* Usage placeholder */}
            <div className="bg-muted/10 border border-border/50 rounded-2xl p-6">
                <h4 className="font-bold mb-4">API Usage Statistics</h4>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            <span>Calls this period</span>
                            <span>
                                {(usage?.apiCalls ?? 0).toLocaleString()} / {(usage?.apiLimit ?? 5000).toLocaleString()}
                            </span>
                        </div>
                        <div className="h-3 bg-muted/20 rounded-full overflow-hidden border border-border/20">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-secondary relative shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                                style={{
                                    width: `${Math.min(100, Math.round(((usage?.apiCalls ?? 0) / (usage?.apiLimit ?? 5000)) * 100))}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

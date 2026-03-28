'use client';

import React from 'react';
import { SettingsLayout } from '@/components/Settings/SettingsLayout';
import { ProfileSettings } from '@/components/Settings/ProfileSettings';
import { BillingPanel } from '@/components/Settings/BillingPanel';
import { SecuritySettings } from '@/components/Settings/SecuritySettings';
import { ApiKeysPanel } from '@/components/Settings/ApiKeysPanel';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SettingsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get('tab') || 'profile';

    const [activeTab, setActiveTab] = React.useState(tabParam);

    // Sync state with URL but don't force it if user clicks local buttons
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.push(`/settings?tab=${tab}`, { scroll: false });
    };

    return (
        <div className="min-h-screen bg-transparent">
            {/* Header section with glass effect */}
            <div className="pt-12 pb-8 px-4 border-b border-border/20 backdrop-blur-sm bg-background/20 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                        Settings
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium max-w-2xl">
                        Configure your Centropolis experience, manage API access, and secure your trading environment.
                    </p>
                </div>
            </div>

            <SettingsLayout activeTab={activeTab} setActiveTab={handleTabChange}>
                {activeTab === 'profile' && <ProfileSettings />}
                {activeTab === 'billing' && <BillingPanel />}
                {activeTab === 'security' && <SecuritySettings />}
                {activeTab === 'apikeys' && <ApiKeysPanel />}
            </SettingsLayout>
        </div>
    );
}

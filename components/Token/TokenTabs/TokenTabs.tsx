'use client';

import { useState } from 'react';
import { OverviewTab } from './OverviewTab';
import { HoldersTab } from './HoldersTab';
import { PoolsTab } from './PoolsTab';
import { SocialTab } from './SocialTab';
import { FlowTab } from './FlowTab';

interface TokenTabsProps {
  chain: string;
  address: string;
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'holders', label: 'Holders' },
  { id: 'pools', label: 'Pools' },
  { id: 'social', label: 'Social' },
  { id: 'flow', label: 'Onchain Flow' },
] as const;

export function TokenTabs({ chain, address }: TokenTabsProps) {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]['id']>('overview');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 border-b border-border/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id 
                ? 'text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab chain={chain} address={address} />}
        {activeTab === 'holders' && <HoldersTab chain={chain} address={address} />}
        {activeTab === 'pools' && <PoolsTab chain={chain} address={address} />}
        {activeTab === 'social' && <SocialTab chain={chain} address={address} />}
        {activeTab === 'flow' && <FlowTab chain={chain} address={address} />}
      </div>
    </div>
  );
}
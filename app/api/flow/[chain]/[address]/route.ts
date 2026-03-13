import { NextRequest, NextResponse } from 'next/server';
import { FlowEdge } from '@/types/token';

const FLOW_DATABASE: Record<string, FlowEdge[]> = {
  'So11111111111111111111111111111111111111112': [
    { from: 'Binance Hot Wallet', to: 'Whale Accumulators', amountUsd: 15000000, count: 45, fromLabel: 'CEX', toLabel: 'Whale' },
    { from: 'Whale Accumulators', to: 'Staking Contracts', amountUsd: 8900000, count: 23, fromLabel: 'Whale', toLabel: 'Staking' },
    { from: 'Retail Wallets', to: 'DEX Liquidity', amountUsd: 5600000, count: 1240, fromLabel: 'Retail', toLabel: 'DEX' },
    { from: 'DEX Liquidity', to: 'Whale Accumulators', amountUsd: 3200000, count: 67, fromLabel: 'DEX', toLabel: 'Whale' },
    { from: 'Staking Contracts', to: 'Validator Nodes', amountUsd: 12000000, count: 89, fromLabel: 'Staking', toLabel: 'Validator' },
    { from: 'Coinbase Hot Wallet', to: 'Institutional Custody', amountUsd: 8200000, count: 12, fromLabel: 'CEX', toLabel: 'Institution' },
    { from: 'Institutional Custody', to: 'Staking Contracts', amountUsd: 6500000, count: 8, fromLabel: 'Institution', toLabel: 'Staking' },
    { from: 'Validator Nodes', to: 'Delegation Rewards', amountUsd: 2100000, count: 156, fromLabel: 'Validator', toLabel: 'Rewards' },
    { from: 'Delegation Rewards', to: 'Retail Wallets', amountUsd: 1800000, count: 3400, fromLabel: 'Rewards', toLabel: 'Retail' },
    { from: 'OTC Desks', to: 'Whale Accumulators', amountUsd: 9500000, count: 6, fromLabel: 'OTC', toLabel: 'Whale' },
  ],
};

function generateFlowEdges(address: string): FlowEdge[] {
  const categories = ['CEX', 'Whale', 'DEX', 'Staking', 'Retail', 'Institution', 'OTC', 'Bridge'];
  const edges: FlowEdge[] = [];
  
  for (let i = 0; i < 8; i++) {
    const from = categories[Math.floor(Math.random() * categories.length)];
    let to = categories[Math.floor(Math.random() * categories.length)];
    while (to === from) {
      to = categories[Math.floor(Math.random() * categories.length)];
    }
    
    edges.push({
      from: `${from} ${Math.floor(Math.random() * 100)}`,
      to: `${to} ${Math.floor(Math.random() * 100)}`,
      amountUsd: Math.random() * 20000000 + 1000000,
      count: Math.floor(Math.random() * 5000) + 10,
      fromLabel: from,
      toLabel: to,
    });
  }
  
  return edges;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  const { address } = await params;

  // Simulate network delay
  await new Promise(r => setTimeout(r, 250 + Math.random() * 250));

  const edges = FLOW_DATABASE[address] || generateFlowEdges(address);

  // Sort by amount descending
  edges.sort((a, b) => b.amountUsd - a.amountUsd);

  return NextResponse.json(edges, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
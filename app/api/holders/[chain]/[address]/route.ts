import { NextRequest, NextResponse } from 'next/server';
import { Holder } from '@/types/token';

// Generate realistic holder distribution
function generateHolders(tokenAddress: string, limit: number): Holder[] {
  const holders: Holder[] = [];
  
  // Known patterns for specific tokens
  const isSOL = tokenAddress.includes('So1111');
  const isBONK = tokenAddress.includes('DezXA');
  
  // Top holders with labels
  const topHolders: Holder[] = isSOL ? [
    { address: '5D1f...BL5w', label: 'dev', percentage: 9.2, amount: '53500000', firstSeen: '2020-03-01', lastSeen: '2024-03-13' },
    { address: 'WBZf...3AE', label: 'whale', percentage: 4.8, amount: '27900000', firstSeen: '2021-06-12', lastSeen: '2024-03-13' },
    { address: 'BSDx...5SL', label: 'exchange', percentage: 2.6, amount: '15100000', firstSeen: '2022-01-20', lastSeen: '2024-03-13' },
    { address: '2g5s...LD', label: 'smart_money', percentage: 1.8, amount: '10400000', firstSeen: '2023-08-05', lastSeen: '2024-03-13' },
    { address: '7x9v...4pQ', label: 'whale', percentage: 1.4, amount: '8100000', firstSeen: '2023-11-12', lastSeen: '2024-03-12' },
    { address: '9mN2...7xB', label: 'smart_money', percentage: 1.2, amount: '6980000', firstSeen: '2023-09-18', lastSeen: '2024-03-13' },
    { address: '3aK8...9zL', label: 'whale', percentage: 1.1, amount: '6400000', firstSeen: '2022-04-22', lastSeen: '2024-03-11' },
    { address: '1k4m...2nP', label: 'exchange', percentage: 0.9, amount: '5230000', firstSeen: '2022-08-30', lastSeen: '2024-03-13' },
    { address: '6jH3...5rT', label: 'unknown', percentage: 0.8, amount: '4650000', firstSeen: '2023-12-01', lastSeen: '2024-03-10' },
    { address: '8bF5...1wX', label: 'smart_money', percentage: 0.7, amount: '4070000', firstSeen: '2024-01-15', lastSeen: '2024-03-13' },
  ] : isBONK ? [
    { address: 'BONK...DEV1', label: 'dev', percentage: 5.2, amount: '4863472000000', firstSeen: '2022-12-25', lastSeen: '2024-03-13' },
    { address: 'BONK...WHALE', label: 'whale', percentage: 3.8, amount: '3554036000000', firstSeen: '2023-01-05', lastSeen: '2024-03-13' },
    { address: 'BONK...BURN', label: 'unknown', percentage: 32.5, amount: '30396700000000', firstSeen: '2023-01-01', lastSeen: '2024-03-13' },
  ] : [];

  // Fill with random holders
  const labels: Array<Holder['label']> = ['whale', 'smart_money', 'exchange', 'unknown'];
  
  for (let i = topHolders.length; i < limit; i++) {
    const rank = i + 1;
    const percentage = Math.max(0.01, (5 / Math.sqrt(rank)) * Math.random());
    const amount = String(Math.floor(Math.random() * 1000000000));
    
    holders.push({
      address: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
      label: labels[Math.floor(Math.random() * labels.length)],
      percentage: parseFloat(percentage.toFixed(2)),
      amount,
      firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastSeen: new Date().toISOString().split('T')[0],
    });
  }

  return [...topHolders, ...holders].slice(0, limit);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  const { address } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  // Simulate network delay
  await new Promise(r => setTimeout(r, 200 + Math.random() * 300));

  const holders = generateHolders(address, limit);

  // Sort by percentage descending
  holders.sort((a, b) => b.percentage - a.percentage);

  return NextResponse.json(holders, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
    },
  });
}
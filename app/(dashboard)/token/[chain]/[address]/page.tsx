import { Metadata } from 'next';
import { TokenPageClient } from './client/TokenPageClient';
import { TokenMeta } from '@/types/token';
import { tokenAggregator } from '@/services/token/tokenAggregator';

type TokenPageProps = {
  params: Promise<{ chain: string; address: string }>
};

// Server-side fetch for metadata
async function fetchTokenMeta(chain: string, address: string): Promise<TokenMeta | null> {
  try {
    return await tokenAggregator.getTokenMeta(chain, address);
  } catch (error) {
    console.error(`[TokenPage SSR] Error fetching meta for ${chain}/${address}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: TokenPageProps): Promise<Metadata> {
  const { chain, address } = await params
  const meta = await fetchTokenMeta(chain, address);

  return {
    title: meta ? `${meta.symbol} | ${meta.name} | Binocs` : 'Token | Binocs',
    description: meta
      ? `${meta.name} (${meta.symbol}) - Market Cap: $${((meta.marketCapUsd || 0) / 1e9).toFixed(2)}B | Safety Score: ${meta.safetyScore}/100`
      : 'Token details and analysis on Binocs',
  };
}

export default async function TokenPage({ params }: TokenPageProps) {
  const { chain, address } = await params;

  const initialMeta = await fetchTokenMeta(chain, address);

  return (
    <TokenPageClient
      chain={chain}
      address={address}
      initialMeta={initialMeta}
    />
  );
}
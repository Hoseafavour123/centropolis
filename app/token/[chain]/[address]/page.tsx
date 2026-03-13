import { Metadata } from 'next';
import { TokenPageClient } from './client/TokenPageClient';
import { TokenMeta } from '@/types/token';

type TokenPageProps = {
  params: Promise<{ chain: string; address: string }>
};

// Server-side fetch for metadata
async function fetchTokenMeta(chain: string, address: string): Promise<TokenMeta | null> {
  try {
    // In production: absolute URL or internal fetch
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token/${chain}/${address}/meta`, {
      next: { revalidate: 300 }, // 5 minute cache
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: TokenPageProps): Promise<Metadata> {
    const { chain, address } = await params 
    const meta = await fetchTokenMeta(chain, address);
  
  return {
    title: meta ? `${meta.symbol} | ${meta.name} | Centropolis` : 'Token | Centropolis',
    description: meta 
      ? `${meta.name} (${meta.symbol}) - Market Cap: $${((meta.marketCapUsd || 0) / 1e9).toFixed(2)}B | Safety Score: ${meta.safetyScore}/100`
      : 'Token details and analysis on Centropolis',
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
/**
 * ============================================================================
 * /api/search — Live token search
 * ============================================================================
 * Accepts ?q=<query>
 *
 * Strategy:
 *  1. If the query looks like a Solana address (base58, 32-44 chars) → fetch
 *     DexScreener tokens endpoint directly for that contract address.
 *  2. Otherwise, fetch DexScreener search + Jupiter strict token list in
 *     parallel, merge results, de-duplicate by token address, and return top 8.
 *
 * Response shape: SearchResult[]
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export interface SearchResult {
  address: string;
  chain: string;
  symbol: string;
  name: string;
  logoUrl?: string;
  priceUsd?: number;
  change24h?: number;
  volume24h?: number;
  type: "token" | "wallet";
}

// ── Jupiter strict token list (cached in-memory between requests) ─────────────

let jupiterCache: JupiterToken[] | null = null;
let jupiterCachedAt = 0;
const JUPITER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface JupiterToken {
  address: string;
  symbol: string;
  name: string;
  logoURI?: string;
  chainId: number; // 101 = mainnet
}

async function getJupiterTokenList(): Promise<JupiterToken[]> {
  const now = Date.now();
  if (jupiterCache && now - jupiterCachedAt < JUPITER_CACHE_TTL) {
    return jupiterCache;
  }
  try {
    const { data } = await axios.get<JupiterToken[]>(
      "https://token.jup.ag/strict",
      { timeout: 8000 }
    );
    jupiterCache = Array.isArray(data) ? data : [];
    jupiterCachedAt = now;
    return jupiterCache;
  } catch {
    return jupiterCache ?? [];
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Detects Solana base58 addresses (32–44 alphanumeric chars, no 0/O/I/l) */
function isSolanaAddress(str: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(str.trim());
}

/** Detects Ethereum-style addresses */
function isEvmAddress(str: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(str.trim());
}

function buildChain(chainId: string): string {
  const map: Record<string, string> = {
    solana: "solana",
    ethereum: "ethereum",
    bsc: "bsc",
    base: "base",
    polygon: "polygon",
  };
  return map[chainId?.toLowerCase()] ?? chainId ?? "solana";
}

// ── DexScreener search ────────────────────────────────────────────────────────

async function searchDexScreener(query: string): Promise<SearchResult[]> {
  try {
    const { data } = await axios.get(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`,
      { timeout: 8000 }
    );

    const pairs: any[] = data?.pairs ?? [];
    const seen = new Set<string>();
    const results: SearchResult[] = [];

    for (const pair of pairs) {
      const addr = pair.baseToken?.address;
      if (!addr || seen.has(addr)) continue;
      seen.add(addr);

      results.push({
        address: addr,
        chain: buildChain(pair.chainId),
        symbol: pair.baseToken?.symbol ?? "?",
        name: pair.baseToken?.name ?? "Unknown",
        logoUrl: pair.info?.imageUrl || undefined,
        priceUsd: parseFloat(pair.priceUsd) || undefined,
        change24h: pair.priceChange?.h24 ?? undefined,
        volume24h: pair.volume?.h24 ?? undefined,
        type: "token",
      });

      if (results.length >= 8) break;
    }
    return results;
  } catch {
    return [];
  }
}

/** Fetch a single token by address from DexScreener */
async function fetchByAddress(address: string): Promise<SearchResult[]> {
  try {
    const { data } = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      { timeout: 8000 }
    );

    const pairs: any[] = data?.pairs ?? [];
    if (!pairs.length) return [];

    // Sort by volume, pick best pair
    const best = pairs.sort(
      (a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0)
    )[0];

    return [
      {
        address,
        chain: buildChain(best.chainId),
        symbol: best.baseToken?.symbol ?? "?",
        name: best.baseToken?.name ?? "Unknown",
        logoUrl: best.info?.imageUrl || undefined,
        priceUsd: parseFloat(best.priceUsd) || undefined,
        change24h: best.priceChange?.h24 ?? undefined,
        volume24h: best.volume?.h24 ?? undefined,
        type: "token",
      },
    ];
  } catch {
    return [];
  }
}

/** Fuzzy-search the Jupiter token list */
async function searchJupiter(query: string): Promise<SearchResult[]> {
  const list = await getJupiterTokenList();
  const q = query.toLowerCase();

  return list
    .filter(
      (t) =>
        t.symbol.toLowerCase().startsWith(q) ||
        t.name.toLowerCase().includes(q)
    )
    .slice(0, 8)
    .map((t) => ({
      address: t.address,
      chain: "solana",
      symbol: t.symbol,
      name: t.name,
      logoUrl: t.logoURI || undefined,
      type: "token" as const,
    }));
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json([], { status: 200 });
  }

  // ── Wallet / contract address detection ───────────────────────────────────
  if (isSolanaAddress(q)) {
    // Could be a token mint or a wallet address — try token first
    const tokenResults = await fetchByAddress(q);
    if (tokenResults.length > 0) {
      return NextResponse.json(tokenResults, {
        headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
      });
    }
    // Looks like a wallet address
    return NextResponse.json(
      [{ address: q, chain: "solana", symbol: "", name: q.slice(0, 8) + "…" + q.slice(-4), type: "wallet" }],
      { headers: { "Cache-Control": "public, s-maxage=30" } }
    );
  }

  if (isEvmAddress(q)) {
    const tokenResults = await fetchByAddress(q);
    return NextResponse.json(tokenResults.length ? tokenResults : [
      { address: q, chain: "ethereum", symbol: "", name: q.slice(0, 8) + "…" + q.slice(-4), type: "wallet" },
    ], {
      headers: { "Cache-Control": "public, s-maxage=30" },
    });
  }

  // ── Text search: DexScreener + Jupiter in parallel ────────────────────────
  const [dexResults, jupResults] = await Promise.all([
    searchDexScreener(q),
    searchJupiter(q),
  ]);

  // Merge: DexScreener is authoritative (has live price). Supplement with
  // Jupiter entries that aren't already in the DexScreener results.
  const seen = new Set(dexResults.map((r) => r.address));
  const merged: SearchResult[] = [...dexResults];

  for (const r of jupResults) {
    if (!seen.has(r.address)) {
      seen.add(r.address);
      merged.push(r);
    }
    if (merged.length >= 8) break;
  }

  return NextResponse.json(merged.slice(0, 8), {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: () => null,
  images: {
    remotePatterns: [
      // DexScreener CDN (token logos)
      { protocol: "https", hostname: "dd.dexscreener.com" },
      // Helius / Metaplex on Arweave
      { protocol: "https", hostname: "arweave.net" },
      // IPFS gateways
      { protocol: "https", hostname: "cf-ipfs.com" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "gateway.ipfs.io" },
      // CoinGecko
      { protocol: "https", hostname: "assets.coingecko.com" },
      // Jupiter token list images
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      // Generic CDNs used by Solana token metadata
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "imagedelivery.net" },
      { protocol: "https", hostname: "cdn.helius-rpc.com" },
    ],
  },
};

export default nextConfig;

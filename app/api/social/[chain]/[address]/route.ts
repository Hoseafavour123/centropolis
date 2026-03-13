import { NextRequest, NextResponse } from 'next/server';
import { SocialPost } from '@/types/token';

const SOCIAL_DATABASE: Record<string, SocialPost[]> = {
  'So11111111111111111111111111111111111111112': [
    {
      id: 'tw-1',
      platform: 'twitter',
      author: 'solana_whale',
      content: 'SOL breaking $140 resistance with strong volume. Smart money accumulating heavily. Next stop $155? 🚀',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      engagement: 12400,
    },
    {
      id: 'tg-1',
      platform: 'telegram',
      author: 'SolanaNews',
      content: 'JitoSOL integration now live on major DEXs. LST market heating up. Validator revenue sharing proposal passed.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      engagement: 8900,
    },
    {
      id: 'tw-2',
      platform: 'twitter',
      author: 'crypto_critic',
      content: 'Concerned about concentration in top holders. 23% is high for a mature chain. Need more distribution.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      sentiment: 'negative',
      engagement: 3400,
    },
    {
      id: 'tw-3',
      platform: 'twitter',
      author: 'analyst_jane',
      content: 'SOL technical analysis: RSI at 72 suggests overbought. Expect pullback to $130-135 before next leg up.',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      sentiment: 'neutral',
      engagement: 5600,
    },
    {
      id: 'discord-1',
      platform: 'discord',
      author: 'ValidatorDAO',
      content: 'New stake pool launched with 6.5% APY. MEV rewards distributed weekly. Join #staking channel for details.',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      engagement: 2300,
    },
  ],
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': [
    {
      id: 'tw-bonk-1',
      platform: 'twitter',
      author: 'bonk_community',
      content: 'BONK to the moon! 🐕 Another zero gone! Who\'s still holding with me?',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      engagement: 45600,
    },
  ],
};

function generateSocialPosts(address: string): SocialPost[] {
  const platforms: Array<'twitter' | 'telegram' | 'discord'> = ['twitter', 'telegram', 'discord'];
  const sentiments: Array<'positive' | 'negative' | 'neutral'> = ['positive', 'positive', 'neutral', 'negative'];
  
  const posts: SocialPost[] = [];
  const count = 5 + Math.floor(Math.random() * 10);
  
  for (let i = 0; i < count; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    
    posts.push({
      id: `${platform}-${i}-${Date.now()}`,
      platform,
      author: `${platform}_user_${Math.floor(Math.random() * 10000)}`,
      content: generateRandomContent(sentiment, address),
      timestamp: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString(),
      sentiment,
      engagement: Math.floor(Math.random() * 50000),
    });
  }
  
  return posts;
}

function generateRandomContent(sentiment: string, address: string): string {
  const contents: Record<string, string[]> = {
    positive: [
      'Amazing project! The team is delivering consistently. 🚀',
      'Just doubled my position. This is going to be huge!',
      'Best community in crypto. So bullish on this!',
      'Technical analysis looks great. Breaking out soon!',
    ],
    negative: [
      'Concerned about the tokenomics. Need more clarity.',
      'Volume dropping off. Where is the marketing?',
      'Competitors are catching up. Need innovation.',
      'Whale dumps getting concerning. Watch your risk.',
    ],
    neutral: [
      'Waiting for more data before making a decision.',
      'Interesting development. Will monitor closely.',
      'Market conditions are mixed. Neutral stance for now.',
      'Good tech, but adoption still early. Patience needed.',
    ],
  };
  
  const options = contents[sentiment];
  return options[Math.floor(Math.random() * options.length)];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  const { address } = await params;

  // Simulate network delay
  await new Promise(r => setTimeout(r, 200 + Math.random() * 300));

  const posts = SOCIAL_DATABASE[address] || generateSocialPosts(address);

  // Sort by timestamp descending
  posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json(posts, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
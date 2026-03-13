'use client';

import { useQuery } from '@tanstack/react-query';
import { SocialPost } from '@/types/token';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Twitter, Send, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

const fetchSocialPosts = async (chain: string, address: string): Promise<SocialPost[]> => {
  const res = await fetch(`/api/social/${chain}/${address}`);
  if (!res.ok) throw new Error('Failed to fetch social posts');
  return res.json();
};

interface SocialTabProps {
  chain: string;
  address: string;
}

const platformIcons = {
  twitter: Twitter,
  telegram: Send,
  discord: MessageSquare,
};

const sentimentIcons = {
  positive: ThumbsUp,
  negative: ThumbsDown,
  neutral: Minus,
};

const sentimentColors = {
  positive: 'text-green-500',
  negative: 'text-red-500',
  neutral: 'text-yellow-500',
};

export function SocialTab({ chain, address }: SocialTabProps) {
  const { data: posts, isLoading } = useQuery<SocialPost[]>({
    queryKey: ['social', chain, address],
    queryFn: () => fetchSocialPosts(chain, address),
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts?.map((post) => {
        const PlatformIcon = platformIcons[post.platform];
        const SentimentIcon = sentimentIcons[post.sentiment];
        
        return (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <PlatformIcon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">@{post.author}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {post.platform}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <SentimentIcon className={`w-3 h-3 ${sentimentColors[post.sentiment]}`} />
                      <span>{new Date(post.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{post.content}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{post.engagement.toLocaleString()} engagements</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
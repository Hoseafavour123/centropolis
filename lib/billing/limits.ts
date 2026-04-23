// lib/billing/limits.ts
import { prisma } from '@/lib/prisma';
import { differenceInDays, startOfMonth, startOfDay } from 'date-fns';

export type PlanType = 'FREE' | 'PRO' | 'WHALE';

export interface PlanLimits {
  id: PlanType;
  price: number;
  maxAnalysesPerMonth: number;
  maxWatchlistItems: number;
  maxApiKeys: number;
  maxChatsPerDay: number;
  canExportChat: boolean;
  supportLevel: 'Standard' | 'Priority' | 'Dedicated';
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  FREE: {
    id: 'FREE',
    price: 0,
    maxAnalysesPerMonth: 5,
    maxWatchlistItems: 5,
    maxApiKeys: 1,
    maxChatsPerDay: 20,
    canExportChat: false,
    supportLevel: 'Standard',
  },
  PRO: {
    id: 'PRO',
    price: 0.1, // testing price, change to 29.99 in production
    maxAnalysesPerMonth: 100,
    maxWatchlistItems: -1, // -1 means unlimited
    maxApiKeys: 5,
    maxChatsPerDay: 500,
    canExportChat: true,
    supportLevel: 'Priority',
  },
  WHALE: {
    id: 'WHALE',
    price: 199,
    maxAnalysesPerMonth: -1,
    maxWatchlistItems: -1,
    maxApiKeys: -1,
    maxChatsPerDay: -1,
    canExportChat: true,
    supportLevel: 'Dedicated',
  },
};

export async function checkAndHandleExpiry(user: { id: string; clerkId: string; plan: string; planExpiresAt: Date | null }) {
  if (user.plan === 'FREE') return 'FREE';

  if (user.planExpiresAt) {
    const daysPastExpiry = differenceInDays(new Date(), user.planExpiresAt);
    
    if (daysPastExpiry > 3) { // 3 day grace period
      await prisma.user.update({
        where: { id: user.id },
        data: { plan: 'FREE', planExpiresAt: null, planStartedAt: null }
      });
      return 'FREE';
    }
  }
  return user.plan as PlanType;
}

export async function getUserUsage(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, clerkId: true, plan: true, planExpiresAt: true }
  });

  if (!user) throw new Error('User not found');

  const currentPlan = await checkAndHandleExpiry(user);
  const limits = PLAN_LIMITS[currentPlan];

  const monthStart = startOfMonth(new Date());
  const dayStart = startOfDay(new Date());

  const [analysesCount, watchlistCount, apiKeysCount, chatsCount] = await Promise.all([
    prisma.sentinelAnalysis.count({
      where: { userId: user.id, createdAt: { gte: monthStart } }
    }),
    prisma.watchlist.count({
      where: { userId: user.id }
    }),
    prisma.apiKey.count({
      where: { userId: user.id }
    }),
    prisma.sentinelChatMessage.count({
      where: { chat: { userId: user.id }, createdAt: { gte: dayStart } }
    }),
  ]);

  return {
    plan: currentPlan,
    limits,
    usage: {
      analysesCount,
      watchlistCount,
      apiKeysCount,
      chatsCount,
    },
    planExpiresAt: user.planExpiresAt,
  };
}

export async function enforceLimit(clerkId: string, feature: 'analyses' | 'watchlist' | 'apiKeys' | 'chats' | 'export') {
  const data = await getUserUsage(clerkId);

  switch (feature) {
    case 'analyses':
      if (data.limits.maxAnalysesPerMonth !== -1 && data.usage.analysesCount >= data.limits.maxAnalysesPerMonth) {
        throw new Error('PLAN_LIMIT_REACHED: Monthly analysis limit reached.');
      }
      break;
    case 'watchlist':
      if (data.limits.maxWatchlistItems !== -1 && data.usage.watchlistCount >= data.limits.maxWatchlistItems) {
        throw new Error('PLAN_LIMIT_REACHED: Watchlist limit reached.');
      }
      break;
    case 'apiKeys':
      if (data.limits.maxApiKeys !== -1 && data.usage.apiKeysCount >= data.limits.maxApiKeys) {
        throw new Error('PLAN_LIMIT_REACHED: API keys limit reached.');
      }
      break;
    case 'chats':
      if (data.limits.maxChatsPerDay !== -1 && data.usage.chatsCount >= data.limits.maxChatsPerDay) {
        throw new Error('PLAN_LIMIT_REACHED: Daily chat limit reached.');
      }
      break;
    case 'export':
      if (!data.limits.canExportChat) {
        throw new Error('PLAN_LIMIT_REACHED: Exporting chat is not available on this plan.');
      }
      break;
  }

  return true;
}

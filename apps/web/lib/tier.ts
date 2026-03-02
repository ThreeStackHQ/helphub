import { eq, count, and } from 'drizzle-orm';
import { db } from '@helphub/db';
import { subscriptions, articles } from '@helphub/db';
import { PLANS } from './stripe';

export async function getUserTier(userId: string, workspaceId: string): Promise<keyof typeof PLANS> {
  const [sub] = await db
    .select({ tier: subscriptions.tier, status: subscriptions.status })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.workspaceId, workspaceId)
      )
    )
    .limit(1);

  if (!sub || sub.status !== 'active') return 'free';

  const tier = sub.tier as string;
  if (tier === 'indie' || tier === 'pro') return tier;
  return 'free';
}

export async function canCreateArticle(userId: string, workspaceId: string): Promise<boolean> {
  const tier = await getUserTier(userId, workspaceId);
  const plan = PLANS[tier];

  if (plan.articleLimit === Infinity) return true;

  const [countRow] = await db
    .select({ value: count(articles.id) })
    .from(articles)
    .where(eq(articles.workspaceId, workspaceId));

  const current = Number(countRow?.value ?? 0);
  return current < plan.articleLimit;
}

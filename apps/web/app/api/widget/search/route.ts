export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { sql, eq, and } from 'drizzle-orm';
import { db } from '@helphub/db';
import { articles, analyticsEvents } from '@helphub/db';
import { corsResponse, corsOptionsResponse } from '../../../../lib/cors';
import { checkRateLimit, getClientIp } from '../../../../lib/rate-limit';

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptionsResponse();
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const workspaceId = searchParams.get('workspaceId') ?? '';

  if (!workspaceId) {
    return corsResponse({ error: 'workspaceId is required' }, { status: 400 });
  }

  // Rate limit: 20 searches/min per IP
  const ip = getClientIp(request);
  const rl = checkRateLimit(`search:${ip}`, { limit: 20, windowMs: 60_000 });
  if (rl.limited) return corsResponse({ error: 'Too many requests' }, { status: 429 });

  if (!q) {
    return corsResponse({ articles: [] });
  }

  try {
    const results = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        contentMd: articles.contentMd,
        collectionId: articles.collectionId,
        publishedAt: articles.publishedAt,
        rank: sql<number>`ts_rank(${articles.searchVector}, plainto_tsquery('english', ${q}))`,
      })
      .from(articles)
      .where(
        and(
          eq(articles.workspaceId, workspaceId),
          eq(articles.status, 'published'),
          sql`${articles.searchVector} @@ plainto_tsquery('english', ${q})`
        )
      )
      .orderBy(sql`ts_rank(${articles.searchVector}, plainto_tsquery('english', ${q})) DESC`)
      .limit(10);

    const formatted = results.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      snippet: a.contentMd.slice(0, 150),
      collectionId: a.collectionId,
      publishedAt: a.publishedAt,
    }));

    // Track search_performed event (fire and forget)
    const sessionId = request.headers.get('x-session-id') ?? undefined;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? request.headers.get('x-real-ip') ?? undefined;

    void db.insert(analyticsEvents).values({
      workspaceId,
      event: 'search_performed',
      query: q,
      resultsCount: results.length,
      sessionId: sessionId ?? null,
      ip: ip ?? null,
    }).catch(console.error);

    return corsResponse({ articles: formatted });
  } catch (error) {
    console.error('Search error:', error);
    return corsResponse({ error: 'Internal server error' }, { status: 500 });
  }
}

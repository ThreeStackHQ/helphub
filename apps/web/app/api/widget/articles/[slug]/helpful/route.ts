export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@helphub/db';
import { articles, analyticsEvents } from '@helphub/db';
import { corsResponse, corsOptionsResponse } from '../../../../../../lib/cors';
import { checkRateLimit, getClientIp } from '../../../../../../lib/rate-limit';

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptionsResponse();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    // Rate limit: 50 tracking events/min per IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(`helpful:${ip}`, { limit: 50, windowMs: 60_000 });
    if (rl.limited) return corsResponse({ error: 'Too many requests' }, { status: 429 });

    const { slug } = await params;

    // Fix: query by slug (not by id — the URL param is the article slug)
    const [article] = await db
      .select({ id: articles.id, workspaceId: articles.workspaceId })
      .from(articles)
      .where(eq(articles.slug, slug))
      .limit(1);

    if (!article) {
      return corsResponse({ error: 'Article not found' }, { status: 404 });
    }

    const sessionId = request.headers.get('x-session-id') ?? undefined;

    await db.insert(analyticsEvents).values({
      workspaceId: article.workspaceId,
      articleId: article.id,
      event: 'article_helpful',
      sessionId: sessionId ?? null,
      ip: ip ?? null,
    });

    return corsResponse({ success: true });
  } catch (error) {
    console.error('Article helpful error:', error);
    return corsResponse({ error: 'Internal server error' }, { status: 500 });
  }
}

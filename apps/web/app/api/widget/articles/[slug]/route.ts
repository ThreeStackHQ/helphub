export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@helphub/db';
import { articles, analyticsEvents } from '@helphub/db';
import { corsResponse, corsOptionsResponse } from '../../../../../lib/cors';

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptionsResponse();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId') ?? '';

  if (!workspaceId) {
    return corsResponse({ error: 'workspaceId is required' }, { status: 400 });
  }

  const { slug } = await params;

  try {
    const [article] = await db
      .select()
      .from(articles)
      .where(
        and(
          eq(articles.slug, slug),
          eq(articles.workspaceId, workspaceId),
          eq(articles.status, 'published')
        )
      )
      .limit(1);

    if (!article) {
      return corsResponse({ error: 'Article not found' }, { status: 404 });
    }

    const sessionId = request.headers.get('x-session-id') ?? undefined;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? request.headers.get('x-real-ip') ?? undefined;

    void db.insert(analyticsEvents).values({
      workspaceId,
      articleId: article.id,
      event: 'article_viewed',
      sessionId: sessionId ?? null,
      ip: ip ?? null,
    }).catch(console.error);

    return corsResponse({ article });
  } catch (error) {
    console.error('Get article error:', error);
    return corsResponse({ error: 'Internal server error' }, { status: 500 });
  }
}

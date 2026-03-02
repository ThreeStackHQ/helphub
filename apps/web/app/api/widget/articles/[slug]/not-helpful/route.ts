export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@helphub/db';
import { articles, analyticsEvents } from '@helphub/db';
import { corsResponse, corsOptionsResponse } from '../../../../../../lib/cors';

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptionsResponse();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug: articleId } = await params;

    const [article] = await db
      .select({ id: articles.id, workspaceId: articles.workspaceId })
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);

    if (!article) {
      return corsResponse({ error: 'Article not found' }, { status: 404 });
    }

    const sessionId = request.headers.get('x-session-id') ?? undefined;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? request.headers.get('x-real-ip') ?? undefined;

    await db.insert(analyticsEvents).values({
      workspaceId: article.workspaceId,
      articleId: article.id,
      event: 'article_not_helpful',
      sessionId: sessionId ?? null,
      ip: ip ?? null,
    });

    return corsResponse({ success: true });
  } catch (error) {
    console.error('Article not-helpful error:', error);
    return corsResponse({ error: 'Internal server error' }, { status: 500 });
  }
}

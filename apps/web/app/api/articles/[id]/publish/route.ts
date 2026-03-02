export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@helphub/db';
import { articles, workspaces } from '@helphub/db';
import { requireAuth } from '../../../../../lib/auth-helpers';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { session, error: authError } = await requireAuth();
  if (authError || !session) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const [article] = await db
    .select({ id: articles.id, workspaceUserId: workspaces.userId })
    .from(articles)
    .leftJoin(workspaces, eq(articles.workspaceId, workspaces.id))
    .where(eq(articles.id, id))
    .limit(1);

  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  if (article.workspaceUserId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [updated] = await db
    .update(articles)
    .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(articles.id, id))
    .returning();

  return NextResponse.json({ article: updated });
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@helphub/db';
import { articles, workspaces } from '@helphub/db';
import { requireAuth } from '../../../../lib/auth-helpers';

const updateArticleSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  contentMd: z.string().optional(),
  collectionId: z.string().uuid().nullable().optional(),
  position: z.number().int().optional(),
});

async function getArticleWithOwnership(articleId: string, userId: string) {
  const [article] = await db
    .select({
      id: articles.id,
      workspaceId: articles.workspaceId,
      collectionId: articles.collectionId,
      title: articles.title,
      contentMd: articles.contentMd,
      slug: articles.slug,
      status: articles.status,
      position: articles.position,
      publishedAt: articles.publishedAt,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      workspaceUserId: workspaces.userId,
    })
    .from(articles)
    .leftJoin(workspaces, eq(articles.workspaceId, workspaces.id))
    .where(eq(articles.id, articleId))
    .limit(1);

  if (!article) return { article: null, error: NextResponse.json({ error: 'Article not found' }, { status: 404 }) };
  if (article.workspaceUserId !== userId) return { article: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };

  return { article, error: null };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { session, error: authError } = await requireAuth();
  if (authError || !session) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { article, error } = await getArticleWithOwnership(id, session.user.id);
  if (error) return error;

  return NextResponse.json({ article });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { session, error: authError } = await requireAuth();
  if (authError || !session) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { error: ownerError } = await getArticleWithOwnership(id, session.user.id);
  if (ownerError) return ownerError;

  try {
    const body: unknown = await request.json();
    const parsed = updateArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const updates: Partial<{
      title: string;
      contentMd: string;
      collectionId: string | null;
      position: number;
      updatedAt: Date;
    }> = { updatedAt: new Date() };

    if (parsed.data.title !== undefined) updates.title = parsed.data.title;
    if (parsed.data.contentMd !== undefined) updates.contentMd = parsed.data.contentMd;
    if (parsed.data.collectionId !== undefined) updates.collectionId = parsed.data.collectionId;
    if (parsed.data.position !== undefined) updates.position = parsed.data.position;

    const [updated] = await db
      .update(articles)
      .set(updates)
      .where(eq(articles.id, id))
      .returning();

    return NextResponse.json({ article: updated });
  } catch (error) {
    console.error('Update article error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { session, error: authError } = await requireAuth();
  if (authError || !session) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { error: ownerError } = await getArticleWithOwnership(id, session.user.id);
  if (ownerError) return ownerError;

  await db.delete(articles).where(eq(articles.id, id));

  return NextResponse.json({ success: true });
}

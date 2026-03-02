export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, and, asc } from 'drizzle-orm';
import { nanoid } from '../../../lib/nanoid';
import { db } from '@helphub/db';
import { articles, collections } from '@helphub/db';
import { requireAuth, requireWorkspaceAccess } from '../../../lib/auth-helpers';
import { canCreateArticle } from '../../../lib/tier';

const createArticleSchema = z.object({
  workspaceId: z.string().uuid(),
  title: z.string().min(1).max(500),
  contentMd: z.string().optional().default(''),
  collectionId: z.string().uuid().optional(),
  position: z.number().int().optional(),
});

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { session, error: authError } = await requireAuth();
  if (authError || !session) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  const { error: wsError } = await requireWorkspaceAccess(workspaceId, session.user.id);
  if (wsError) return wsError;

  const result = await db
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
      collectionName: collections.name,
      collectionIcon: collections.icon,
    })
    .from(articles)
    .leftJoin(collections, eq(articles.collectionId, collections.id))
    .where(eq(articles.workspaceId, workspaceId))
    .orderBy(asc(articles.position), asc(articles.createdAt));

  return NextResponse.json({ articles: result });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { session, error: authError } = await requireAuth();
  if (authError || !session) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body: unknown = await request.json();
    const parsed = createArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { workspaceId, title, contentMd, collectionId, position } = parsed.data;

    const { error: wsError } = await requireWorkspaceAccess(workspaceId, session.user.id);
    if (wsError) return wsError;

    // Tier check
    const allowed = await canCreateArticle(session.user.id, workspaceId);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Article limit reached', upgrade: '/pricing' },
        { status: 429 }
      );
    }

    const slug = `${slugify(title)}-${nanoid(6)}`;

    const [article] = await db
      .insert(articles)
      .values({
        workspaceId,
        title,
        contentMd: contentMd ?? '',
        slug,
        collectionId: collectionId ?? null,
        position: position ?? 0,
        status: 'draft',
      })
      .returning();

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error('Create article error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, asc, count } from 'drizzle-orm';
import { db } from '@helphub/db';
import { collections, articles } from '@helphub/db';
import { requireAuth, requireWorkspaceAccess } from '../../../lib/auth-helpers';

const createCollectionSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().max(20).optional(),
});

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
      id: collections.id,
      workspaceId: collections.workspaceId,
      name: collections.name,
      description: collections.description,
      icon: collections.icon,
      color: collections.color,
      position: collections.position,
      createdAt: collections.createdAt,
      articleCount: count(articles.id),
    })
    .from(collections)
    .leftJoin(articles, eq(articles.collectionId, collections.id))
    .where(eq(collections.workspaceId, workspaceId))
    .groupBy(collections.id)
    .orderBy(asc(collections.position), asc(collections.createdAt));

  return NextResponse.json({ collections: result });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { session, error: authError } = await requireAuth();
  if (authError || !session) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body: unknown = await request.json();
    const parsed = createCollectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { workspaceId, name, description, icon, color } = parsed.data;

    const { error: wsError } = await requireWorkspaceAccess(workspaceId, session.user.id);
    if (wsError) return wsError;

    // Auto-increment position
    const existing = await db
      .select({ position: collections.position })
      .from(collections)
      .where(eq(collections.workspaceId, workspaceId))
      .orderBy(asc(collections.position));

    const maxPosition = existing.length > 0
      ? Math.max(...existing.map((c) => c.position)) + 1
      : 0;

    const [collection] = await db
      .insert(collections)
      .values({
        workspaceId,
        name,
        description: description ?? null,
        icon: icon ?? null,
        color: color ?? null,
        position: maxPosition,
      })
      .returning();

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error('Create collection error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

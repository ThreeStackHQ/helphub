export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, count } from 'drizzle-orm';
import { db } from '@helphub/db';
import { collections, articles, workspaces } from '@helphub/db';
import { requireAuth } from '../../../../lib/auth-helpers';

const updateCollectionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
  icon: z.string().max(10).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  position: z.number().int().optional(),
});

async function getCollectionWithOwnership(collectionId: string, userId: string) {
  const [collection] = await db
    .select({
      id: collections.id,
      workspaceId: collections.workspaceId,
      name: collections.name,
      description: collections.description,
      icon: collections.icon,
      color: collections.color,
      position: collections.position,
      createdAt: collections.createdAt,
      workspaceUserId: workspaces.userId,
    })
    .from(collections)
    .leftJoin(workspaces, eq(collections.workspaceId, workspaces.id))
    .where(eq(collections.id, collectionId))
    .limit(1);

  if (!collection) return { collection: null, error: NextResponse.json({ error: 'Collection not found' }, { status: 404 }) };
  if (collection.workspaceUserId !== userId) return { collection: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };

  return { collection, error: null };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { session, error: authError } = await requireAuth();
  if (authError || !session) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { error: ownerError } = await getCollectionWithOwnership(id, session.user.id);
  if (ownerError) return ownerError;

  try {
    const body: unknown = await request.json();
    const parsed = updateCollectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const updates: Partial<{
      name: string;
      description: string | null;
      icon: string | null;
      color: string | null;
      position: number;
    }> = {};

    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.description !== undefined) updates.description = parsed.data.description;
    if (parsed.data.icon !== undefined) updates.icon = parsed.data.icon;
    if (parsed.data.color !== undefined) updates.color = parsed.data.color;
    if (parsed.data.position !== undefined) updates.position = parsed.data.position;

    const [updated] = await db
      .update(collections)
      .set(updates)
      .where(eq(collections.id, id))
      .returning();

    return NextResponse.json({ collection: updated });
  } catch (error) {
    console.error('Update collection error:', error);
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
  const { error: ownerError } = await getCollectionWithOwnership(id, session.user.id);
  if (ownerError) return ownerError;

  // Check if collection has articles
  const [articleCountRow] = await db
    .select({ value: count(articles.id) })
    .from(articles)
    .where(eq(articles.collectionId, id));

  if (articleCountRow && Number(articleCountRow.value) > 0) {
    return NextResponse.json(
      { error: 'Cannot delete collection with articles. Move or delete articles first.' },
      { status: 400 }
    );
  }

  await db.delete(collections).where(eq(collections.id, id));

  return NextResponse.json({ success: true });
}

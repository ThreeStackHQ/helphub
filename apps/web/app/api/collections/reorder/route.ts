export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, getDb } from '@helphub/db';
import { collections, workspaces } from '@helphub/db';
import { requireAuth } from '../../../../lib/auth-helpers';

const reorderSchema = z.object({
  workspaceId: z.string().uuid(),
  items: z.array(
    z.object({
      id: z.string().uuid(),
      position: z.number().int(),
    })
  ).min(1),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { session, error: authError } = await requireAuth();
  if (authError || !session) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body: unknown = await request.json();
    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { workspaceId, items } = parsed.data;

    // Verify workspace ownership
    const [workspace] = await db
      .select({ userId: workspaces.userId })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    if (workspace.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Bulk reorder in transaction
    await getDb().transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(collections)
          .set({ position: item.position })
          .where(eq(collections.id, item.id));
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder collections error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

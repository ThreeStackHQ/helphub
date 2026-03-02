export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@helphub/db';
import { workspaces } from '@helphub/db';
import { requireAuth } from '../../../../lib/auth-helpers';

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  customDomain: z.string().max(255).nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { session, error: authError } = await requireAuth();
  if (authError || !session) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, id))
    .limit(1);

  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  if (workspace.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body: unknown = await request.json();
    const parsed = updateWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const updates: Partial<{
      name: string;
      customDomain: string | null;
      domainVerified: boolean;
    }> = {};

    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.customDomain !== undefined) {
      updates.customDomain = parsed.data.customDomain;
      updates.domainVerified = false;
    }

    const [updated] = await db
      .update(workspaces)
      .set(updates)
      .where(eq(workspaces.id, id))
      .returning();

    return NextResponse.json({ workspace: updated });
  } catch (error) {
    console.error('Update workspace error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { session, error: authError } = await requireAuth();
  if (authError || !session) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, id))
    .limit(1);

  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  if (workspace.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json({ workspace });
}

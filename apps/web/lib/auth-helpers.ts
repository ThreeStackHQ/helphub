import { auth } from '../auth';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@helphub/db';
import { workspaces } from '@helphub/db';

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function requireWorkspaceAccess(workspaceId: string, userId: string) {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!workspace) {
    return { workspace: null, error: NextResponse.json({ error: 'Workspace not found' }, { status: 404 }) };
  }

  if (workspace.userId !== userId) {
    return { workspace: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { workspace, error: null };
}

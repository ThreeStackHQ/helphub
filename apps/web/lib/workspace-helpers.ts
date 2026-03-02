import { auth } from '../auth';
import { redirect } from 'next/navigation';
import { db } from '@helphub/db';
import { workspaces } from '@helphub/db';
import { eq } from 'drizzle-orm';

export async function getWorkspaceForCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.userId, session.user.id))
    .limit(1);

  if (!workspace) redirect('/onboarding');

  return { workspace, session };
}

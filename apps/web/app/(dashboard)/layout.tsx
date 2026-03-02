import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import { db } from '@helphub/db';
import { workspaces } from '@helphub/db';
import { eq } from 'drizzle-orm';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.userId, session.user.id))
    .limit(1);

  if (!workspace) redirect('/onboarding');

  return (
    <DashboardShell
      workspace={{ id: workspace.id, name: workspace.name, slug: workspace.slug }}
      user={{ email: session.user.email ?? '', name: session.user.name ?? null }}
    >
      {children}
    </DashboardShell>
  );
}

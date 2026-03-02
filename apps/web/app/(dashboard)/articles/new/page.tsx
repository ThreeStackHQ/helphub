import ArticleEditor from '../ArticleEditor';
import { getWorkspaceForCurrentUser } from '../../../../lib/workspace-helpers';
import { db } from '@helphub/db';
import { collections } from '@helphub/db';
import { eq, asc } from 'drizzle-orm';

export default async function NewArticlePage() {
  const { workspace } = await getWorkspaceForCurrentUser();

  const collectionRows = await db
    .select({ id: collections.id, name: collections.name, icon: collections.icon })
    .from(collections)
    .where(eq(collections.workspaceId, workspace.id))
    .orderBy(asc(collections.position), asc(collections.createdAt));

  return (
    <ArticleEditor
      workspaceId={workspace.id}
      collections={collectionRows}
    />
  );
}

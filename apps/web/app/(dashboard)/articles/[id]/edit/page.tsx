import ArticleEditor from '../../ArticleEditor';
import { getWorkspaceForCurrentUser } from '../../../../../lib/workspace-helpers';
import { db } from '@helphub/db';
import { collections, articles } from '@helphub/db';
import { eq, asc } from 'drizzle-orm';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const { workspace } = await getWorkspaceForCurrentUser();

  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  if (!article || article.workspaceId !== workspace.id) notFound();

  const collectionRows = await db
    .select({ id: collections.id, name: collections.name, icon: collections.icon })
    .from(collections)
    .where(eq(collections.workspaceId, workspace.id))
    .orderBy(asc(collections.position), asc(collections.createdAt));

  return (
    <ArticleEditor
      workspaceId={workspace.id}
      articleId={article.id}
      initialTitle={article.title}
      initialContent={article.contentMd}
      initialCollectionId={article.collectionId ?? undefined}
      initialStatus={article.status}
      collections={collectionRows}
    />
  );
}

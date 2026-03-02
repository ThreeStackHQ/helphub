// TODO: wire to GET /api/analytics when available
import { getWorkspaceForCurrentUser } from '../../../lib/workspace-helpers';
import { db } from '@helphub/db';
import { articles, collections } from '@helphub/db';
import { eq } from 'drizzle-orm';
import AnalyticsDashboard from './AnalyticsDashboard';

export default async function AnalyticsPage() {
  const { workspace } = await getWorkspaceForCurrentUser();

  const articleRows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      status: articles.status,
      collectionName: collections.name,
    })
    .from(articles)
    .leftJoin(collections, eq(articles.collectionId, collections.id))
    .where(eq(articles.workspaceId, workspace.id));

  // Placeholder data — wire to GET /api/analytics when available
  const topArticles = articleRows.slice(0, 8).map((a, i) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    collectionName: a.collectionName ?? 'Uncategorized',
    views7d: Math.max(0, 120 - i * 13),
    views30d: Math.max(0, 480 - i * 52),
    helpful: Math.floor(Math.random() * 40) + 10,
    notHelpful: Math.floor(Math.random() * 10) + 1,
  }));

  const searchQueries = [
    { query: 'how to reset password', count: 142, resultsFound: 3 },
    { query: 'billing faq', count: 98, resultsFound: 5 },
    { query: 'api rate limits', count: 74, resultsFound: 2 },
    { query: 'custom domain setup', count: 61, resultsFound: 4 },
    { query: 'webhook integration', count: 44, resultsFound: 0 },
    { query: 'two factor auth', count: 38, resultsFound: 0 },
    { query: 'export data', count: 27, resultsFound: 1 },
    { query: 'sso saml', count: 19, resultsFound: 0 },
  ];

  return (
    <AnalyticsDashboard
      topArticles={topArticles}
      searchQueries={searchQueries}
    />
  );
}

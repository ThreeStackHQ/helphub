import { MetadataRoute } from 'next';
import { db } from '@helphub/db';
import { articles, workspaces } from '@helphub/db';
import { eq } from 'drizzle-orm';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://helphub.threestack.io';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  try {
    const publishedArticles = await db
      .select({
        slug: articles.slug,
        updatedAt: articles.updatedAt,
        workspaceSlug: workspaces.slug,
      })
      .from(articles)
      .leftJoin(workspaces, eq(articles.workspaceId, workspaces.id))
      .where(eq(articles.status, 'published'));

    const articleRoutes: MetadataRoute.Sitemap = publishedArticles
      .filter((a) => a.workspaceSlug)
      .map((a) => ({
        url: `${BASE_URL}/${a.workspaceSlug}/${a.slug}`,
        lastModified: new Date(a.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    return [...staticRoutes, ...articleRoutes];
  } catch {
    return staticRoutes;
  }
}

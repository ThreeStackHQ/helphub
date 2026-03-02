import { db } from '@helphub/db';
import { workspaces, collections, articles } from '@helphub/db';
import { eq, count, asc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, FolderOpen, FileText } from 'lucide-react';
import HelpCenterSearch from './HelpCenterSearch';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [workspace] = await db
    .select({ name: workspaces.name })
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);

  if (!workspace) return { title: 'Help Center' };

  return {
    title: `${workspace.name} Help Center`,
    description: `Find answers and documentation for ${workspace.name}`,
    openGraph: {
      title: `${workspace.name} Help Center`,
      description: `Find answers and documentation for ${workspace.name}`,
    },
  };
}

export default async function HelpCenterPage({ params }: Props) {
  const { slug } = await params;

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);

  if (!workspace) notFound();

  const collectionRows = await db
    .select({
      id: collections.id,
      name: collections.name,
      description: collections.description,
      icon: collections.icon,
      position: collections.position,
      articleCount: count(articles.id),
    })
    .from(collections)
    .leftJoin(
      articles,
      eq(articles.collectionId, collections.id)
    )
    .where(eq(collections.workspaceId, workspace.id))
    .groupBy(collections.id)
    .orderBy(asc(collections.position), asc(collections.createdAt));

  const recentArticles = await db
    .select({ id: articles.id, title: articles.title, slug: articles.slug, collectionId: articles.collectionId, updatedAt: articles.updatedAt })
    .from(articles)
    .where(eq(articles.workspaceId, workspace.id))
    .orderBy(asc(articles.publishedAt))
    .limit(6);

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 to-[#0f172a] border-b border-slate-800 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{workspace.name} Help Center</h1>
          <p className="text-slate-400 text-lg mb-8">How can we help you?</p>
          <HelpCenterSearch workspaceId={workspace.id} slug={slug} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Collections */}
        {collectionRows.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-teal-400" />
              Browse Collections
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {collectionRows.map((col) => (
                <Link
                  key={col.id}
                  href={`/${slug}#collection-${col.id}`}
                  className="group bg-slate-800 rounded-xl border border-slate-700 hover:border-teal-700 p-5 transition-all"
                >
                  <div className="text-3xl mb-3">{col.icon ?? '📁'}</div>
                  <h3 className="text-white font-semibold mb-1 group-hover:text-teal-400 transition-colors">
                    {col.name}
                  </h3>
                  {col.description && (
                    <p className="text-slate-400 text-sm line-clamp-2 mb-2">{col.description}</p>
                  )}
                  <span className="text-xs text-slate-500">
                    {col.articleCount} article{col.articleCount !== 1 ? 's' : ''}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent articles */}
        {recentArticles.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" />
              Popular Articles
            </h2>
            <div className="space-y-2">
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/${slug}/${article.slug}`}
                  className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-teal-700 hover:bg-slate-700/60 transition-all group"
                >
                  <FileText className="w-4 h-4 text-slate-500 flex-shrink-0 group-hover:text-teal-400 transition-colors" />
                  <span className="text-white text-sm font-medium group-hover:text-teal-300 transition-colors">
                    {article.title}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {collectionRows.length === 0 && recentArticles.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No articles published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

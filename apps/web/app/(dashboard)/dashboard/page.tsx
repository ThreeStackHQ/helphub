import { getWorkspaceForCurrentUser } from '../../../lib/workspace-helpers';
import { db } from '@helphub/db';
import { articles, collections } from '@helphub/db';
import { eq, count } from 'drizzle-orm';
import Link from 'next/link';
import { FileText, BookOpen, Eye, TrendingUp, Plus, ArrowRight } from 'lucide-react';

export default async function DashboardPage() {
  const { workspace } = await getWorkspaceForCurrentUser();

  // Fetch articles with collection info
  const articleRows = await db
    .select({
      id: articles.id,
      title: articles.title,
      status: articles.status,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      collectionId: articles.collectionId,
    })
    .from(articles)
    .where(eq(articles.workspaceId, workspace.id))
    .orderBy(articles.updatedAt)
    .limit(10);

  const collectionRows = await db
    .select({ id: collections.id, name: collections.name, icon: collections.icon, articleCount: count(articles.id) })
    .from(collections)
    .leftJoin(articles, eq(articles.collectionId, collections.id))
    .where(eq(collections.workspaceId, workspace.id))
    .groupBy(collections.id);

  const collectionMap = new Map(collectionRows.map((c) => [c.id, c]));

  const totalArticles = articleRows.length;
  const published = articleRows.filter((a) => a.status === 'published').length;
  const totalCollections = collectionRows.length;

  const stats = [
    { label: 'Total Articles', value: totalArticles, icon: FileText, color: 'text-teal-400' },
    { label: 'Published', value: published, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Collections', value: totalCollections, icon: BookOpen, color: 'text-blue-400' },
    { label: 'Views (30d)', value: 0, icon: Eye, color: 'text-purple-400', note: 'analytics coming soon' },
  ];

  const recent = [...articleRows].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 8);

  return (
    <div className="p-6 space-y-8">
      {/* Stats */}
      <div>
        <h1 className="text-xl font-semibold text-white mb-5">Overview</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <div className={`${stat.color} mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                {stat.note && <div className="text-xs text-slate-500 mt-1">{stat.note}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Articles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Articles</h2>
          <Link href="/articles" className="flex items-center gap-1 text-sm text-teal-400 hover:text-teal-300">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 border-dashed p-12 text-center">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium mb-1">No articles yet</p>
            <p className="text-slate-500 text-sm mb-4">Create your first article to get started</p>
            <Link
              href="/articles/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first article
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Title</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Collection</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {recent.map((article) => {
                  const coll = article.collectionId ? collectionMap.get(article.collectionId) : null;
                  return (
                    <tr key={article.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-white text-sm font-medium line-clamp-1">{article.title}</span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-slate-400 text-sm">
                          {coll ? `${coll.icon ?? '📁'} ${coll.name}` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            article.status === 'published'
                              ? 'bg-teal-900/50 text-teal-400 border border-teal-800'
                              : 'bg-slate-700 text-slate-400 border border-slate-600'
                          }`}
                        >
                          {article.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/articles/${article.id}/edit`}
                          className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

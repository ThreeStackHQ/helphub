import { getWorkspaceForCurrentUser } from '../../../lib/workspace-helpers';
import { db } from '@helphub/db';
import { articles, collections } from '@helphub/db';
import { eq, count, asc } from 'drizzle-orm';
import Link from 'next/link';
import { FileText, Plus, Pencil } from 'lucide-react';

export default async function ArticlesPage() {
  const { workspace } = await getWorkspaceForCurrentUser();

  const articleRows = await db
    .select({
      id: articles.id,
      title: articles.title,
      status: articles.status,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      collectionId: articles.collectionId,
      collectionName: collections.name,
      collectionIcon: collections.icon,
    })
    .from(articles)
    .leftJoin(collections, eq(articles.collectionId, collections.id))
    .where(eq(articles.workspaceId, workspace.id))
    .orderBy(asc(articles.position), asc(articles.createdAt));

  const collectionCounts = await db
    .select({ id: collections.id, count: count(articles.id) })
    .from(collections)
    .leftJoin(articles, eq(articles.collectionId, collections.id))
    .where(eq(collections.workspaceId, workspace.id))
    .groupBy(collections.id);

  void collectionCounts; // available for future use

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Articles</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {articleRows.length} article{articleRows.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/articles/new"
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {articleRows.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 border-dashed p-16 text-center">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium mb-1">No articles yet</p>
          <p className="text-slate-500 text-sm mb-5">Start building your knowledge base</p>
          <Link
            href="/articles/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create first article
          </Link>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Title</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Collection</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Updated</th>
                <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {articleRows.map((article) => (
                <tr key={article.id} className="hover:bg-slate-700/40 transition-colors group">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/articles/${article.id}/edit`}
                      className="text-white text-sm font-medium hover:text-teal-400 transition-colors line-clamp-1"
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-slate-400 text-sm">
                      {article.collectionName ? `${article.collectionIcon ?? '📁'} ${article.collectionName}` : '—'}
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
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-slate-400 text-sm">
                      {new Date(article.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/articles/${article.id}/edit`}
                      className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-teal-400 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

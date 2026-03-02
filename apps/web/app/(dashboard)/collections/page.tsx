import { getWorkspaceForCurrentUser } from '../../../lib/workspace-helpers';
import { db } from '@helphub/db';
import { collections, articles } from '@helphub/db';
import { eq, count, asc } from 'drizzle-orm';
import Link from 'next/link';
import { FolderOpen, Plus } from 'lucide-react';

export default async function CollectionsPage() {
  const { workspace } = await getWorkspaceForCurrentUser();

  const rows = await db
    .select({
      id: collections.id,
      name: collections.name,
      description: collections.description,
      icon: collections.icon,
      color: collections.color,
      createdAt: collections.createdAt,
      articleCount: count(articles.id),
    })
    .from(collections)
    .leftJoin(articles, eq(articles.collectionId, collections.id))
    .where(eq(collections.workspaceId, workspace.id))
    .groupBy(collections.id)
    .orderBy(asc(collections.position), asc(collections.createdAt));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Collections</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {rows.length} collection{rows.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          New Collection
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 border-dashed p-16 text-center">
          <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium mb-1">No collections yet</p>
          <p className="text-slate-500 text-sm mb-5">Group your articles into collections</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Create first collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((col) => (
            <div
              key={col.id}
              className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{col.icon ?? '📁'}</div>
                <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">
                  {col.articleCount} article{col.articleCount !== 1 ? 's' : ''}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-1">{col.name}</h3>
              {col.description && (
                <p className="text-slate-400 text-sm line-clamp-2">{col.description}</p>
              )}
              <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {new Date(col.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <Link
                  href={`/articles?collection=${col.id}`}
                  className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                >
                  View articles →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

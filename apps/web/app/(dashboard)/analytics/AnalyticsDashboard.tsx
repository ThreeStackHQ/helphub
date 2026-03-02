'use client';

import { useState } from 'react';
import { Eye, Search, AlertTriangle, ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react';

interface TopArticle {
  id: string;
  title: string;
  slug: string;
  collectionName: string;
  views7d: number;
  views30d: number;
  helpful: number;
  notHelpful: number;
}

interface SearchQuery {
  query: string;
  count: number;
  resultsFound: number;
}

interface Props {
  topArticles: TopArticle[];
  searchQueries: SearchQuery[];
}

export default function AnalyticsDashboard({ topArticles, searchQueries }: Props) {
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');

  const maxViews = Math.max(...topArticles.map((a) => period === '7d' ? a.views7d : a.views30d), 1);
  const contentGaps = searchQueries.filter((q) => q.resultsFound === 0);

  const totalViews = topArticles.reduce((sum, a) => sum + (period === '7d' ? a.views7d : a.views30d), 0);
  const totalHelpful = topArticles.reduce((sum, a) => sum + a.helpful, 0);
  const totalNotHelpful = topArticles.reduce((sum, a) => sum + a.notHelpful, 0);
  const helpfulPct = totalHelpful + totalNotHelpful > 0
    ? Math.round((totalHelpful / (totalHelpful + totalNotHelpful)) * 100)
    : 0;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">Placeholder data — wire to GET /api/analytics when available</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setPeriod('7d')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              period === '7d' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              period === '30d' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            30d
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <Eye className="w-5 h-5 text-teal-400 mb-3" />
          <div className="text-3xl font-bold text-white">{totalViews.toLocaleString()}</div>
          <div className="text-sm text-slate-400 mt-1">Total Views ({period})</div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <Search className="w-5 h-5 text-blue-400 mb-3" />
          <div className="text-3xl font-bold text-white">{searchQueries.reduce((s, q) => s + q.count, 0)}</div>
          <div className="text-sm text-slate-400 mt-1">Total Searches</div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <ThumbsUp className="w-5 h-5 text-green-400 mb-3" />
          <div className="text-3xl font-bold text-white">{helpfulPct}%</div>
          <div className="text-sm text-slate-400 mt-1">Helpful Rate</div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <AlertTriangle className="w-5 h-5 text-amber-400 mb-3" />
          <div className="text-3xl font-bold text-white">{contentGaps.length}</div>
          <div className="text-sm text-slate-400 mt-1">Content Gaps</div>
        </div>
      </div>

      {/* Top articles */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal-400" />
          Top Articles by Views
        </h2>
        {topArticles.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-10 text-center text-slate-500">
            No data yet. Publish articles and share your help center to see views.
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="divide-y divide-slate-700">
              {topArticles.map((article) => {
                const views = period === '7d' ? article.views7d : article.views30d;
                const ratio = views / maxViews;
                const helpPct = article.helpful + article.notHelpful > 0
                  ? Math.round((article.helpful / (article.helpful + article.notHelpful)) * 100)
                  : 0;
                return (
                  <div key={article.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-white text-sm font-medium truncate">{article.title}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{article.collectionName}</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-white text-sm font-semibold">{views}</p>
                          <p className="text-slate-500 text-xs">views</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <ThumbsUp className="w-3 h-3 text-green-400" />
                          <span className="text-green-400">{helpPct}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all"
                        style={{ width: `${ratio * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Search queries */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-400" />
          Top Search Queries
        </h2>
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Query</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Searches</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Results</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {searchQueries.map((q) => (
                <tr key={q.query} className="hover:bg-slate-700/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-white text-sm font-mono">"{q.query}"</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-slate-300 text-sm">{q.count}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-slate-300 text-sm">{q.resultsFound}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {q.resultsFound === 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-900/40 text-amber-400 border border-amber-800">
                        <AlertTriangle className="w-3 h-3" />
                        Content gap
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-400 border border-slate-600">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Helpful vs Not Helpful per article */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <ThumbsUp className="w-4 h-4 text-green-400" />
          Helpful vs Not Helpful
        </h2>
        {topArticles.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-10 text-center text-slate-500">
            No feedback data yet.
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Article</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-green-400" /> Helpful</span>
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    <span className="flex items-center gap-1"><ThumbsDown className="w-3 h-3 text-red-400" /> Not helpful</span>
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {topArticles.map((article) => {
                  const total = article.helpful + article.notHelpful;
                  const pct = total > 0 ? Math.round((article.helpful / total) * 100) : 0;
                  return (
                    <tr key={article.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-white text-sm line-clamp-1">{article.title}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-green-400 text-sm font-medium">{article.helpful}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-red-400 text-sm font-medium">{article.notHelpful}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden max-w-24">
                            <div
                              className={`h-full rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${pct >= 70 ? 'text-green-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                            {pct}%
                          </span>
                        </div>
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

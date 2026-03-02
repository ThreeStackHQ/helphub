'use client';

import { useState, useCallback } from 'react';
import { Search, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '../../hooks/useDebounce';

interface Article {
  id: string;
  title: string;
  slug: string;
}

interface Props {
  workspaceId: string;
  slug: string;
}

export default function HelpCenterSearch({ workspaceId, slug }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/widget/search?q=${encodeURIComponent(q)}&workspaceId=${workspaceId}`);
      if (res.ok) {
        const data = await res.json() as { articles: Article[] };
        setResults(data.articles ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, [workspaceId]);

  useDebounce(query, 350, doSearch);

  return (
    <div className="relative max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for answers…"
          className="w-full bg-slate-800 border border-slate-600 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 text-base transition-colors"
        />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />}
      </div>

      {/* Results dropdown */}
      {query.trim() && (results.length > 0 || searched) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-10">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-slate-400 text-sm">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div>
              {results.map((article) => (
                <Link
                  key={article.id}
                  href={`/${slug}/${article.slug}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-0"
                >
                  <FileText className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span className="text-white text-sm">{article.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

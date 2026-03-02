'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface Props {
  articleSlug: string;
}

type Feedback = 'helpful' | 'not-helpful' | null;

export default function HelpfulWidget({ articleSlug }: Props) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [loading, setLoading] = useState(false);

  async function vote(type: 'helpful' | 'not-helpful') {
    if (feedback || loading) return;
    setLoading(true);
    try {
      await fetch(`/api/widget/articles/${articleSlug}/${type}`, { method: 'POST' });
      setFeedback(type);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
      <h3 className="text-white font-semibold mb-1">Was this article helpful?</h3>
      <p className="text-slate-400 text-sm mb-5">Let us know if this answered your question.</p>

      {feedback ? (
        <div className="text-teal-400 font-medium">
          {feedback === 'helpful' ? '👍 Thanks for the feedback!' : '👎 We\'ll work on improving this.'}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => void vote('helpful')}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-teal-600 border border-slate-600 hover:border-teal-500 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            <ThumbsUp className="w-4 h-4" />
            Yes, helpful
          </button>
          <button
            onClick={() => void vote('not-helpful')}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-red-900/40 border border-slate-600 hover:border-red-800 text-slate-300 hover:text-red-400 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            <ThumbsDown className="w-4 h-4" />
            Not helpful
          </button>
        </div>
      )}
    </div>
  );
}

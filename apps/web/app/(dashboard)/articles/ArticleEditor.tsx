'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Image,
  ChevronLeft,
  Clock,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Check,
} from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  icon: string | null;
}

interface Props {
  workspaceId: string;
  articleId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialCollectionId?: string;
  initialStatus?: 'draft' | 'published';
  collections: Collection[];
}

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function ArticleEditor({
  workspaceId,
  articleId: initialArticleId,
  initialTitle = '',
  initialContent = '',
  initialCollectionId,
  initialStatus = 'draft',
  collections,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [collectionId, setCollectionId] = useState(initialCollectionId ?? '');
  const [status, setStatus] = useState<'draft' | 'published'>(initialStatus);
  const [articleId, setArticleId] = useState(initialArticleId);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstSave = useRef(!initialArticleId);

  const readTime = estimateReadTime(content);

  const saveArticle = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!title.trim()) return;
      if (!opts?.silent) setSaveStatus('saving');
      setIsSaving(true);

      try {
        let id = articleId;

        if (!id) {
          // Create
          const res = await fetch('/api/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workspaceId,
              title: title.trim(),
              contentMd: content,
              collectionId: collectionId || undefined,
            }),
          });
          if (!res.ok) throw new Error('Failed to create');
          const data = await res.json() as { article: { id: string } };
          id = data.article.id;
          setArticleId(id);
          isFirstSave.current = false;
          // Update URL without reload
          window.history.replaceState({}, '', `/articles/${id}/edit`);
        } else {
          // Update
          const res = await fetch(`/api/articles/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: title.trim(),
              contentMd: content,
              collectionId: collectionId || null,
            }),
          });
          if (!res.ok) throw new Error('Failed to update');
        }

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    },
    [articleId, collectionId, content, title, workspaceId]
  );

  // Auto-save debounce
  useEffect(() => {
    if (!title.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void saveArticle({ silent: true });
    }, 2000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, content, collectionId, saveArticle]);

  async function handlePublishToggle() {
    if (!articleId && !title.trim()) return;

    // Save first if needed
    if (!articleId) await saveArticle();

    const id = articleId;
    if (!id) return;

    const newStatus = status === 'published' ? 'draft' : 'published';
    const endpoint = newStatus === 'published' ? 'publish' : 'unpublish';

    try {
      const res = await fetch(`/api/articles/${id}/${endpoint}`, { method: 'POST' });
      if (res.ok) setStatus(newStatus);
    } catch {
      // ignore
    }
  }

  function insertMarkdown(prefix: string, suffix = '', placeholder = '') {
    const textarea = document.getElementById('md-editor') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || placeholder;

    const newContent =
      content.slice(0, start) + prefix + selected + suffix + content.slice(end);

    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      const newCursor = start + prefix.length + selected.length + suffix.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  }

  const toolbar = [
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**', 'bold text') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', '*', 'italic text') },
    { icon: Heading1, label: 'H1', action: () => insertMarkdown('\n# ', '', 'Heading 1') },
    { icon: Heading2, label: 'H2', action: () => insertMarkdown('\n## ', '', 'Heading 2') },
    { icon: Heading3, label: 'H3', action: () => insertMarkdown('\n### ', '', 'Heading 3') },
    { icon: List, label: 'Bullet list', action: () => insertMarkdown('\n- ', '', 'List item') },
    { icon: ListOrdered, label: 'Ordered list', action: () => insertMarkdown('\n1. ', '', 'List item') },
    { icon: Code, label: 'Code block', action: () => insertMarkdown('\n```\n', '\n```', 'code here') },
    { icon: LinkIcon, label: 'Link', action: () => insertMarkdown('[', '](url)', 'link text') },
    { icon: Image, label: 'Image', action: () => insertMarkdown('![', '](image-url)', 'alt text') },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-slate-700 gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push('/articles')}
            className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <nav className="text-sm text-slate-400 truncate">
            <span>Articles</span>
            <span className="mx-1.5 text-slate-600">›</span>
            <span className="text-white">{title || 'Untitled'}</span>
          </nav>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Read time */}
          <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            {readTime} min read
          </span>

          {/* Collection dropdown */}
          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="text-sm bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-teal-500 transition-colors hidden sm:block"
          >
            <option value="">No collection</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ?? '📁'} {c.name}
              </option>
            ))}
          </select>

          {/* Auto-save indicator */}
          <span className="text-xs text-slate-500 hidden sm:flex items-center gap-1">
            {saveStatus === 'saving' && <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>}
            {saveStatus === 'saved' && <><Check className="w-3 h-3 text-green-400" /> Saved</>}
            {saveStatus === 'error' && <span className="text-red-400">Save failed</span>}
            {saveStatus === 'idle' && 'Auto-save on'}
          </span>

          {/* Publish toggle */}
          <button
            onClick={() => void handlePublishToggle()}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border ${
              status === 'published'
                ? 'border-teal-700 bg-teal-900/40 text-teal-400 hover:bg-teal-900/60'
                : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
            }`}
          >
            {status === 'published' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {status === 'published' ? 'Published' : 'Draft'}
          </button>

          {/* Save button */}
          <button
            onClick={() => void saveArticle()}
            disabled={isSaving || !title.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 py-3 bg-[#1e293b] border-b border-slate-700">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title…"
          className="w-full text-2xl font-bold text-white bg-transparent outline-none placeholder-slate-600"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 bg-[#1e293b] border-b border-slate-700 overflow-x-auto">
        {toolbar.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              title={item.label}
              onClick={item.action}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors flex-shrink-0"
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Editor + Preview */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Markdown editor */}
        <div className="flex-1 min-w-0 border-r border-slate-700">
          <textarea
            id="md-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your article in Markdown…"
            className="w-full h-full bg-[#1e293b] text-slate-300 font-mono text-sm p-5 outline-none resize-none placeholder-slate-600 leading-relaxed"
            spellCheck
          />
        </div>

        {/* Live preview */}
        <div className="flex-1 min-w-0 overflow-y-auto hidden md:block">
          <div className="p-6 prose prose-invert prose-slate max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-teal-400 prose-code:text-teal-300 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <p className="text-slate-600 italic">Preview will appear here as you write…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

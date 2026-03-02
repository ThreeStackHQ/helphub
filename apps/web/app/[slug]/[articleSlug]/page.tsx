import { db } from '@helphub/db';
import { workspaces, articles, collections } from '@helphub/db';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Clock, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HelpfulWidget from './HelpfulWidget';

interface Props {
  params: Promise<{ slug: string; articleSlug: string }>;
}

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, articleSlug } = await params;

  const [workspace] = await db
    .select({ id: workspaces.id, name: workspaces.name })
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);

  if (!workspace) return { title: 'Article' };

  const [article] = await db
    .select({ title: articles.title, contentMd: articles.contentMd })
    .from(articles)
    .where(and(eq(articles.slug, articleSlug), eq(articles.workspaceId, workspace.id), eq(articles.status, 'published')))
    .limit(1);

  if (!article) return { title: 'Article not found' };

  const excerpt = article.contentMd.slice(0, 160).replace(/[#*`]/g, '').trim();

  return {
    title: `${article.title} — ${workspace.name}`,
    description: excerpt,
    openGraph: {
      title: article.title,
      description: excerpt,
      siteName: `${workspace.name} Help Center`,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug, articleSlug } = await params;

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);

  if (!workspace) notFound();

  const [article] = await db
    .select({
      id: articles.id,
      title: articles.title,
      contentMd: articles.contentMd,
      slug: articles.slug,
      status: articles.status,
      updatedAt: articles.updatedAt,
      publishedAt: articles.publishedAt,
      collectionId: articles.collectionId,
      collectionName: collections.name,
      collectionIcon: collections.icon,
    })
    .from(articles)
    .leftJoin(collections, eq(articles.collectionId, collections.id))
    .where(
      and(
        eq(articles.slug, articleSlug),
        eq(articles.workspaceId, workspace.id),
        eq(articles.status, 'published')
      )
    )
    .limit(1);

  if (!article) notFound();

  const readTime = estimateReadTime(article.contentMd);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
        <Link href={`/${slug}`} className="hover:text-teal-400 transition-colors">
          Home
        </Link>
        {article.collectionName && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-400">
              {article.collectionIcon ?? '📁'} {article.collectionName}
            </span>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white line-clamp-1">{article.title}</span>
      </nav>

      {/* Article header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {readTime} min read
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Updated{' '}
            {new Date(article.updatedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </header>

      {/* Article content */}
      <article className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-teal-400 prose-a:no-underline hover:prose-a:underline prose-code:text-teal-300 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 prose-blockquote:border-teal-600 prose-blockquote:text-slate-400 prose-strong:text-white mb-12">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.contentMd}
        </ReactMarkdown>
      </article>

      {/* Was this helpful? */}
      <HelpfulWidget articleSlug={article.slug} />

      {/* Back link */}
      <div className="mt-10 pt-6 border-t border-slate-800">
        <Link
          href={`/${slug}`}
          className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
        >
          ← Back to Help Center
        </Link>
      </div>
    </div>
  );
}

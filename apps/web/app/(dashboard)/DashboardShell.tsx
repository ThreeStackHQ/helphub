'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  HelpCircle,
  FileText,
  FolderOpen,
  BarChart2,
  Settings,
  Bell,
  Plus,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface User {
  email: string;
  name: string | null;
}

interface Props {
  workspace: Workspace;
  user: User;
  children: React.ReactNode;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart2, exact: true },
  { href: '/articles', label: 'Articles', icon: FileText, badgeKey: 'articles' as const },
  { href: '/collections', label: 'Collections', icon: FolderOpen },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function getBreadcrumb(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return 'Dashboard';
  const last = segments[segments.length - 1];
  return last.charAt(0).toUpperCase() + last.slice(1);
}

export default function DashboardShell({ workspace, user, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [articleCount, setArticleCount] = useState<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch(`/api/articles?workspaceId=${workspace.id}`);
        if (res.ok) {
          const data = await res.json() as { articles: unknown[] };
          setArticleCount(data.articles.length);
        }
      } catch {
        // ignore
      }
    }
    void fetchCount();
  }, [workspace.id]);

  function isActive(href: string, exact?: boolean) {
    const full = href === '/dashboard' ? '/dashboard' : href;
    if (exact) return pathname === full;
    return pathname.startsWith(full);
  }

  const userInitial = (user.name ?? user.email).charAt(0).toUpperCase();
  const breadcrumb = getBreadcrumb(pathname);

  const Sidebar = (
    <aside className="flex flex-col h-full w-60 bg-[#0f172a] border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-800">
        <HelpCircle className="w-7 h-7 text-teal-500 flex-shrink-0" />
        <span className="text-xl font-bold text-white">HelpHub</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badgeKey === 'articles' && articleCount !== null && articleCount > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {articleCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">{userInitial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user.name ?? user.email.split('@')[0]}
            </p>
            <p className="text-slate-400 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => void signOut({ callbackUrl: '/login' })}
          className="mt-1 flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#1e293b] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">{Sidebar}</div>

      {/* Mobile slide-over */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex h-full w-60">
            {Sidebar}
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 h-14 bg-[#0f172a] border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="text-white font-medium">{workspace.name}</span>
              <ChevronRight className="w-3 h-3" />
              <span>{breadcrumb}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/articles/new')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Article</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

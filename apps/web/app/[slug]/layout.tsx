import type { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function PublicHelpLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Public nav */}
      <nav className="border-b border-slate-800 bg-[#0f172a]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-teal-400 transition-colors">
            <HelpCircle className="w-6 h-6 text-teal-500" />
            <span className="font-bold text-lg">HelpHub</span>
          </Link>
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

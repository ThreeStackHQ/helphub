import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">HelpHub</h1>
      <p className="text-gray-400 text-lg mb-8">Self-serve knowledge base for indie SaaS</p>
      <div className="flex gap-4">
        <Link href="/signup" className="px-6 py-3 bg-teal-600 rounded-lg font-medium hover:bg-teal-700 transition-colors">
          Get started
        </Link>
        <Link href="/login" className="px-6 py-3 border border-gray-700 rounded-lg font-medium hover:border-gray-600 transition-colors">
          Sign in
        </Link>
      </div>
    </main>
  );
}

import { auth } from '../../auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-2xl font-bold">Welcome to HelpHub</h1>
      <p className="text-gray-400 mt-2">Hello, {session.user.name ?? session.user.email}</p>
    </div>
  );
}

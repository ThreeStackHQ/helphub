import { getWorkspaceForCurrentUser } from '../../../lib/workspace-helpers';
import { Globe, Palette, Bell, CreditCard, Trash2 } from 'lucide-react';

export default async function SettingsPage() {
  const { workspace } = await getWorkspaceForCurrentUser();

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold text-white mb-6">Settings</h1>

      {/* Workspace */}
      <section className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-5">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-teal-400" /> Workspace
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Workspace Name</label>
            <input
              type="text"
              defaultValue={workspace.name}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm">helphub.threestack.io/</span>
              <input
                type="text"
                defaultValue={workspace.slug}
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Custom Domain</label>
            <input
              type="text"
              placeholder="docs.yourapp.com"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500 transition-colors placeholder-slate-600"
            />
            <p className="text-xs text-slate-500 mt-1.5">Point a CNAME to helphub.threestack.io then add your domain here.</p>
          </div>
          <div className="pt-2">
            <button className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors">
              Save changes
            </button>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-5">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-teal-400" /> Appearance
        </h2>
        <p className="text-slate-400 text-sm">Theme customization coming soon.</p>
      </section>

      {/* Notifications */}
      <section className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-5">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-400" /> Notifications
        </h2>
        <p className="text-slate-400 text-sm">Email notifications coming soon.</p>
      </section>

      {/* Billing */}
      <section className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-5">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-teal-400" /> Billing
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium capitalize">{workspace.tier} plan</p>
            <p className="text-slate-400 text-sm mt-0.5">
              {workspace.tier === 'free' ? 'Upgrade to unlock more articles and features.' : 'Manage your subscription.'}
            </p>
          </div>
          <a
            href="/pricing"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {workspace.tier === 'free' ? 'Upgrade' : 'Manage'}
          </a>
        </div>
      </section>

      {/* Danger zone */}
      <section className="bg-slate-800 rounded-xl border border-red-900/50 p-6">
        <h2 className="text-base font-semibold text-red-400 mb-4 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Danger Zone
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">Delete workspace</p>
            <p className="text-slate-400 text-sm mt-0.5">This is irreversible. All articles and collections will be deleted.</p>
          </div>
          <button className="px-4 py-2 border border-red-700 text-red-400 hover:bg-red-900/30 text-sm font-medium rounded-lg transition-colors">
            Delete
          </button>
        </div>
      </section>
    </div>
  );
}

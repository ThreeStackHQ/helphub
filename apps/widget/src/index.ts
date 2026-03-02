/**
 * HelpHub Widget v0.1.0
 * Drop-in FAQ/help center widget for your SaaS
 * Usage: <script src="https://helphub.threestack.io/widget.js" data-workspace-id="your-id"></script>
 */

interface HelpHubConfig {
  workspaceId: string;
  apiUrl?: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'dark' | 'light';
}

declare global {
  interface Window { HelpHub?: { init: (config: HelpHubConfig) => void } }
}

function init(config: HelpHubConfig): void {
  const apiUrl = config.apiUrl ?? 'https://helphub.threestack.io';
  // Widget implementation in Sprint 2.4
  console.log('[HelpHub] Widget initialized for workspace:', config.workspaceId, 'api:', apiUrl);
}

// Auto-init from data attribute
document.addEventListener('DOMContentLoaded', () => {
  const script = document.currentScript as HTMLScriptElement | null;
  const workspaceId = script?.dataset?.workspaceId;
  if (workspaceId) init({ workspaceId });
});

window.HelpHub = { init };

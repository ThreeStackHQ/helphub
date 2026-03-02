/**
 * HelpHub Widget v1.0.0
 * Self-serve knowledge base & FAQ widget for indie SaaS
 * Usage: <script src="https://helphub.threestack.io/widget.js" data-workspace-id="your-id"></script>
 */

export {}; // Make this a module for declare global

declare global {
  interface Window {
    HelpHub: { init: (config: HelpHubConfig) => void };
  }
}

interface HelpHubConfig {
  workspaceId: string;
  apiUrl?: string;
}

interface ArticleResult {
  id: string;
  title: string;
  slug: string;
  snippet?: string;
  contentMd?: string;
  content_md?: string;
}

const TEAL = '#0d9488';
const TEAL_DARK = '#0f766e';
const PANEL_WIDTH = 360;
const DEBOUNCE_MS = 300;
const API_DEFAULT = 'https://helphub.threestack.io';

const WIDGET_CSS = `
#hh-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${TEAL};
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483646;
  transition: background 0.2s, transform 0.2s;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  font-family: sans-serif;
}
#hh-btn:hover { background: ${TEAL_DARK}; transform: scale(1.08); }
#hh-panel {
  position: fixed;
  bottom: 88px;
  right: 24px;
  width: ${PANEL_WIDTH}px;
  max-height: calc(100vh - 120px);
  background: #1a1a2e;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  transform: translateX(${PANEL_WIDTH + 40}px);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s;
  opacity: 0;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #e2e8f0;
  overflow: hidden;
}
#hh-panel.open {
  transform: translateX(0);
  opacity: 1;
  pointer-events: all;
}
#hh-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: ${TEAL};
  border-radius: 16px 16px 0 0;
}
#hh-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}
#hh-close {
  background: rgba(255,255,255,0.2);
  border: none;
  cursor: pointer;
  color: #fff;
  font-size: 18px;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}
#hh-close:hover { background: rgba(255,255,255,0.35); }
#hh-search-wrap {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
#hh-search {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
#hh-search:focus { border-color: ${TEAL}; }
#hh-search::placeholder { color: #94a3b8; }
#hh-breadcrumb {
  padding: 8px 16px;
  font-size: 12px;
  color: #94a3b8;
  display: none;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
#hh-breadcrumb.visible { display: flex; }
#hh-back {
  background: none;
  border: none;
  color: ${TEAL};
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}
#hh-back:hover { color: #5eead4; }
#hh-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}
#hh-body::-webkit-scrollbar { width: 4px; }
#hh-body::-webkit-scrollbar-track { background: transparent; }
#hh-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
.hh-result {
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.12s;
}
.hh-result:hover { background: rgba(255,255,255,0.05); }
.hh-result-title { font-size: 14px; font-weight: 500; color: #e2e8f0; margin-bottom: 3px; }
.hh-result-snippet { font-size: 12px; color: #94a3b8; line-height: 1.4; }
.hh-empty { padding: 32px 16px; text-align: center; color: #64748b; font-size: 14px; }
#hh-article { padding: 16px; }
#hh-article h2 { font-size: 17px; font-weight: 600; margin: 0 0 12px; color: #f1f5f9; }
#hh-article-content { font-size: 14px; color: #cbd5e1; line-height: 1.7; white-space: pre-wrap; }
#hh-feedback {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  font-size: 13px;
  color: #94a3b8;
}
.hh-thumb {
  background: rgba(255,255,255,0.08);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 5px 10px;
  font-size: 15px;
  transition: background 0.15s;
  color: #e2e8f0;
}
.hh-thumb:hover { background: rgba(255,255,255,0.15); }
.hh-thumb.active { background: ${TEAL}; }
#hh-loader { padding: 24px; text-align: center; color: #64748b; font-size: 13px; }
`;

function injectStyles(): void {
  if (document.getElementById('hh-styles')) return;
  const style = document.createElement('style');
  style.id = 'hh-styles';
  style.textContent = WIDGET_CSS;
  document.head.appendChild(style);
}

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createWidget(config: HelpHubConfig): void {
  const apiUrl = (config.apiUrl ?? API_DEFAULT).replace(/\/$/, '');
  const { workspaceId } = config;

  injectStyles();

  // Floating button
  const btn = document.createElement('button');
  btn.id = 'hh-btn';
  btn.setAttribute('aria-label', 'Open help center');
  btn.setAttribute('title', 'Help');
  btn.textContent = '?';

  // Panel
  const panel = document.createElement('div');
  panel.id = 'hh-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Help center');
  panel.innerHTML = `
    <div id="hh-header">
      <h3>Help Center</h3>
      <button id="hh-close" aria-label="Close">&#x2715;</button>
    </div>
    <div id="hh-search-wrap">
      <input id="hh-search" type="text" placeholder="Search for help..." autocomplete="off" />
    </div>
    <div id="hh-breadcrumb">
      <button id="hh-back">&larr; Results</button>
    </div>
    <div id="hh-body"><div class="hh-empty">Search for articles or browse below.</div></div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  const searchInput = document.getElementById('hh-search') as HTMLInputElement;
  const body = document.getElementById('hh-body') as HTMLDivElement;
  const breadcrumb = document.getElementById('hh-breadcrumb') as HTMLDivElement;
  const backBtn = document.getElementById('hh-back') as HTMLButtonElement;
  const closeBtn = document.getElementById('hh-close') as HTMLButtonElement;

  let isOpen = false;

  function openPanel(): void {
    if (isOpen) return;
    isOpen = true;
    panel.classList.add('open');
    searchInput.focus();
    void fetch(`${apiUrl}/api/widget/opened`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    }).catch(() => null);
  }

  function closePanel(): void {
    if (!isOpen) return;
    isOpen = false;
    panel.classList.remove('open');
  }

  function showLoader(): void {
    body.innerHTML = '<div id="hh-loader">Loading...</div>';
  }

  function showEmpty(msg: string): void {
    body.innerHTML = `<div class="hh-empty">${escapeHtml(msg)}</div>`;
  }

  function showResults(results: ArticleResult[]): void {
    breadcrumb.classList.remove('visible');
    if (results.length === 0) {
      showEmpty('No articles found. Try a different search term.');
      return;
    }
    body.innerHTML = '';
    for (const r of results) {
      const item = document.createElement('div');
      item.className = 'hh-result';
      item.innerHTML = `<div class="hh-result-title">${escapeHtml(r.title)}</div><div class="hh-result-snippet">${escapeHtml(r.snippet ?? '')}</div>`;
      item.addEventListener('click', () => {
        void loadArticle(r.slug, r.id);
      });
      body.appendChild(item);
    }
  }

  async function loadArticle(slug: string, articleId: string): Promise<void> {
    showLoader();
    breadcrumb.classList.add('visible');
    try {
      const res = await fetch(
        `${apiUrl}/api/widget/articles/${encodeURIComponent(slug)}?workspaceId=${encodeURIComponent(workspaceId)}`
      );
      const data = (await res.json()) as { article?: ArticleResult; error?: string };
      if (!data.article) {
        showEmpty('Article not found.');
        return;
      }
      showArticle(data.article, articleId);
    } catch {
      showEmpty('Failed to load article.');
    }
  }

  function showArticle(article: ArticleResult, id: string): void {
    const content = article.contentMd ?? article.content_md ?? '';
    body.innerHTML = `
      <div id="hh-article">
        <h2>${escapeHtml(article.title)}</h2>
        <div id="hh-article-content">${escapeHtml(content)}</div>
      </div>
      <div id="hh-feedback">
        <span>Was this helpful?</span>
        <button class="hh-thumb" id="hh-helpful" aria-label="Yes">&#128077;</button>
        <button class="hh-thumb" id="hh-not-helpful" aria-label="No">&#128078;</button>
      </div>
    `;

    const helpfulBtn = document.getElementById('hh-helpful') as HTMLButtonElement;
    const notHelpfulBtn = document.getElementById('hh-not-helpful') as HTMLButtonElement;

    function sendFeedback(type: 'helpful' | 'not-helpful'): void {
      helpfulBtn.classList.toggle('active', type === 'helpful');
      notHelpfulBtn.classList.toggle('active', type === 'not-helpful');
      void fetch(`${apiUrl}/api/widget/articles/${encodeURIComponent(id)}/${type}`, {
        method: 'POST',
      }).catch(() => null);
    }

    helpfulBtn.addEventListener('click', () => sendFeedback('helpful'));
    notHelpfulBtn.addEventListener('click', () => sendFeedback('not-helpful'));
  }

  const doSearch = debounce(function search(q: string): void {
    if (!q.trim()) {
      showEmpty('Search for articles or browse below.');
      return;
    }
    showLoader();
    void fetch(
      `${apiUrl}/api/widget/search?q=${encodeURIComponent(q)}&workspaceId=${encodeURIComponent(workspaceId)}`
    )
      .then((r) => r.json() as Promise<{ articles?: ArticleResult[] }>)
      .then((data) => showResults(data.articles ?? []))
      .catch(() => showEmpty('Search failed. Please try again.'));
  }, DEBOUNCE_MS);

  searchInput.addEventListener('input', (e) => {
    doSearch((e.target as HTMLInputElement).value);
  });

  backBtn.addEventListener('click', () => {
    breadcrumb.classList.remove('visible');
    const q = searchInput.value.trim();
    if (q) {
      doSearch(q);
    } else {
      showEmpty('Search for articles or browse below.');
    }
  });

  btn.addEventListener('click', () => { if (isOpen) closePanel(); else openPanel(); });
  closeBtn.addEventListener('click', closePanel);

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openPanel();
    }
    if (e.key === 'Escape' && isOpen) {
      closePanel();
    }
  });
}

function init(config: HelpHubConfig): void {
  if (!config.workspaceId) {
    console.error('[HelpHub] workspaceId is required');
    return;
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createWidget(config));
  } else {
    createWidget(config);
  }
}

// Auto-init from data attribute
(function autoInit(): void {
  const allScripts = document.querySelectorAll('script[data-workspace-id]');
  const script = allScripts[allScripts.length - 1] as HTMLScriptElement | undefined;
  if (script) {
    const workspaceId = script.dataset['workspaceId'];
    const apiUrl = script.dataset['apiUrl'];
    if (workspaceId) {
      init({ workspaceId, apiUrl });
    }
  }
})();

window.HelpHub = { init };

export const TIERS = {
  free: { maxArticles: 10, customDomain: false, analytics: false, aiSearch: false },
  indie: { maxArticles: Infinity, customDomain: true, analytics: false, aiSearch: false },
  pro: { maxArticles: Infinity, customDomain: true, analytics: true, aiSearch: true },
} as const;

export type Tier = keyof typeof TIERS;

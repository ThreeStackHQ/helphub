/**
 * Environment variable validation — validated at module load time.
 * Import this in your root layout or instrumentation.ts to catch
 * missing env vars at startup rather than at runtime.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback;
}

export const env = {
  // Database
  DATABASE_URL: requireEnv('DATABASE_URL'),

  // Auth
  NEXTAUTH_SECRET: requireEnv('NEXTAUTH_SECRET'),
  NEXTAUTH_URL: optionalEnv('NEXTAUTH_URL', 'http://localhost:3000'),

  // Stripe
  STRIPE_SECRET_KEY: optionalEnv('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: optionalEnv('STRIPE_WEBHOOK_SECRET'),
  STRIPE_INDIE_PRICE_ID: optionalEnv('STRIPE_INDIE_PRICE_ID'),
  STRIPE_PRO_PRICE_ID: optionalEnv('STRIPE_PRO_PRICE_ID'),

  // App
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;

// Log warnings for optional-but-important vars in production
if (env.NODE_ENV === 'production') {
  const productionRequired = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'] as const;
  for (const key of productionRequired) {
    if (!env[key]) {
      console.warn(`[env] WARNING: ${key} is not set — Stripe features will be disabled`);
    }
  }
}

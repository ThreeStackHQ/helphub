import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(key, {
      apiVersion: '2026-02-25.clover' as Stripe.LatestApiVersion,
    });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null as string | null,
    articleLimit: 10,
  },
  indie: {
    name: 'Indie',
    price: 9,
    get priceId() {
      return process.env.STRIPE_PRICE_INDIE ?? null;
    },
    articleLimit: Infinity,
  },
  pro: {
    name: 'Pro',
    price: 19,
    get priceId() {
      return process.env.STRIPE_PRICE_PRO ?? null;
    },
    articleLimit: Infinity,
  },
} as const;

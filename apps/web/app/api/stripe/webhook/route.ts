export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '../../../../lib/stripe';
import { db } from '@helphub/db';
import { subscriptions } from '@helphub/db';
import { eq, and } from 'drizzle-orm';
import type Stripe from 'stripe';

async function upsertSubscription(
  userId: string,
  workspaceId: string,
  stripeSubscription: Stripe.Subscription,
  tier: string
): Promise<void> {
  const item = stripeSubscription.items.data[0];
  // Stripe v20 pattern: current_period_end is on the subscription item
  // Cast via unknown to handle v20 API shape which differs from older TS types
  const itemV20 = item as unknown as { current_period_end?: number };
  const currentPeriodEnd = itemV20?.current_period_end
    ? new Date(itemV20.current_period_end * 1000)
    : null;

  const existing = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.workspaceId, workspaceId)
      )
    )
    .limit(1);

  if (existing.length > 0 && existing[0]) {
    await db
      .update(subscriptions)
      .set({
        tier,
        status: stripeSubscription.status,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: item?.price.id ?? null,
        currentPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existing[0].id));
  } else {
    await db.insert(subscriptions).values({
      userId,
      workspaceId,
      tier,
      status: stripeSubscription.status,
      stripeCustomerId:
        typeof stripeSubscription.customer === 'string'
          ? stripeSubscription.customer
          : stripeSubscription.customer.id,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: item?.price.id ?? null,
      currentPeriodEnd,
    });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const workspaceId = session.metadata?.workspaceId;
        const tier = session.metadata?.tier ?? 'free';

        if (!userId || !workspaceId) break;

        // Update stripe_customer_id
        if (session.subscription && typeof session.subscription === 'string') {
          const stripe = getStripe();
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          await upsertSubscription(userId, workspaceId, sub, tier);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const workspaceId = sub.metadata?.workspaceId;
        const tier = sub.metadata?.tier ?? 'indie';

        if (!userId || !workspaceId) break;
        await upsertSubscription(userId, workspaceId, sub, tier);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await db
          .update(subscriptions)
          .set({ status: 'cancelled', updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }

      default:
        // Unhandled event type
        break;
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

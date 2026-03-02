export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe, PLANS } from '../../../../lib/stripe';
import { requireAuth } from '../../../../lib/auth-helpers';

const schema = z.object({
  tier: z.enum(['indie', 'pro']),
  workspaceId: z.string().uuid(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { session, error: authError } = await requireAuth();
  if (authError || !session) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body: unknown = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { tier, workspaceId, successUrl, cancelUrl } = parsed.data;
    const plan = PLANS[tier];
    const priceId = plan.priceId;

    if (!priceId) {
      return NextResponse.json({ error: `Price ID for ${tier} is not configured` }, { status: 500 });
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl ?? `${baseUrl}/dashboard?checkout=success`,
      cancel_url: cancelUrl ?? `${baseUrl}/pricing?checkout=cancelled`,
      metadata: {
        userId: session.user.id,
        workspaceId,
        tier,
      },
      customer_email: session.user.email ?? undefined,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

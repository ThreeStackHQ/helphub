export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@helphub/db';
import { analyticsEvents } from '@helphub/db';
import { corsResponse, corsOptionsResponse } from '../../../../lib/cors';
import { checkRateLimit } from '../../../../lib/rate-limit';

const schema = z.object({
  workspaceId: z.string().uuid(),
});

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptionsResponse();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return corsResponse({ error: 'workspaceId is required' }, { status: 400 });
    }

    const { workspaceId } = parsed.data;

    // Rate limit: 100 widget-open events/min per workspaceId
    const rl = checkRateLimit(`widget-opened:${workspaceId}`, { limit: 100, windowMs: 60_000 });
    if (rl.limited) return corsResponse({ error: 'Too many requests' }, { status: 429 });

    const sessionId = request.headers.get('x-session-id') ?? undefined;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? request.headers.get('x-real-ip') ?? undefined;

    await db.insert(analyticsEvents).values({
      workspaceId,
      event: 'widget_opened',
      sessionId: sessionId ?? null,
      ip: ip ?? null,
    });

    return corsResponse({ success: true });
  } catch (error) {
    console.error('Widget opened error:', error);
    return corsResponse({ error: 'Internal server error' }, { status: 500 });
  }
}

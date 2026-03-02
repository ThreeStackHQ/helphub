export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@helphub/db';
import { users, workspaces } from '@helphub/db';
import { checkRateLimit, getClientIp } from '../../../../lib/rate-limit';

const signupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(255).optional(),
});

function slugFromEmail(email: string): string {
  const username = email.split('@')[0] ?? 'workspace';
  return username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let attempt = 0;
  while (true) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;
    const existing = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.slug, candidate))
      .limit(1);
    if (existing.length === 0) return candidate;
    attempt++;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limit: 10 signup attempts/min per IP
  const ip = getClientIp(request);
  const rl = checkRateLimit(`signup:${ip}`, { limit: 10, windowMs: 60_000 });
  if (rl.limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    // Check if user already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user + workspace in transaction
    const slug = await uniqueSlug(slugFromEmail(email));

    const [newUser] = await db
      .insert(users)
      .values({ email, name: name ?? null, passwordHash })
      .returning();

    if (!newUser) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    const [workspace] = await db
      .insert(workspaces)
      .values({
        userId: newUser.id,
        name: name ? `${name}'s Workspace` : 'My Workspace',
        slug,
      })
      .returning();

    return NextResponse.json(
      {
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
        workspace: { id: workspace?.id, slug: workspace?.slug },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

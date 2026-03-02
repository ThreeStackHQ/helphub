export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { promises as dns } from 'dns';
import { db } from '@helphub/db';
import { workspaces } from '@helphub/db';
import { requireAuth } from '../../../../../lib/auth-helpers';

function getVerificationToken(workspaceId: string): string {
  return `helphub-verify=${workspaceId}`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { session, error: authError } = await requireAuth();
  if (authError || !session) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, id))
    .limit(1);

  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  if (workspace.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (!workspace.customDomain) {
    return NextResponse.json({ error: 'No custom domain set' }, { status: 400 });
  }

  const verificationToken = getVerificationToken(workspace.id);

  try {
    const records = await dns.resolveTxt(workspace.customDomain);
    const flat = records.flat();
    const verified = flat.some((r) => r === verificationToken);

    if (verified) {
      await db
        .update(workspaces)
        .set({ domainVerified: true })
        .where(eq(workspaces.id, workspace.id));

      return NextResponse.json({
        verified: true,
        domain: workspace.customDomain,
        message: 'Domain verified successfully',
      });
    }

    return NextResponse.json({
      verified: false,
      domain: workspace.customDomain,
      verificationToken,
      message: `Add a TXT record to ${workspace.customDomain} with value: ${verificationToken}`,
    });
  } catch (error) {
    console.error('DNS lookup error:', error);
    return NextResponse.json({
      verified: false,
      domain: workspace.customDomain,
      verificationToken,
      message: 'DNS lookup failed. Ensure the domain exists and the TXT record is configured.',
    });
  }
}

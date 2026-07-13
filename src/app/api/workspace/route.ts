import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { saathiName, saathiEmail } = body;

    if (!saathiEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate a unique slug from name or email
    const baseSlug = (saathiName || saathiEmail.split('@')[0])
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Ensure uniqueness by appending a timestamp fragment
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Create Workspace — wid auto-increments (1, 2, 3…)
    const workspace = await prisma.workspace.create({
      data: {
        name: saathiName || saathiEmail,
        slug,
      },
    });

    console.log(`[Workspace API] Created workspace wid=${workspace.wid} slug=${workspace.slug} for ${saathiEmail}`);

    return NextResponse.json({ success: true, workspace });
  } catch (err: any) {
    console.error('[Workspace API] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create workspace' }, { status: 500 });
  }
}

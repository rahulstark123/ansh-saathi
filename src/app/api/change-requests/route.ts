import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all profile change requests (admin view)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const saathiId = searchParams.get('saathiId');

    const requests = await prisma.profileChangeRequest.findMany({
      where: saathiId ? { saathiId } : undefined,
      include: {
        saathi: {
          select: { name: true, email: true, partnerCode: true, wid: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(requests);
  } catch (err: any) {
    console.error('[ProfileChangeRequest GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch requests' }, { status: 500 });
  }
}

// POST: Submit a new profile change request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { saathiId, wid, subject, description, attachments } = body;

    if (!saathiId || !wid || !subject || !description) {
      return NextResponse.json({ error: 'saathiId, wid, subject, and description are required' }, { status: 400 });
    }

    if (attachments && attachments.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 attachments allowed' }, { status: 400 });
    }

    const request = await prisma.profileChangeRequest.create({
      data: {
        saathiId,
        wid,
        subject,
        description,
        attachments: attachments || [],
        status: 'pending'
      }
    });

    return NextResponse.json({ success: true, request });
  } catch (err: any) {
    console.error('[ProfileChangeRequest POST] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit request' }, { status: 500 });
  }
}

// PATCH: Update request status (admin)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, adminNote } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const updated = await prisma.profileChangeRequest.update({
      where: { id },
      data: {
        status,
        adminNote: adminNote || null
      }
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (err: any) {
    console.error('[ProfileChangeRequest PATCH] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update request' }, { status: 500 });
  }
}

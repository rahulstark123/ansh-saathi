import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch commissions (optionally filtered by saathiId)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const saathiId = searchParams.get('saathiId');
    const widStr = searchParams.get('wid');

    const whereClause: any = {};
    if (saathiId) {
      whereClause.saathiId = saathiId;
    }
    if (widStr) {
      const wid = parseInt(widStr, 10);
      if (!isNaN(wid)) {
        whereClause.wid = wid;
      }
    }

    const commissions = await prisma.commission.findMany({
      where: whereClause,
      include: {
        saathi: {
          select: {
            name: true,
            partnerCode: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(commissions);
  } catch (err: any) {
    console.error('[Commissions GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch commissions' }, { status: 500 });
  }
}

// POST: Request payout (Take commission amount)
// Updates all 'pending' commissions for a saathi to 'approved' if within eligible date windows.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { saathiId } = body;

    if (!saathiId) {
      return NextResponse.json({ error: 'saathiId is required' }, { status: 400 });
    }

    // Date eligibility check: 2 times in a month
    // Window 1: Upto 15th (1 to 15)
    // Window 2: End of month (30, 31, or 1)
    const today = new Date();
    const day = today.getDate();
    
    // Get last day of the current month
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    const isUpto15 = day >= 1 && day <= 15;
    const isEndOfMonth = day === lastDayOfMonth || day === (lastDayOfMonth - 1) || day === 1;

    if (!isUpto15 && !isEndOfMonth) {
      return NextResponse.json({
        error: 'Payout request rejected. You can only apply for payouts 2 times a month: upto the 15th, and at the end of the month (30th, 31st, or 1st).'
      }, { status: 400 });
    }

    // Check if there are any pending commissions
    const pendingCommissions = await prisma.commission.findMany({
      where: {
        saathiId,
        status: 'pending'
      }
    });

    if (pendingCommissions.length === 0) {
      return NextResponse.json({ error: 'No pending commissions available to request payout.' }, { status: 400 });
    }

    // Update all pending commissions to approved status
    const updateResult = await prisma.commission.updateMany({
      where: {
        saathiId,
        status: 'pending'
      },
      data: {
        status: 'approved'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully requested payout for ${updateResult.count} commission records.`,
      updatedCount: updateResult.count
    });
  } catch (err: any) {
    console.error('[Commissions Payout POST] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit payout request' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { commissionId, status, referenceNumber, adminNote, attachments, paymentMode, paymentThrough } = body;

    if (!commissionId || !status) {
      return NextResponse.json({ error: 'commissionId and status are required' }, { status: 400 });
    }

    const updateData: any = { status };
    if (status === 'paid') {
      updateData.referenceNumber = referenceNumber || `TXN${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      updateData.paymentDate = new Date();
      updateData.adminNote = adminNote || null;
      updateData.attachments = attachments || [];
      updateData.paymentMode = paymentMode || null;
      updateData.paymentThrough = paymentThrough || null;
    }

    const updated = await prisma.commission.update({
      where: { id: commissionId },
      data: updateData
    });

    return NextResponse.json({ success: true, commission: updated });
  } catch (err: any) {
    console.error('[Commissions PATCH] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update commission' }, { status: 500 });
  }
}

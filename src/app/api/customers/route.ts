import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all customers for a Saathi
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const saathiId = searchParams.get('saathiId');

    const whereClause = saathiId ? { saathiId } : {};

    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        saathi: {
          select: {
            name: true,
            email: true,
            partnerCode: true
          }
        }
      },
      orderBy: { joinedDate: 'desc' }
    });

    const formatted = customers.map(c => ({
      id: c.id,
      companyName: c.companyName,
      companyAddress: c.companyAddress,
      leadSource: c.leadSource,
      product: c.product,
      users: c.users,
      mrr: c.mrr,
      status: c.status,
      joinedDate: c.joinedDate.toISOString().split('T')[0],
      commissionRate: c.commissionRate,
      saathiId: c.saathiId,
      saathiName: c.saathi?.name || 'Unknown Partner',
      saathiEmail: c.saathi?.email || '',
      saathiCode: c.saathi?.partnerCode || ''
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error('[Customers GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST: Add a new Customer
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName,
      companyAddress,
      leadSource,
      product,
      users,
      mrr,
      status,
      joinedDate,
      commissionRate,
      saathiId
    } = body;

    if (!companyName || !saathiId) {
      return NextResponse.json({ error: 'Company Name and Saathi ID are required' }, { status: 400 });
    }

    // 1. Resolve workspace ID (wid) from the Saathi record
    const saathi = await prisma.saathi.findUnique({
      where: { id: saathiId }
    });

    if (!saathi) {
      return NextResponse.json({ error: 'Saathi partner profile not found' }, { status: 404 });
    }

    const wid = saathi.wid;

    // Resolve commission rate based on Saathi's partner code
    // "Remember upto saathi-00021 all have 40% commission rate after that as usual 25%"
    let resolvedCommissionRate = 25;
    if (saathi.partnerCode) {
      const match = saathi.partnerCode.match(/saathi-(\d+)/i);
      if (match) {
        const saathiNum = parseInt(match[1], 10);
        if (saathiNum <= 21) {
          resolvedCommissionRate = 40;
        }
      }
    }

    // 2. Create customer record in Supabase
    const customer = await prisma.customer.create({
      data: {
        wid,
        companyName,
        companyAddress: companyAddress || '',
        leadSource: leadSource || '',
        product,
        users: parseInt(users, 10) || 1,
        mrr: parseFloat(mrr) || 0,
        status: status || 'pending',
        joinedDate: joinedDate ? new Date(joinedDate) : new Date(),
        commissionRate: resolvedCommissionRate,
        saathiId
      }
    });

    return NextResponse.json({ success: true, customer });
  } catch (err: any) {
    console.error('[Customers POST] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create customer' }, { status: 500 });
  }
}

// PATCH: Update customer status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Customer ID and Status are required' }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: { status }
    });

    // If status is updated to 'approved' and it wasn't approved already, generate commission
    if (status === 'approved' && existing.status !== 'approved') {
      const amount = (customer.mrr * customer.commissionRate) / 100;
      
      await prisma.commission.create({
        data: {
          wid: customer.wid,
          companyName: customer.companyName,
          product: customer.product,
          amount,
          status: 'pending',
          date: new Date(),
          saathiId: customer.saathiId,
          customerId: customer.id
        }
      });
    }

    return NextResponse.json({ success: true, customer });
  } catch (err: any) {
    console.error('[Customers PATCH] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update customer status' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const saathiAdminInclude = {
  workspace: true,
  customers: {
    select: { id: true }
  },
  commissions: {
    select: { amount: true }
  }
} satisfies Prisma.SaathiInclude;

type SaathiAdminRow = Prisma.SaathiGetPayload<{ include: typeof saathiAdminInclude }>;

// GET all Saathis for Admin view
export async function GET(req: NextRequest) {
  try {
    const saathis: SaathiAdminRow[] = await prisma.saathi.findMany({
      include: saathiAdminInclude,
      orderBy: {
        joinedDate: 'desc'
      }
    });

    // Format output with computed values (customers count, total earnings)
    const formatted = saathis.map((s) => {
      const customersCount = s.customers.length;
      const totalEarnings = s.commissions.reduce((acc, c) => acc + c.amount, 0);
      
      return {
        id: s.id,
        wid: s.wid,
        name: s.name,
        email: s.email,
        phone: s.phone,
        profession: s.profession,
        companyRole: s.companyRole,
        pincode: s.pincode,
        address: s.address,
        city: s.city,
        state: s.state,
        linkedin: s.linkedin,
        profilePicture: s.profilePicture,
        status: s.status,
        partnerCode: s.partnerCode,
        joinedDate: s.joinedDate.toISOString().split('T')[0],
        customersCount,
        totalEarnings,
        payoutDetails: {
          bankName: s.bankName,
          accountNumber: s.accountNumber,
          ifsc: s.ifsc,
          upiId: s.upiId
        }
      };
    });

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error('[Admin Saathis GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch Saathis' }, { status: 500 });
  }
}

// POST: Provision a new Saathi manually
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      pincode,
      address,
      city,
      state,
      profession,
      companyRole,
      linkedin,
      partnerCode
    } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase();

    // Check if Saathi already exists
    const existing = await prisma.saathi.findUnique({
      where: { email: cleanEmail }
    });
    if (existing) {
      return NextResponse.json({ error: 'A partner with this email already exists' }, { status: 400 });
    }

    // 1. Create a workspace for this new Saathi
    const baseSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const workspace = await prisma.workspace.create({
      data: {
        name: `${name}'s Workspace`,
        slug
      }
    });

    // 2. Create the Saathi associated with the new workspace
    const saathiId = `saathi-${Date.now()}`;
    const saathi = await prisma.saathi.create({
      data: {
        id: saathiId,
        wid: workspace.wid,
        email: cleanEmail,
        name,
        phone: phone || '',
        pincode: pincode || '',
        address: address || '',
        city: city || '',
        state: state || '',
        profession: profession || '',
        companyRole: companyRole || 'Owner',
        linkedin: linkedin || '',
        status: 'approved', // Auto approved on admin manual creation
        partnerCode: partnerCode || `SAATHI-${String((await prisma.saathi.count()) + 1).padStart(5, '0')}`,
      }
    });

    return NextResponse.json({ success: true, saathi });
  } catch (err: any) {
    console.error('[Admin Saathis POST] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to provision Saathi' }, { status: 500 });
  }
}

// PATCH: Approve, Reject or Update Saathi
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, partnerCode } = body;

    if (!id) {
      return NextResponse.json({ error: 'Saathi ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status; // approved | rejected | pending
    }
    if (partnerCode) {
      updateData.partnerCode = partnerCode;
    }

    const updated = await prisma.saathi.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, saathi: updated });
  } catch (err: any) {
    console.error('[Admin Saathis PATCH] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update Saathi status' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const id = searchParams.get('id');

  if (!email && !id) {
    return NextResponse.json({ error: 'Email or ID is required' }, { status: 400 });
  }

  try {
    let saathi = null;
    if (id) {
      saathi = await prisma.saathi.findUnique({
        where: { id },
      });
    } else if (email) {
      saathi = await prisma.saathi.findUnique({
        where: { email: email.toLowerCase() },
      });
    }

    if (!saathi) {
      return NextResponse.json({ error: 'Saathi not found' }, { status: 404 });
    }

    return NextResponse.json(saathi);
  } catch (err: any) {
    console.error('[Profile API GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to retrieve profile' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      email,
      name,
      phone,
      profession,
      companyRole,
      pincode,
      address,
      city,
      state,
      linkedin,
      profilePicture,
      wid,
      emergencyName,
      emergencyPhone,
      emergencyRelation,
      emergencyEmail,
    } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Default to wid = 1 if not provided (though signup swaps now guarantee wid)
    const resolvedWid = wid ? parseInt(wid, 10) : 1;

    // First ensure the Workspace exists
    const workspaceExists = await prisma.workspace.findUnique({
      where: { wid: resolvedWid },
    });

    if (!workspaceExists) {
      // Create a fallback workspace if not exists
      await prisma.workspace.create({
        data: {
          wid: resolvedWid,
          name: name || email,
          slug: `workspace-${resolvedWid}-${Date.now().toString(36)}`,
        },
      });
    }

    const saathiId = id || `saathi-${Date.now()}`;
    const cleanEmail = email.toLowerCase();

    // Upsert Saathi profile in Database
    const saathi = await prisma.saathi.upsert({
      where: { email: cleanEmail },
      update: {
        name: name || '',
        phone: phone || '',
        profession: profession || '',
        companyRole: companyRole || 'Owner',
        pincode: pincode || '',
        address: address || '',
        city: city || '',
        state: state || '',
        linkedin: linkedin || '',
        profilePicture: profilePicture || null,
        wid: resolvedWid,
        emergencyName: emergencyName || '',
        emergencyPhone: emergencyPhone || '',
        emergencyRelation: emergencyRelation || '',
        emergencyEmail: emergencyEmail || '',
      },
      create: {
        id: saathiId,
        wid: resolvedWid,
        email: cleanEmail,
        name: name || '',
        phone: phone || '',
        profession: profession || '',
        companyRole: companyRole || 'Owner',
        pincode: pincode || '',
        address: address || '',
        city: city || '',
        state: state || '',
        linkedin: linkedin || '',
        profilePicture: profilePicture || null,
        status: 'approved',
        partnerCode: `SAATHI-${String((await prisma.saathi.count()) + 1).padStart(5, '0')}`,
        emergencyName: emergencyName || '',
        emergencyPhone: emergencyPhone || '',
        emergencyRelation: emergencyRelation || '',
        emergencyEmail: emergencyEmail || '',
      },
    });

    console.log(`[Profile API] Successfully saved Saathi: ${cleanEmail}`);

    return NextResponse.json({ success: true, saathi });
  } catch (err: any) {
    console.error('[Profile API POST] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update profile' }, { status: 500 });
  }
}

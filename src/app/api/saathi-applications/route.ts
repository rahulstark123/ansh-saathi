import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all Saathi applications (leads)
export async function GET(req: NextRequest) {
  try {
    const applications = await prisma.saathiApplication.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(applications);
  } catch (err: any) {
    console.error("[SaathiApplications GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// POST: Submit a new Saathi application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      fullName,
      companyName,
      email,
      phone,
      pincode,
      city,
      state,
      address,
      website,
      businessType,
      experience,
      whyPartner,
      accountHolderName,
      bankName,
      accountNumber,
      ifsc,
      upiId,
      aadhaarNumber,
      aadhaarCardUrl,
      panNumber,
      panCardUrl,
      is18Plus,
      hasLaptopAndInternet,
    } = body;

    // Validate required fields
    if (!fullName || !email || !phone || !whyPartner || !aadhaarNumber || !aadhaarCardUrl || !panNumber || !panCardUrl) {
      return NextResponse.json(
        { error: "Required fields are missing." },
        { status: 400 }
      );
    }

    // Resolve workspace ID dynamically (use first available, or fallback to 1)
    const firstWorkspace = await prisma.workspace.findFirst();
    const wid = firstWorkspace ? firstWorkspace.wid : 1;

    const application = await prisma.saathiApplication.create({
      data: {
        wid,
        fullName,
        companyName: companyName || "",
        email,
        phone,
        pincode: pincode || "",
        city: city || "",
        state: state || "",
        address: address || "",
        website: website || "",
        businessType,
        experience: experience || "",
        whyPartner,
        accountHolderName: accountHolderName || "",
        bankName: bankName || "",
        accountNumber: accountNumber || "",
        ifsc: ifsc || "",
        upiId: upiId || "",
        aadhaarNumber,
        aadhaarCardUrl,
        panNumber,
        panCardUrl,
        is18Plus: is18Plus ?? true,
        hasLaptopAndInternet: hasLaptopAndInternet ?? true,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (err: any) {
    console.error("[SaathiApplications POST] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}

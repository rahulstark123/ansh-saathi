import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const mockSaathis = [
  { name: 'Vivaan Kapoor', email: 'vivaan.k@consulting.in', profession: 'Chartered Accountant', role: 'Partner', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Ananya Iyer', email: 'ananya.iyer@fintech.co.in', profession: 'Financial Planner', role: 'Director', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Ishaan Nair', email: 'ishaan.nair@itconsulting.in', profession: 'Software Vendor', role: 'Owner', city: 'Kochi', state: 'Kerala' },
  { name: 'Saanvi Gupta', email: 'saanvi.g@taxassociates.in', profession: 'GST Practitioner', role: 'Owner', city: 'Jaipur', state: 'Rajasthan' },
  { name: 'Kabir Banerjee', email: 'kabir.b@capitaladvisors.in', profession: 'Wealth Manager', role: 'Manager', city: 'Kolkata', state: 'West Bengal' },
  { name: 'Advik Rao', email: 'advik.rao@agency.co.in', profession: 'Digital Marketer', role: 'Owner', city: 'Bengaluru', state: 'Karnataka' },
  { name: 'Reyansh Verma', email: 'reyansh.v@hrmasters.in', profession: 'HR Recruiter', role: 'Director', city: 'Gurugram', state: 'Haryana' },
  { name: 'Aarohi Joshi', email: 'aarohi.j@legaladvise.in', profession: 'Legal Consultant', role: 'Partner', city: 'Pune', state: 'Maharashtra' },
  { name: 'Meera Saxena', email: 'meera.s@corporateadvisors.in', profession: 'Business Coach', role: 'Owner', city: 'Noida', state: 'Uttar Pradesh' },
  { name: 'Arjun Singhal', email: 'arjun.s@taxexperts.in', profession: 'CA Practitioner', role: 'Owner', city: 'Chandigarh', state: 'Punjab' },
  { name: 'Diya Choudhury', email: 'diya.c@financeconsult.in', profession: 'Accountant', role: 'Manager', city: 'Guwahati', state: 'Assam' },
  { name: 'Pranav Shah', email: 'pranav.s@consultshah.in', profession: 'ERP Consultant', role: 'Owner', city: 'Surat', state: 'Gujarat' }
];

const mockProducts = ['ANSH Tasks', 'ANSH HR', 'ANSH Expense', 'ANSH Visitor', 'ANSH Forms', 'ANSH Links'];
const mockCompanies = ['Vedic Organic Systems', 'Himalaya Logistics', 'Indus Digital Group', 'Lotus Retail Ventures', 'Ganges Agri Tech', 'Taj hospitality group', 'Chakra Biotech Solutions', 'Deccan Spices Corp', 'Thar Solar Energy', 'Nilgiri Tea Estates', 'Konkan Food Processors', 'Narmada Paper Mills'];

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const widStr = searchParams.get('wid');

    if (!widStr) {
      return NextResponse.json({ error: 'Workspace ID (wid) is required' }, { status: 400 });
    }

    const wid = parseInt(widStr, 10);
    if (isNaN(wid)) {
      return NextResponse.json({ error: 'Invalid Workspace ID' }, { status: 400 });
    }

    console.log(`Seeding leaderboard data for workspace: ${wid}`);

    const seededSaathis = [];

    // Create 12 approved mock saathis with dynamic customer referrals and paid commissions
    for (let i = 0; i < mockSaathis.length; i++) {
      const ms = mockSaathis[i];
      const codeIndex = i + 2; // Incremental partner codes
      const partnerCode = `SAATHI-${String(codeIndex).padStart(5, '0')}`;

      // 1. Create Saathi record in DB
      const dbSaathi = await prisma.saathi.create({
        data: {
          wid,
          name: ms.name,
          email: `${Date.now()}-${ms.email}`, // Avoid duplicate key constraint on email
          phone: `+91 ${9000000000 + i}`,
          profession: ms.profession,
          companyRole: ms.role,
          pincode: '400001',
          address: 'Main Business District',
          city: ms.city,
          state: ms.state,
          linkedin: `linkedin.com/in/${ms.name.toLowerCase().replace(' ', '-')}`,
          status: 'approved',
          partnerCode,
          joinedDate: new Date(Date.now() - (i * 3 * 24 * 60 * 60 * 1000)), // dynamic older joined date
          bankName: 'ICICI Bank',
          accountNumber: `9090102030${i}`,
          ifsc: 'ICIC0001234',
          upiId: `${ms.name.toLowerCase().replace(' ', '')}@okicici`
        }
      });

      // 2. Add referred customers (between 1 and 5 per mock partner)
      const customerCount = Math.floor(Math.random() * 5) + 1;
      const saathiCustomers = [];
      for (let cIdx = 0; cIdx < customerCount; cIdx++) {
        const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
        const companyName = `${mockCompanies[(i + cIdx) % mockCompanies.length]} Ltd`;
        const mrr = (Math.floor(Math.random() * 6) + 1) * 5000; // ₹5,000 to ₹30,000
        const users = Math.floor(Math.random() * 20) + 5;

        const customer = await prisma.customer.create({
          data: {
            wid,
            companyName,
            companyAddress: `${ms.city}, India`,
            leadSource: 'Referral',
            product,
            users,
            mrr,
            status: 'approved',
            joinedDate: new Date(Date.now() - (15 * 24 * 60 * 60 * 1000)),
            commissionRate: 25,
            saathiId: dbSaathi.id
          }
        });
        saathiCustomers.push(customer);
      }

      // 3. Add paid commission history entries (for total paid out calculation)
      const commissionCount = Math.floor(Math.random() * 3) + 1;
      for (let commIdx = 0; commIdx < commissionCount; commIdx++) {
        const customer = saathiCustomers[commIdx % saathiCustomers.length];
        await prisma.commission.create({
          data: {
            wid,
            companyName: customer.companyName,
            product: customer.product,
            amount: (customer.mrr * customer.commissionRate) / 100 * (Math.floor(Math.random() * 3) + 1), // Multi-month commission
            status: 'paid',
            date: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            saathiId: dbSaathi.id,
            customerId: customer.id
          }
        });
      }

      seededSaathis.push(dbSaathi);
    }

    return NextResponse.json({ success: true, count: seededSaathis.length });
  } catch (err: any) {
    console.error('[Leaderboard Seed] Error:', err);
    return NextResponse.json({ error: err.message || 'Seeding failed' }, { status: 500 });
  }
}

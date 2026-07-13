import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const widStr = searchParams.get('wid');
    const pageStr = searchParams.get('page') || '1';
    const limitStr = searchParams.get('limit') || '10';
    const sortBy = searchParams.get('sortBy') || 'commissions'; // 'commissions' (monthlyRecurring) or 'referrals'
    const searchTerm = searchParams.get('searchTerm') || '';
    const currentSaathiId = searchParams.get('currentSaathiId') || '';

    if (!widStr) {
      return NextResponse.json({ error: 'Workspace ID (wid) is required' }, { status: 400 });
    }

    const wid = parseInt(widStr, 10);
    if (isNaN(wid)) {
      return NextResponse.json({ error: 'Invalid Workspace ID' }, { status: 400 });
    }

    const page = parseInt(pageStr, 10);
    const limit = parseInt(limitStr, 10);
    const skip = (page - 1) * limit;

    // 1. Fetch all approved saathis belonging to the same workspace to compute ranking/standing
    const saathis = await prisma.saathi.findMany({
      where: {
        wid,
        status: 'approved'
      },
      include: {
        customers: {
          where: {
            status: 'approved'
          }
        },
        commissions: {
          where: {
            status: 'paid'
          }
        }
      }
    });

    // 2. Compute dynamic stats for each saathi from database records
    const allStats = saathis.map(saathi => {
      const referralsCount = saathi.customers.length;
      
      const monthlyRecurring = saathi.customers.reduce(
        (sum, c) => sum + (c.mrr * c.commissionRate) / 100,
        0
      );

      const commissionsTotal = saathi.commissions.reduce(
        (sum, c) => sum + c.amount,
        0
      );

      return {
        id: saathi.id,
        name: saathi.name,
        profession: saathi.profession,
        companyRole: saathi.companyRole,
        city: saathi.city,
        state: saathi.state,
        referralsCount,
        monthlyRecurring,
        commissionsTotal
      };
    });

    // 3. Sort the full list based on criteria (amount/monthlyRecurring or referrals)
    allStats.sort((a, b) => {
      if (sortBy === 'referrals') {
        if (b.referralsCount !== a.referralsCount) {
          return b.referralsCount - a.referralsCount;
        }
        return b.monthlyRecurring - a.monthlyRecurring;
      } else {
        if (b.monthlyRecurring !== a.monthlyRecurring) {
          return b.monthlyRecurring - a.monthlyRecurring;
        }
        return b.referralsCount - a.referralsCount;
      }
    });

    // 4. Find the standing of the current logged-in saathi from the full sorted list
    let myStanding = null;
    if (currentSaathiId) {
      const rankIndex = allStats.findIndex(item => item.id === currentSaathiId);
      if (rankIndex !== -1) {
        myStanding = {
          rankPosition: rankIndex + 1,
          stats: allStats[rankIndex]
        };
      }
    }

    // 5. Apply search filtering
    const filteredStats = allStats.filter(item => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(term) ||
        item.city.toLowerCase().includes(term) ||
        item.profession.toLowerCase().includes(term) ||
        item.state.toLowerCase().includes(term)
      );
    });

    // 6. Paginate
    const paginatedStats = filteredStats.slice(skip, skip + limit);
    const totalCount = filteredStats.length;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: paginatedStats,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
        totalRegistered: allStats.length
      },
      myStanding
    });
  } catch (err: any) {
    console.error('[Leaderboard GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch leaderboard' }, { status: 500 });
  }
}



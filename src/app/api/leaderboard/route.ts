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

    const page = parseInt(pageStr, 10);
    const limit = parseInt(limitStr, 10);
    const skip = (page - 1) * limit;

    // 1. Fetch all approved saathis globally from the database, plus the current saathi (so they see themselves)
    const saathis = await prisma.saathi.findMany({
      where: currentSaathiId ? {
        OR: [
          { status: 'approved' },
          { id: currentSaathiId }
        ]
      } : {
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

    // 3b. Only show Saathis with actual activity on the public leaderboard,
    //     but always include the current logged-in Saathi so they see themselves.
    const activeStats = allStats.filter(
      item => item.referralsCount > 0 || item.commissionsTotal > 0 || item.id === currentSaathiId
    );

    // 4. Find the standing of the current logged-in saathi from the full sorted list
    //    (rank is among ALL approved saathis, not just active ones)
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

    // 5. Apply search filtering — only on activeStats (Saathis with real activity)
    const filteredStats = activeStats.filter(item => {
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
        totalRegistered: allStats.length,   // all approved Saathis
        totalActive: activeStats.length      // Saathis with actual performance
      },
      myStanding
    });
  } catch (err: any) {
    console.error('[Leaderboard GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch leaderboard' }, { status: 500 });
  }
}



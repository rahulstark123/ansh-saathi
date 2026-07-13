'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { usePortalStore } from '@/lib/store';
import { 
  Trophy, 
  Search, 
  Award, 
  Info, 
  TrendingUp, 
  IndianRupee, 
  Users, 
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  HelpCircle,
  Check,
  Copy,
  User,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tier definitions matching user constraints
export interface TierConfig {
  name: string;
  minReferrals: number;
  minEarnings: number; // Monthly Recurring Commission
  color: string;
  bg: string;
  border: string;
  description: string;
  benefits: string;
}

export const TIERS = {
  SAMRAT_1: {
    name: 'Bharat Samrat I',
    minReferrals: 100,
    minEarnings: 125000,
    color: 'text-amber-400 font-extrabold',
    bg: 'bg-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    border: 'border-amber-500/50',
    description: 'The ultimate tier representing legendary enterprise builders and master partners in Bharat.',
    benefits: '25% recurring commissions, invite-only annual luxury retreat, direct product advisory board seat.'
  },
  SAMRAT_2: {
    name: 'Bharat Samrat II',
    minReferrals: 75,
    minEarnings: 100000,
    color: 'text-amber-400 font-bold',
    bg: 'bg-amber-500/15 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
    border: 'border-amber-500/40',
    description: 'Elite statesmen driving massive digital footprints and integrations across regional markets.',
    benefits: '22% recurring commissions, fast-track premium customer support channels.'
  },
  SAMRAT_3: {
    name: 'Bharat Samrat III',
    minReferrals: 50,
    minEarnings: 75000,
    color: 'text-amber-500 font-semibold',
    bg: 'bg-amber-500/10 shadow-[0_0_8px_rgba(245,158,11,0.1)]',
    border: 'border-amber-500/30',
    description: 'Eminent partners leading major digital adoptions and regional enterprise growth.',
    benefits: '20% recurring commissions, priority operations desk, invite-only partner summit.'
  },
  KARMA_YOGI: {
    name: 'Karma-Yogi',
    minReferrals: 30,
    minEarnings: 50000,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    description: 'Dedicated professionals displaying high commitment and consistent customer onboarding.',
    benefits: '18% recurring commissions, dedicated account manager, co-marketing support.'
  },
  ARJUNA: {
    name: 'Arjuna',
    minReferrals: 15,
    minEarnings: 15000,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    description: 'Focused champions achieving consistent success and building momentum.',
    benefits: '15% recurring commissions, standard sales kits, monthly performance feedback.'
  },
  YODDHA: {
    name: 'Yoddha',
    minReferrals: 5,
    minEarnings: 5000,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    description: 'Brave regional consultants taking their first steps to digitize Indian businesses.',
    benefits: '12% recurring commissions, access to partner marketing library.'
  },
  AARAMBH: {
    name: 'Aarambh',
    minReferrals: 0,
    minEarnings: 0,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    description: 'Newly registered partners starting their growth journey.',
    benefits: '10% standard commissions, access to base training resources.'
  }
};

// Function to calculate tier based on stats (referrals OR monthly recurring commission)
export const determineTier = (referrals: number, monthlyRecurring: number): TierConfig => {
  if (referrals >= TIERS.SAMRAT_1.minReferrals || monthlyRecurring >= TIERS.SAMRAT_1.minEarnings) return TIERS.SAMRAT_1;
  if (referrals >= TIERS.SAMRAT_2.minReferrals || monthlyRecurring >= TIERS.SAMRAT_2.minEarnings) return TIERS.SAMRAT_2;
  if (referrals >= TIERS.SAMRAT_3.minReferrals || monthlyRecurring >= TIERS.SAMRAT_3.minEarnings) return TIERS.SAMRAT_3;
  if (referrals >= TIERS.KARMA_YOGI.minReferrals || monthlyRecurring >= TIERS.KARMA_YOGI.minEarnings) return TIERS.KARMA_YOGI;
  if (referrals >= TIERS.ARJUNA.minReferrals || monthlyRecurring >= TIERS.ARJUNA.minEarnings) return TIERS.ARJUNA;
  if (referrals >= TIERS.YODDHA.minReferrals || monthlyRecurring >= TIERS.YODDHA.minEarnings) return TIERS.YODDHA;
  return TIERS.AARAMBH;
};

interface LeaderboardViewProps {
  isAdmin?: boolean;
}

export default function LeaderboardView({ isAdmin = false }: LeaderboardViewProps) {
  const { saathis, currentSaathiId } = usePortalStore();
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'referrals' | 'commissions'>('commissions');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [apiStanding, setApiStanding] = useState<any>(null);
  const itemsPerPage = 10;

  // Resolve current saathi wid
  const currentSaathi = useMemo(() => {
    return saathis.find(s => s.id === currentSaathiId);
  }, [saathis, currentSaathiId]);

  useEffect(() => {
    if (!currentSaathi?.wid) return;

    const controller = new AbortController();
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          wid: currentSaathi.wid.toString(),
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          sortBy,
          searchTerm,
          currentSaathiId: currentSaathiId || ''
        });

        const res = await fetch(`/api/leaderboard?${queryParams.toString()}`, {
          signal: controller.signal
        });
        if (res.ok) {
          const data = await res.json();
          setLeaderboardData(data.data || []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalCount(data.pagination?.totalCount || 0);
          setTotalRegistered(data.pagination?.totalRegistered || 0);
          setApiStanding(data.myStanding || null);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching leaderboard:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input changes slightly
    const delay = searchTerm ? 400 : 0;
    const timer = setTimeout(() => {
      fetchLeaderboard();
    }, delay);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [currentSaathi?.wid, currentPage, sortBy, searchTerm, currentSaathiId]);

  // Format currency in Lakhs/Thousands
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Compile full leaderboard list with isCurrent flag
  const leaderboardList = useMemo(() => {
    return leaderboardData.map(item => ({
      ...item,
      isCurrent: item.id === currentSaathiId
    }));
  }, [leaderboardData, currentSaathiId]);

  // Find currently logged-in saathi standing details from API response
  const myStanding = useMemo(() => {
    if (!apiStanding) return null;
    const { rankPosition, stats } = apiStanding;
    const tier = determineTier(stats.referralsCount, stats.monthlyRecurring);
    
    // Find next tier goal
    let nextTier: TierConfig | null = null;
    let referralsNeeded = 0;
    let earningsNeeded = 0;

    if (tier.name === TIERS.AARAMBH.name) {
      nextTier = TIERS.YODDHA;
    } else if (tier.name === TIERS.YODDHA.name) {
      nextTier = TIERS.ARJUNA;
    } else if (tier.name === TIERS.ARJUNA.name) {
      nextTier = TIERS.KARMA_YOGI;
    } else if (tier.name === TIERS.KARMA_YOGI.name) {
      nextTier = TIERS.SAMRAT_3;
    } else if (tier.name === TIERS.SAMRAT_3.name) {
      nextTier = TIERS.SAMRAT_2;
    } else if (tier.name === TIERS.SAMRAT_2.name) {
      nextTier = TIERS.SAMRAT_1;
    }

    if (nextTier) {
      referralsNeeded = Math.max(0, nextTier.minReferrals - stats.referralsCount);
      earningsNeeded = Math.max(0, nextTier.minEarnings - stats.monthlyRecurring);
    }

    return {
      rankPosition,
      stats,
      tier,
      nextTier,
      referralsNeeded,
      earningsNeeded
    };
  }, [apiStanding]);


  // Since sorting, filtering, and pagination are handled on the server side:
  const paginatedList = leaderboardList;
  const filteredList = leaderboardList;


  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-outfit text-white flex flex-wrap items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
            <span>Bharat Saathi Leaderboard</span>
            <span className="bg-primary/20 text-primary-bright font-bold px-2.5 py-1 rounded-xl text-xs border border-primary/30 shrink-0">
              {totalRegistered} Registered Partners
            </span>
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Celebrating regional consultants and advisors driving business digitization across India.
          </p>
        </div>
        <button
          onClick={() => setShowInfoModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-glass-border hover:bg-white/5 text-xs text-text-muted hover:text-white cursor-pointer self-start md:self-auto transition-all"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Understanding Rankings</span>
        </button>
      </div>

      {/* Current User Tier Progress (Only if saathi dashboard) */}
      {!isAdmin && myStanding && (
        <div className="relative p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-primary-bright)_0%,_transparent_70%)] pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
            <div className="space-y-3 w-full">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Your Leaderboard Rank</span>
                <span className="bg-primary/20 text-primary-bright font-bold px-2 py-0.5 rounded text-xs border border-primary/30">
                  Rank #{myStanding.rankPosition}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2 font-outfit">
                  Namaste, you are an <span className={`${myStanding.tier.color} font-extrabold`}>{myStanding.tier.name}</span>
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  {myStanding.tier.description}
                </p>
              </div>

              {myStanding.nextTier && (
                <div className="space-y-1.5 pt-2 w-full max-w-lg">
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>PROGRESS TO {myStanding.nextTier.name.toUpperCase()}</span>
                    <span>
                      {myStanding.referralsNeeded} client{myStanding.referralsNeeded === 1 ? '' : 's'} or {formatCurrency(myStanding.earningsNeeded)}/mo recurring needed
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-glass-border">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
                      style={{ 
                        width: `${Math.min(100, Math.max(10, (myStanding.stats.referralsCount / myStanding.nextTier.minReferrals) * 100))}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard controls & table */}
      <div className="glass-card p-6 rounded-2xl space-y-6">
        
        {/* Search and Sort filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, profession or city..."
              className="w-full bg-white/[0.02] border border-glass-border focus:border-primary rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-text-muted focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 border border-glass-border/60 bg-white/[0.01] p-1 rounded-xl shrink-0">
            <button
              onClick={() => { setSortBy('referrals'); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                sortBy === 'referrals' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-text-muted hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Sort by Clients</span>
            </button>
            <button
              onClick={() => { setSortBy('commissions'); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                sortBy === 'commissions' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-text-muted hover:text-white'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Sort by Monthly Recurring</span>
            </button>
          </div>
        </div>

        {/* Leaderboard Table List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <div className="w-8 h-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
            <span className="text-xs text-text-muted">Loading leaderboard standings...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-glass-border text-text-muted text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-4 w-16">Rank</th>
                    <th className="pb-3">Partner Name</th>
                    <th className="pb-3">Profession & Designation</th>
                    <th className="pb-3">Indian Rank Tier</th>
                    <th className="pb-3 text-center">Active Clients</th>
                    <th className="pb-3 text-right">Monthly Recurring</th>
                    <th className="pb-3 text-right pr-4">Total Paid Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/40">
                  {paginatedList.length > 0 ? (
                    paginatedList.map((item, index) => {
                      const rankPos = (currentPage - 1) * itemsPerPage + index + 1;
                      const itemTier = determineTier(item.referralsCount, item.monthlyRecurring);
                      
                      return (
                        <tr 
                          key={item.id}
                          className={`text-xs hover:bg-white/[0.02] transition-colors ${
                            item.isCurrent ? 'bg-primary/5 border-l-2 border-primary' : ''
                          }`}
                        >
                          <td className="py-4 pl-4 font-outfit text-sm font-bold">
                            {rankPos === 1 ? (
                              <span className="text-xl">🥇</span>
                            ) : rankPos === 2 ? (
                              <span className="text-xl">🥈</span>
                            ) : rankPos === 3 ? (
                              <span className="text-xl">🥉</span>
                            ) : (
                              <span className="text-text-muted pl-1">#{rankPos}</span>
                            )}
                          </td>
                          <td className="py-4 font-semibold text-white">
                            <div className="flex items-center gap-2">
                              <span>{item.name}</span>
                              {item.isCurrent && (
                                <span className="bg-primary/20 text-primary-bright font-bold px-1.5 py-0.5 rounded text-[8px] border border-primary/30 shrink-0">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="block text-[10px] text-text-muted font-normal mt-0.5">
                              {item.city}, {item.state}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="text-white block font-medium">
                              {item.companyRole ? `${item.companyRole}` : 'Partner'}
                            </span>
                            <span className="block text-[10px] text-text-muted mt-0.5 truncate max-w-[180px]">
                              {item.profession}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${itemTier.bg} ${itemTier.color} ${itemTier.border}`}>
                              <Award className="w-3 h-3 shrink-0" />
                              <span>{itemTier.name}</span>
                            </span>
                          </td>
                          <td className="py-4 text-center font-mono font-bold text-white">
                            {item.referralsCount}
                          </td>
                          <td className="py-4 text-right font-mono font-bold text-primary-bright">
                            {formatCurrency(item.monthlyRecurring)}<span className="text-[10px] font-normal text-text-muted">/mo</span>
                          </td>
                          <td className="py-4 text-right pr-4 font-mono font-bold text-emerald-400">
                            {formatCurrency(item.commissionsTotal)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-text-muted">
                        No partners found matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            {totalPages > 1 && (
              <div className="pt-4 border-t border-glass-border/40 flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} total results)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-glass-border bg-bg-accent/40 text-white hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-glass-border bg-bg-accent/40 text-white hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Modal Dialog */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInfoModal(false)}></div>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-accent border border-glass-border p-6 rounded-2xl max-w-lg w-full relative z-10 space-y-6 shadow-2xl overflow-y-auto max-h-[85vh] scrollbar-thin"
            >
              <div className="flex justify-between items-center pb-3 border-b border-glass-border">
                <h3 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Bharat Ranking System Explained</span>
                </h3>
                <button 
                  onClick={() => setShowInfoModal(false)}
                  className="px-2.5 py-1 rounded-lg border border-glass-border hover:bg-white/5 text-xs text-text-muted hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-text-muted leading-relaxed">
                  Our ranking system takes inspiration from traditional Indian values of dedication (Karma), focus (Arjuna), valour (Yoddha), and excellence (Samrat). Tiers are unlocked automatically as active clients or monthly recurring earnings grow.
                </p>

                <div className="space-y-3.5">
                  {Object.entries(TIERS).map(([key, value]) => (
                    <div key={key} className={`p-3.5 rounded-xl border ${value.bg} ${value.border} space-y-2`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${value.color}`}>
                          <Award className="w-3.5 h-3.5" />
                          {value.name}
                        </span>
                        <span className="text-[10px] text-text-muted font-semibold font-mono">
                          {value.minReferrals > 0 ? `${value.minReferrals}+ Clients` : 'Starter'} {value.minEarnings > 0 ? `or ₹${value.minEarnings >= 100000 ? `${value.minEarnings / 100000}L` : `${value.minEarnings / 1000}K`}/mo` : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-white leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

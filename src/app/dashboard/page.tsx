'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePortalStore } from '@/lib/store';
import { 
  Users, 
  TrendingUp, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Share2, 
  ArrowUpRight,
  ArrowRight,
  Gift,
  Building,
  Check
} from 'lucide-react';
import Link from 'next/link';
import CommissionChart from '@/components/commission-chart';
import { determineTier } from '@/components/leaderboard-view';

export default function SaathiDashboard() {
  const { saathis, currentSaathiId, customers, commissions } = usePortalStore();
  const currentSaathi = saathis.find(s => s.id === currentSaathiId);
  
  // States for copy feedback
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shared, setShared] = useState(false);

  // States for DB fetched data
  const [dbCustomers, setDbCustomers] = useState<any[]>([]);
  const [dbCommissions, setDbCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentSaathiId) return;
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [custRes, commRes] = await Promise.all([
          fetch(`/api/customers?saathiId=${currentSaathiId}`),
          fetch(`/api/commissions?saathiId=${currentSaathiId}`)
        ]);
        if (custRes.ok) {
          const custData = await custRes.json();
          setDbCustomers(custData);
        }
        if (commRes.ok) {
          const commData = await commRes.json();
          setDbCommissions(commData);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [currentSaathiId]);

  // Combined fallback selectors
  const myCustomers = useMemo(() => {
    if (loading) {
      return customers.filter(c => c.saathiId === currentSaathiId);
    }
    return dbCustomers;
  }, [dbCustomers, customers, currentSaathiId, loading]);

  const myCommissions = useMemo(() => {
    if (loading) {
      return commissions.filter(c => c.saathiId === currentSaathiId);
    }
    return dbCommissions;
  }, [dbCommissions, commissions, currentSaathiId, loading]);

  // Dynamic Chart Data mapping
  const dynamicEarningsData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result: { label: string; value: number }[] = [];
    const now = new Date();
    
    // Group active/paid commissions by month for the last 6 calendar months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = months[d.getMonth()];
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      const value = myCommissions
        .filter(c => c.date.startsWith(yearMonth) && c.status !== 'cancelled')
        .reduce((sum, c) => sum + c.amount, 0);
      
      result.push({ label, value: value || 0 });
    }
    return result;
  }, [myCommissions]);

  const dynamicProductData = useMemo(() => {
    const products = [
      { name: 'ANSH Tasks', color: 'from-purple-500 to-indigo-500' },
      { name: 'ANSH HR', color: 'from-indigo-500 to-blue-500' },
      { name: 'ANSH Expense', color: 'from-pink-500 to-rose-500' },
      { name: 'ANSH Visitor', color: 'from-emerald-500 to-teal-500' }
    ];

    return products.map(p => {
      const matchingClients = myCustomers.filter(c => c.product === p.name && c.status === 'approved');
      const clientsCount = matchingClients.length;
      const totalMRR = matchingClients.reduce((sum, c) => sum + c.mrr, 0);
      return {
        name: p.name,
        clients: clientsCount,
        mrr: totalMRR,
        color: p.color
      };
    });
  }, [myCustomers]);

  // Calculate stats
  const totalReferrals = myCustomers.length;
  const activeCustomers = myCustomers.filter(c => c.status === 'approved').length;
  
  // Monthly Earnings (based on commissions in July 2026)
  const monthlyEarnings = myCommissions
    .filter(c => c.date.startsWith('2026-07') && c.status !== 'cancelled')
    .reduce((sum, c) => sum + c.amount, 0);

  const lifetimeEarnings = myCommissions
    .filter(c => c.status === 'paid' || c.status === 'approved')
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingCommission = myCommissions
    .filter(c => c.status === 'pending' || c.status === 'approved')
    .reduce((sum, c) => sum + c.amount, 0);

  const paidCommission = myCommissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const partnerCode = currentSaathi?.partnerCode || 'PENDING';
  const referralLink = `https://anshapps.com/signup?ref=${partnerCode}`;

  const activeCustomersCount = myCustomers.filter(c => c.status === 'approved').length;
  const monthlyRecurringCommission = myCustomers
    .filter(c => c.status === 'approved')
    .reduce((sum, c) => sum + (c.mrr * c.commissionRate / 100), 0);

  const partnerTier = useMemo(() => {
    return determineTier(activeCustomersCount, monthlyRecurringCommission);
  }, [activeCustomersCount, monthlyRecurringCommission]);

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join ANSH Apps',
        text: `Use my partner code ${partnerCode} to sign up for ANSH ERP, HR, or CRM!`,
        url: referralLink,
      }).catch(console.error);
    } else {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  // Generate activities based on customers and commissions
  const getRecentActivities = () => {
    const activities: { id: string; type: string; title: string; date: string; value?: string }[] = [];

    myCustomers.forEach(c => {
      activities.push({
        id: `act-c-join-${c.id}`,
        type: 'signup',
        title: `New referral: ${c.companyName} signed up for ${c.product}`,
        date: c.joinedDate,
      });

      if (c.status === 'approved') {
        activities.push({
          id: `act-c-act-${c.id}`,
          type: 'activation',
          title: `Referral approved: ${c.companyName} is now an approved client`,
          date: c.joinedDate, // mock same date for simplicity
        });
      }
    });

    myCommissions.forEach(c => {
      activities.push({
        id: `act-comm-earn-${c.id}`,
        type: 'commission-earned',
        title: `Commission generated from ${c.companyName}`,
        date: c.date,
        value: formatCurrency(c.amount),
      });

      if (c.status === 'paid') {
        activities.push({
          id: `act-comm-paid-${c.id}`,
          type: 'commission-paid',
          title: `Commission payout received`,
          date: c.paymentDate || c.date,
          value: formatCurrency(c.amount),
        });
      }
    });

    // Sort by date descending
    return activities.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  };

  const recentActivities = getRecentActivities();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Banner */}
      <div className="relative p-6 md:p-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-primary-bright)_0%,_transparent_70%)] pointer-events-none"></div>
        <div className="max-w-2xl space-y-2 relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold font-outfit text-white leading-tight flex flex-wrap items-center gap-2">
            <span>Namaste, {currentSaathi?.name}!</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs shrink-0 font-sans tracking-wide border ${partnerTier.bg} ${partnerTier.color} ${partnerTier.border}`}>
              {partnerTier.name}
            </span>
          </h2>
          <p className="text-text-muted text-sm md:text-base leading-relaxed">
            Welcome to your founding partner workspace. You are representing the Bharat Network from <span className="text-primary-bright font-semibold">{currentSaathi?.city}</span>, helping regional enterprises grow with world-class digital tools.
          </p>
        </div>

        {/* Your Partner Code Box */}
        <div className="shrink-0 p-4 rounded-xl border border-glass-border bg-bg-accent/60 backdrop-blur-md flex flex-col justify-between gap-2.5 w-full md:w-56 relative z-10">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Your Partner Code</span>
            <p className="text-xl font-mono font-bold text-white tracking-widest mt-0.5">{partnerCode}</p>
          </div>
          <button
            onClick={() => copyToClipboard(partnerCode, 'code')}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-glass-border hover:bg-white/5 transition-all text-white cursor-pointer bg-white/[0.02]"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-text-muted" />}
            <span>{copiedCode ? 'Copied Code!' : 'Copy Partner Code'}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Referrals */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Referrals</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold font-outfit text-white">{totalReferrals}</h3>
            <p className="text-[10px] text-text-muted mt-1">leads referred to ANSH</p>
          </div>
        </div>

        {/* Active Customers */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Customers</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold font-outfit text-white">{activeCustomers}</h3>
            <p className="text-[10px] text-emerald-400 mt-1">{(totalReferrals > 0 ? (activeCustomers/totalReferrals * 100).toFixed(0) : 0)}% conversion rate</p>
          </div>
        </div>

        {/* Monthly Earnings */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Earnings</span>
            <IndianRupee className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold font-outfit text-white">{formatCurrency(monthlyEarnings)}</h3>
            <p className="text-[10px] text-text-muted mt-1">July 2026 earnings</p>
          </div>
        </div>

        {/* Lifetime Earnings */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider">Lifetime Earnings</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold font-outfit text-white">{formatCurrency(lifetimeEarnings)}</h3>
            <p className="text-[10px] text-emerald-400 mt-1">excluding pending approvals</p>
          </div>
        </div>

        {/* Pending Commission */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Commission</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold font-outfit text-white">{formatCurrency(pendingCommission)}</h3>
            <p className="text-[10px] text-amber-400 mt-1">awaiting verification</p>
          </div>
        </div>

        {/* Paid Commission */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider">Paid Commission</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold font-outfit text-white">{formatCurrency(paidCommission)}</h3>
            <p className="text-[10px] text-text-muted mt-1">disbursed to your account</p>
          </div>
        </div>
      </div>

      {/* Mid section: Referral controls & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Analytics Chart */}
        <CommissionChart earningsData={dynamicEarningsData} productData={dynamicProductData} />

        {/* Quick Help Card */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-outfit text-white">Founding Partner Perks</h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              As a Saathi, you get direct line access to ANSH account executives, pre-made WhatsApp swipe templates, customized pitch decks, and recurring monthly bank disbursements.
            </p>
          </div>

          <div className="space-y-2">
            <Link
              href="/dashboard/resources"
              className="flex items-center justify-between p-3 rounded-xl border border-glass-border bg-bg-accent/20 hover:bg-white/5 transition-all text-sm font-semibold group text-white"
            >
              <span>Download Sales Pitch Deck</span>
              <ArrowRight className="w-4 h-4 text-primary-bright group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/dashboard/support"
              className="flex items-center justify-between p-3 rounded-xl border border-glass-border bg-bg-accent/20 hover:bg-white/5 transition-all text-sm font-semibold group text-white"
            >
              <span>View Commission Tiers</span>
              <ArrowRight className="w-4 h-4 text-primary-bright group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom section: Recent Activities */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold font-outfit text-white">Recent Activity</h3>
            <p className="text-xs text-text-muted mt-0.5">Real-time log of your referral milestones and commission releases</p>
          </div>
        </div>

        <div className="divide-y divide-glass-border">
          {recentActivities.length > 0 ? (
            recentActivities.map((act) => (
              <div key={act.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    act.type === 'signup' ? 'bg-primary/10 text-primary-bright' :
                    act.type === 'activation' ? 'bg-emerald-500/10 text-emerald-400' :
                    act.type === 'commission-earned' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {act.type === 'signup' && <Users className="w-4 h-4" />}
                    {act.type === 'activation' && <Building className="w-4 h-4" />}
                    {act.type === 'commission-earned' && <IndianRupee className="w-4 h-4" />}
                    {act.type === 'commission-paid' && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{act.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {new Date(act.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {act.value && (
                  <div className="text-right">
                    <span className={`text-sm font-bold font-outfit ${act.type === 'commission-paid' ? 'text-emerald-400' : 'text-purple-300'}`}>
                      {act.type === 'commission-paid' ? '+' : ''}{act.value}
                    </span>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">
                      {act.type === 'commission-paid' ? 'Disbursed' : 'Earned'}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-text-muted">
              No recent activity found. Share your link to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { usePortalStore } from '@/lib/store';
import { Users, UserPlus, IndianRupee, TrendingUp, ArrowRight, ShieldAlert, Award, FileText, Settings, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { saathis: mockSaathis, customers: mockCustomers, commissions: mockCommissions, tickets } = usePortalStore();

  const [dbSaathis, setDbSaathis] = useState<any[]>([]);
  const [dbCustomers, setDbCustomers] = useState<any[]>([]);
  const [dbCommissions, setDbCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminDashboardData = async () => {
      try {
        setLoading(true);
        const [saathiRes, custRes, commRes] = await Promise.all([
          fetch('/api/admin/saathis'),
          fetch('/api/customers'),
          fetch('/api/commissions')
        ]);
        if (saathiRes.ok) {
          const saathiData = await saathiRes.json();
          setDbSaathis(saathiData);
        }
        if (custRes.ok) {
          const custData = await custRes.json();
          setDbCustomers(custData);
        }
        if (commRes.ok) {
          const commData = await commRes.json();
          setDbCommissions(commData);
        }
      } catch (err) {
        console.error('Error loading admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAdminDashboardData();
  }, []);

  const activeSaathis = useMemo(() => {
    if (loading) return mockSaathis;
    return dbSaathis;
  }, [dbSaathis, mockSaathis, loading]);

  const activeCustomers = useMemo(() => {
    if (loading) return mockCustomers;
    return dbCustomers;
  }, [dbCustomers, mockCustomers, loading]);

  const activeCommissions = useMemo(() => {
    if (loading) return mockCommissions;
    return dbCommissions;
  }, [dbCommissions, mockCommissions, loading]);

  // Calculations
  const totalPartners = activeSaathis.length;
  const pendingApprovals = useMemo(() => activeSaathis.filter(s => s.status === 'pending').length, [activeSaathis]);
  
  const totalReferredMRR = useMemo(() => {
    return activeCustomers.reduce((sum, c) => c.status === 'approved' ? sum + c.mrr : sum, 0);
  }, [activeCustomers]);

  const totalCommissionsPaid = useMemo(() => {
    return activeCommissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);
  }, [activeCommissions]);

  const pendingCommissions = useMemo(() => {
    return activeCommissions.filter(c => c.status === 'pending' || c.status === 'approved').length;
  }, [activeCommissions]);

  const openTickets = useMemo(() => {
    return tickets.filter(t => t.status === 'open').length;
  }, [tickets]);

  // Product counts
  const productShares = useMemo(() => {
    const counts: Record<string, number> = {};
    activeCustomers.forEach(c => {
      if (c.status === 'approved') {
        counts[c.product] = (counts[c.product] || 0) + 1;
      }
    });
    return counts;
  }, [activeCustomers]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Alert Center / Quick notifications banner */}
      {(pendingApprovals > 0 || pendingCommissions > 0 || openTickets > 0) && (
        <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-semibold text-white">Operations Attention Required</h4>
            <div className="text-xs text-text-muted flex flex-wrap gap-x-6 gap-y-1">
              {pendingApprovals > 0 && (
                <span>• {pendingApprovals} Saathi signup(s) awaiting approval</span>
              )}
              {pendingCommissions > 0 && (
                <span>• {pendingCommissions} commission ledger item(s) to verify & disburse</span>
              )}
              {openTickets > 0 && (
                <span>• {openTickets} support ticket(s) awaiting replies</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Saathis */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-36">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Partners</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-3xl font-bold font-outfit text-white">{totalPartners}</h3>
            <p className="text-[10px] text-purple-400 mt-1">across the global partner network</p>
          </div>
        </div>

        {/* Pending signups */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-36 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Approvals</span>
            <UserPlus className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-3xl font-bold font-outfit text-white">{pendingApprovals}</h3>
            <p className="text-[10px] text-amber-400 mt-1">applications under review</p>
          </div>
        </div>

        {/* Total Referred MRR */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-36">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Referred MRR</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-3xl font-bold font-outfit text-white">{formatCurrency(totalReferredMRR)}</h3>
            <p className="text-[10px] text-emerald-400 mt-1">from active referred users</p>
          </div>
        </div>

        {/* Commissions Disbursed */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-36">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Commissions Paid</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-3xl font-bold font-outfit text-white">{formatCurrency(totalCommissionsPaid)}</h3>
            <p className="text-[10px] text-text-muted mt-1">lifetime partner payouts</p>
          </div>
        </div>
      </div>

      {/* Product breakdown & Quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Product Adoption Chart Card */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-bold font-outfit text-white">Referred Product Adoption</h3>
            <p className="text-xs text-text-muted mt-0.5">Active subscriptions grouped by ANSH modules</p>
          </div>

          <div className="space-y-4">
            {Object.entries(productShares).map(([prodName, count]) => {
              const totalActive = Object.values(productShares).reduce((a, b) => a + b, 0) || 1;
              const percentage = (count / totalActive) * 100;
              return (
                <div key={prodName} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">{prodName}</span>
                    <span className="text-text-muted font-bold">{count} customer(s) ({percentage.toFixed(0)}%)</span>
                  </div>
                  {/* Custom Progress bar */}
                  <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-glass-border">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Quick Actions */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-outfit text-white flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Operations Panel</span>
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Quick links to execute common portal maintenance tasks:
            </p>
          </div>

          <div className="space-y-2">
            <Link
              href="/admin/saathis"
              className="flex items-center justify-between p-3 rounded-xl border border-glass-border bg-bg-accent/20 hover:bg-white/5 transition-all text-sm font-semibold group text-white"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" />
                <span>Approve Partners ({pendingApprovals})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/admin/commissions"
              className="flex items-center justify-between p-3 rounded-xl border border-glass-border bg-bg-accent/20 hover:bg-white/5 transition-all text-sm font-semibold group text-white"
            >
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-purple-400" />
                <span>Clear Payouts ({pendingCommissions})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/admin/tickets"
              className="flex items-center justify-between p-3 rounded-xl border border-glass-border bg-bg-accent/20 hover:bg-white/5 transition-all text-sm font-semibold group text-white"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Resolve Tickets ({openTickets})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

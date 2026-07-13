'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePortalStore } from '@/lib/store';
import { Calendar, Search, AlertTriangle, ShieldCheck, ChevronRight, ArrowUpRight, HelpCircle, AlertCircle, Building, Clock, CheckCircle2 } from 'lucide-react';

interface RenewalClient {
  id: string;
  companyName: string;
  companyAddress: string;
  product: string;
  mrr: number;
  joinedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  renewalDate: Date;
  daysRemaining: number;
  commissionRate: number;
}

export default function RenewalsPage() {
  const { currentSaathiId } = usePortalStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch customers
  useEffect(() => {
    if (!currentSaathiId) return;
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/customers?saathiId=${currentSaathiId}`);
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [currentSaathiId]);

  // Calculate renewal metrics
  const renewalsList = useMemo(() => {
    const now = new Date();
    // Reset time for fair day calculations
    now.setHours(0, 0, 0, 0);

    return customers
      .filter(c => c.status === 'approved') // Only approved clients have billing/renewal lifecycles
      .map(c => {
        const purchaseDate = new Date(c.joinedDate);
        purchaseDate.setHours(0, 0, 0, 0);
        
        // Calculate dynamic next renewal date based on a 30-day billing cycle
        const diffMs = now.getTime() - purchaseDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        let cycles = Math.floor(diffDays / 30);
        if (cycles < 0) cycles = 0;

        const renewalDate = new Date(purchaseDate.getTime() + (cycles + 1) * 30 * 24 * 60 * 60 * 1000);
        
        const diffTime = renewalDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          ...c,
          renewalDate,
          daysRemaining
        } as RenewalClient;
      })
      // "10 days or less" condition + recently expired / overdue renewals
      .filter(c => c.daysRemaining <= 10 && c.daysRemaining >= -10)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [customers]);

  // Filtered renewals based on search term
  const filteredRenewals = useMemo(() => {
    return renewalsList.filter(r => 
      r.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.product.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [renewalsList, searchTerm]);

  const getDaysBadge = (days: number) => {
    if (days === 0) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Renewing Today</span>
        </span>
      );
    }
    if (days < 0) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600/10 text-red-300 border border-red-600/20 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Overdue by {Math.abs(days)} day{Math.abs(days) > 1 ? 's' : ''}</span>
        </span>
      );
    }
    if (days <= 3) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Due in {days} day{days > 1 ? 's' : ''}</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
        <Calendar className="w-3.5 h-3.5" />
        <span>Due in {days} days</span>
      </span>
    );
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Description header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-text-muted">
            Track and manage client subscription renewals. Clients whose subscription anniversaries are within 10 days are listed below.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-xl flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search renewal client..."
            className="w-full bg-white/[0.03] border border-glass-border focus:border-primary rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-text-muted focus:outline-none transition-all"
          />
        </div>
        <div className="text-xs text-text-muted font-medium">
          Total upcoming: <strong className="text-white">{filteredRenewals.length}</strong>
        </div>
      </div>

      {/* Renewals Table/Cards */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xl border border-glass-border">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <div className="w-8 h-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
            <span className="text-xs text-text-muted">Loading renewal schedules...</span>
          </div>
        ) : filteredRenewals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-glass-border bg-bg-accent/40 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Company Name</th>
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6 text-right">Contract MRR</th>
                  <th className="py-4 px-6">Original Purchase</th>
                  <th className="py-4 px-6">Upcoming Renewal</th>
                  <th className="py-4 px-6 text-center">Time to Renewal</th>
                  <th className="py-4 px-6 text-right">Commission Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {filteredReferralsMapping(filteredRenewals, formatCurrency, getDaysBadge)}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-semibold text-white">All Subscriptions Secure</h3>
              <p className="text-xs text-text-muted">
                None of your referred clients have subscription renewals due in the next 10 days.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

function filteredReferralsMapping(
  list: RenewalClient[], 
  formatCurrency: (val: number) => string,
  getDaysBadge: (days: number) => React.ReactNode
) {
  return list.map((r) => {
    return (
      <tr key={r.id} className="hover:bg-white/[0.01] transition-colors text-sm text-white">
        <td className="py-4 px-6 font-semibold">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-bright shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <span>{r.companyName}</span>
          </div>
        </td>
        <td className="py-4 px-6">
          <span className="font-medium px-2.5 py-1 rounded-md bg-purple-950/40 text-purple-300 border border-purple-900/30 text-xs">
            {r.product}
          </span>
        </td>
        <td className="py-4 px-6 text-right font-mono font-bold text-white">
          {formatCurrency(r.mrr)}
        </td>
        <td className="py-4 px-6 text-text-muted">
          {new Date(r.joinedDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </td>
        <td className="py-4 px-6 text-white font-medium">
          {r.renewalDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </td>
        <td className="py-4 px-6 flex justify-center">
          {getDaysBadge(r.daysRemaining)}
        </td>
        <td className="py-4 px-6 text-right font-mono font-extrabold text-primary-bright">
          {r.commissionRate}%
        </td>
      </tr>
    );
  });
}

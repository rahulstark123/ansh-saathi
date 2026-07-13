'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, CheckSquare, XSquare, Clock, Landmark, Users, ArrowUpRight, HelpCircle, CheckCircle2, XCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomerReferral {
  id: string;
  companyName: string;
  companyAddress: string;
  leadSource: string;
  product: string;
  users: number;
  mrr: number;
  status: 'pending' | 'approved' | 'rejected';
  joinedDate: string;
  commissionRate: number;
  saathiId: string;
  saathiName: string;
  saathiEmail: string;
  saathiCode: string;
}

export default function AdminCustomersApprovalPage() {
  const [referrals, setReferrals] = useState<CustomerReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Search/Filters states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [productFilter, setProductFilter] = useState('all');

  // Custom Modal Confirmation States
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);
  const [confirmTargetStatus, setConfirmTargetStatus] = useState<'approved' | 'rejected' | null>(null);
  const [confirmCompanyName, setConfirmCompanyName] = useState('');

  // Fetch referrals
  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error('Failed to fetch referrals');
      const data = await res.json();
      setReferrals(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleOpenConfirm = (id: string, name: string, status: 'approved' | 'rejected') => {
    setConfirmTargetId(id);
    setConfirmCompanyName(name);
    setConfirmTargetStatus(status);
    setConfirmModalOpen(true);
  };

  const handleExecuteStatusUpdate = async () => {
    if (!confirmTargetId || !confirmTargetStatus) return;

    try {
      setActionLoading(true);
      setError('');
      const res = await fetch('/api/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmTargetId, status: confirmTargetStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to update status to ${confirmTargetStatus}`);
      }

      setConfirmModalOpen(false);
      setConfirmTargetId(null);
      setConfirmTargetStatus(null);
      fetchReferrals();
    } catch (err: any) {
      setError(err.message || 'Failed to update referral status');
    } finally {
      setActionLoading(false);
    }
  };

  // Static list of all available products for filter dropdown
  const uniqueProducts = ['all', 'ANSH Tasks', 'ANSH HR', 'ANSH Expense', 'ANSH Visitor', 'ANSH Forms', 'ANSH Links'];

  // Filter and Search logic
  const filteredReferrals = useMemo(() => {
    return referrals.filter(r => {
      const companyMatch = r.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
      const partnerMatch = r.saathiName?.toLowerCase().includes(searchTerm.toLowerCase());
      const productMatch = r.product?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = companyMatch || partnerMatch || productMatch;
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesProduct = productFilter === 'all' || r.product === productFilter;
      return matchesSearch && matchesStatus && matchesProduct;
    });
  }, [referrals, searchTerm, statusFilter, productFilter]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
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
            Review client referrals submitted by Saathi partners. Approve referrals to authorize recurring commission payout metrics.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-white"><XSquare className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search client, partner, or product..."
            className="w-full bg-white/[0.03] border border-glass-border focus:border-purple-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-text-muted focus:outline-none transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
          <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold tracking-wider uppercase">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Product Filter */}
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="bg-bg-accent/80 border border-glass-border text-white text-xs rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 transition-all cursor-pointer min-w-[125px]"
          >
            <option value="all">All Products</option>
            {uniqueProducts.filter(p => p !== 'all').map(prod => (
              <option key={prod} value={prod}>{prod}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-bg-accent/80 border border-glass-border text-white text-xs rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 transition-all cursor-pointer min-w-[125px]"
          >
            <option value="all">All Approval States</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Referrals Table Card */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xl border border-glass-border">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <div className="w-8 h-8 border-2 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
            <span className="text-xs text-text-muted">Loading referred clients...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-glass-border bg-bg-accent/40 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Client Details</th>
                  <th className="py-4 px-6">Referred By Partner</th>
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6 text-center">Users</th>
                  <th className="py-4 px-6 text-right">MRR</th>
                  <th className="py-4 px-6 text-center">Referral State</th>
                  <th className="py-4 px-6 text-right">Monthly Comm.</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {filteredReferrals.length > 0 ? (
                  filteredReferrals.map((r) => {
                    const monthlyComm = (r.mrr * r.commissionRate) / 100;
                    return (
                      <tr key={r.id} className="hover:bg-white/[0.01] transition-colors text-sm text-white">
                        {/* Company */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                              <Landmark className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold">{r.companyName}</span>
                              {r.companyAddress && <span className="text-[10px] text-text-muted mt-0.5">{r.companyAddress}</span>}
                            </div>
                          </div>
                        </td>
                        {/* Partner Referrer */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{r.saathiName}</span>
                            <span className="text-[10px] text-text-muted font-mono tracking-wider mt-0.5">{r.saathiCode || r.saathiEmail}</span>
                          </div>
                        </td>
                        {/* Product */}
                        <td className="py-4 px-6">
                          <span className="font-medium px-2.5 py-1 rounded-md bg-purple-950/40 text-purple-300 border border-purple-900/30 text-xs">
                            {r.product}
                          </span>
                        </td>
                        {/* Users */}
                        <td className="py-4 px-6 text-center font-medium">
                          {r.users}
                        </td>
                        {/* MRR */}
                        <td className="py-4 px-6 text-right font-mono font-bold text-white">
                          {formatCurrency(r.mrr)}
                        </td>
                        {/* Status */}
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadgeClass(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                        {/* Monthly Commission */}
                        <td className="py-4 px-6 text-right font-mono font-extrabold text-purple-400">
                          {formatCurrency(monthlyComm)}
                        </td>
                        {/* Operations */}
                        <td className="py-4 px-6">
                          {r.status === 'pending' ? (
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenConfirm(r.id, r.companyName, 'rejected')}
                                disabled={actionLoading}
                                title="Reject referral"
                                className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 cursor-pointer disabled:opacity-40"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenConfirm(r.id, r.companyName, 'approved')}
                                disabled={actionLoading}
                                title="Approve referral"
                                className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer disabled:opacity-40"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center text-[10px] text-text-muted/50 font-mono italic">
                              Locked
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-text-muted">
                      No referred customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-bg-accent border border-glass-border p-6 rounded-2xl max-w-sm w-full relative z-10 shadow-2xl space-y-5 text-center"
            >
              {/* Header Icon */}
              <div className="flex justify-center">
                {confirmTargetStatus === 'approved' ? (
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6 animate-bounce" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Title & Desc */}
              <div className="space-y-2">
                <h3 className="text-base font-bold font-outfit text-white">
                  {confirmTargetStatus === 'approved' ? 'Approve Referral?' : 'Reject Referral?'}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Are you sure you want to {confirmTargetStatus === 'approved' ? 'approve' : 'reject'} the client referral for{' '}
                  <strong className="text-white font-semibold">{confirmCompanyName}</strong>?
                  {confirmTargetStatus === 'approved' 
                    ? ' This will activate recurring monthly commissions for the partner.'
                    : ' This referral will be locked as rejected.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-glass-border hover:bg-white/5 text-xs font-semibold text-text-muted hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteStatusUpdate}
                  disabled={actionLoading}
                  className={`flex-1 px-4 py-2 rounded-xl text-white font-semibold text-xs shadow-lg transition-all cursor-pointer hover:opacity-90 ${
                    confirmTargetStatus === 'approved' 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500' 
                      : 'bg-gradient-to-r from-red-600 to-rose-500'
                  }`}
                >
                  {actionLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

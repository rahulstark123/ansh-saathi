'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { usePortalStore } from '@/lib/store';
import { 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Search, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  X,
  Send,
  Loader2,
  Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommissionsPage() {
  const { commissions, currentSaathiId } = usePortalStore();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all_time');
  const [currentPage, setCurrentPage] = useState(1);
  const [dbCommissions, setDbCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  // Payout request modal states
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutError, setPayoutError] = useState('');
  const [payoutSuccess, setPayoutSuccess] = useState('');

  const fetchCommissions = async () => {
    if (!currentSaathiId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/commissions?saathiId=${currentSaathiId}`);
      if (res.ok) {
        const data = await res.json();
        setDbCommissions(data);
      }
    } catch (err) {
      console.error('Error fetching DB commissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, [currentSaathiId]);

  // Combined commissions: use DB records if available, otherwise fall back to Zustand mock store data
  const activeCommissionsList = useMemo(() => {
    if (dbCommissions && dbCommissions.length > 0) {
      return dbCommissions;
    }
    return commissions.filter(c => c.saathiId === currentSaathiId);
  }, [dbCommissions, commissions, currentSaathiId]);

  // Filter commissions for current Saathi by time
  const myCommissionsByTime = useMemo(() => {
    const now = new Date();

    return activeCommissionsList.filter(c => {
      // Date calculations
      const recordDate = new Date(c.date);
      const startOfDay = (d: Date) => {
        const nd = new Date(d);
        nd.setHours(0, 0, 0, 0);
        return nd;
      };

      const recordMs = startOfDay(recordDate).getTime();
      const nowMs = startOfDay(now).getTime();

      switch (timeFilter) {
        case 'today':
          return recordMs === nowMs;
        case 'this_week': {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          return recordMs >= startOfWeek.getTime() && recordMs <= nowMs;
        }
        case 'this_month': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return recordMs >= startOfMonth.getTime() && recordMs <= nowMs;
        }
        case 'last_month': {
          const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          return recordMs >= firstDayLastMonth.getTime() && recordMs <= lastDayLastMonth.getTime();
        }
        case 'last_3_months': {
          const startOf3Months = new Date(now);
          startOf3Months.setDate(now.getDate() - 90);
          startOf3Months.setHours(0, 0, 0, 0);
          return recordMs >= startOf3Months.getTime() && recordMs <= nowMs;
        }
        case 'last_6_months': {
          const startOf6Months = new Date(now);
          startOf6Months.setDate(now.getDate() - 180);
          startOf6Months.setHours(0, 0, 0, 0);
          return recordMs >= startOf6Months.getTime() && recordMs <= nowMs;
        }
        case 'this_year': {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          return recordMs >= startOfYear.getTime() && recordMs <= nowMs;
        }
        case 'all_time':
        default:
          return true;
      }
    });
  }, [activeCommissionsList, timeFilter]);

  // Calculations for cards
  const pendingAmount = useMemo(() => {
    return myCommissionsByTime
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.amount, 0);
  }, [myCommissionsByTime]);

  const approvedAmount = useMemo(() => {
    return myCommissionsByTime
      .filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + c.amount, 0);
  }, [myCommissionsByTime]);

  const paidAmount = useMemo(() => {
    return myCommissionsByTime
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.amount, 0);
  }, [myCommissionsByTime]);

  const lifetimeAmount = useMemo(() => {
    return myCommissionsByTime
      .filter(c => c.status === 'paid' || c.status === 'approved' || c.status === 'pending')
      .reduce((sum, c) => sum + c.amount, 0);
  }, [myCommissionsByTime]);

  // Filter and search logic
  const filteredCommissions = useMemo(() => {
    return myCommissionsByTime.filter(c => {
      const matchesSearch = c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.product.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [myCommissionsByTime, searchTerm, statusFilter]);

  // Eligibility calculation for payout request
  const payoutEligibility = useMemo(() => {
    const today = new Date();
    const day = today.getDate();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    const isUpto15 = day >= 1 && day <= 15;
    const isEndOfMonth = day === lastDayOfMonth || day === (lastDayOfMonth - 1) || day === 1;

    return {
      eligible: isUpto15 || isEndOfMonth,
      windowName: isUpto15 ? 'First Half (Upto 15th)' : isEndOfMonth ? 'End of Month (30th, 31st, 1st)' : null
    };
  }, []);

  const handleApplyPayout = async () => {
    if (!currentSaathiId) return;
    setSubmittingPayout(true);
    setPayoutError('');
    setPayoutSuccess('');

    try {
      const res = await fetch('/api/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saathiId: currentSaathiId })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request payout');
      }

      setPayoutSuccess(data.message || 'Payout request submitted successfully!');
      fetchCommissions(); // reload records
      setTimeout(() => {
        setShowPayoutModal(false);
        setPayoutSuccess('');
      }, 2500);
    } catch (err: any) {
      setPayoutError(err.message || 'Failed to submit request');
    } finally {
      setSubmittingPayout(false);
    }
  };

  const downloadStatement = () => {
    const headers = [
      'Billing Date',
      'Company Name',
      'Product Referred',
      'Commission Amount (INR)',
      'Status',
      'Payment Date',
      'Reference ID',
      'Payment Mode',
      'Payment Through',
      'Admin Comments'
    ];
    const rows = filteredCommissions.map(c => [
      new Date(c.date).toLocaleDateString('en-IN'),
      c.companyName,
      c.product,
      c.amount,
      c.status === 'paid' ? 'Paid' : c.status === 'approved' ? 'Approved (Pending Disbursal)' : c.status === 'pending' ? 'Pending Review' : 'Cancelled',
      c.paymentDate ? new Date(c.paymentDate).toLocaleDateString('en-IN') : '--',
      c.referenceNumber || '--',
      c.paymentMode || '--',
      c.paymentThrough || '--',
      c.adminNote || '--'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `commission_statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredCommissions.length / itemsPerPage) || 1;
  const paginatedCommissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCommissions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCommissions, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Paid</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-3 h-3" />
            <span>Approved (Pending Disbursal)</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
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
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Card */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-amber-500 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Pending Payouts</span>
            <h3 className="text-3xl font-bold font-outfit text-white">{formatCurrency(pendingAmount)}</h3>
            <p className="text-[10px] text-text-muted">Awaiting weekly bank clearance</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Paid Card */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Paid Payouts</span>
            <h3 className="text-3xl font-bold font-outfit text-white">{formatCurrency(paidAmount)}</h3>
            <p className="text-[10px] text-emerald-400">Credited to your bank account</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Lifetime Earnings Card */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-primary flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Lifetime Earnings</span>
            <h3 className="text-3xl font-bold font-outfit text-white">{formatCurrency(lifetimeAmount)}</h3>
            <p className="text-[10px] text-text-muted font-medium">Referred recurring revenue</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary-bright">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Payout note */}
      <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 text-xs text-blue-300 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Payout Schedule:</span> Commission ledgers generate on the 1st of every month based on active user subscriptions. Disbursements are processed on the 5th of every month directly to your registered bank account.
        </div>
      </div>

      {/* Filter and search ledger */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold font-outfit text-white">Commissions Ledger</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPayoutModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-xs font-semibold text-white transition-all cursor-pointer shadow-lg shadow-primary/20"
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Take commission amount</span>
            </button>
            <button 
              onClick={downloadStatement}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-glass-border hover:bg-white/5 text-xs text-white transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Statement</span>
            </button>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search company or product..."
              className="w-full bg-white/[0.03] border border-glass-border focus:border-primary rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-text-muted focus:outline-none transition-all"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap md:flex-nowrap gap-3 items-center w-full md:w-auto justify-end">
            <SlidersHorizontal className="w-4 h-4 text-text-muted shrink-0" />
            
            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => { setTimeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-bg-accent/80 border border-glass-border text-white text-xs rounded-xl py-2 pl-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:0.8rem_0.8rem] bg-[position:right_0.5rem_center] focus:outline-none focus:border-primary transition-all w-full md:w-auto cursor-pointer"
            >
              <option value="all_time">All Time</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="last_6_months">Last 6 Months</option>
              <option value="this_year">This Year</option>
            </select>

            {/* Status filter dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-bg-accent/80 border border-glass-border text-white text-xs rounded-xl py-2 pl-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:0.8rem_0.8rem] bg-[position:right_0.5rem_center] focus:outline-none focus:border-primary transition-all w-full md:w-auto cursor-pointer"
            >
              <option value="all">All Payout Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved (Pending Disbursal)</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-glass-border">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-glass-border bg-bg-accent/40 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Billing Date</th>
                  <th className="py-4 px-6">Company</th>
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6 text-right">Commission Amount</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6">Payment Date</th>
                  <th className="py-4 px-6">Reference ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border text-sm text-white">
                {paginatedCommissions.length > 0 ? (
                  paginatedCommissions.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6 text-text-muted">
                        {new Date(c.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        {c.companyName}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs px-2 py-0.5 rounded bg-bg-accent border border-glass-border font-medium">
                          {c.product}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(c.amount)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {getStatusBadge(c.status)}
                      </td>
                      <td className="py-4 px-6 text-text-muted">
                        {c.paymentDate ? new Date(c.paymentDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : '--'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-mono text-xs text-text-muted">
                          {c.referenceNumber || '--'}
                        </div>
                        {c.paymentMode && (
                          <p className="text-[10px] text-text-muted/70 mt-0.5">
                            Mode: <span className="font-semibold text-white/80">{c.paymentMode}</span> {c.paymentThrough && <span>({c.paymentThrough})</span>}
                          </p>
                        )}
                        {c.adminNote && (
                          <p className="text-[10px] text-text-muted/80 mt-1 italic max-w-[150px] truncate" title={c.adminNote}>
                            Note: {c.adminNote}
                          </p>
                        )}
                        {c.attachments && c.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {c.attachments.map((url: string, idx: number) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 text-[9px] font-bold text-primary-bright hover:underline shrink-0"
                              >
                                <Paperclip className="w-2.5 h-2.5" />
                                <span>Receipt {idx + 1}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-text-muted">
                      No commissions ledger records match search/filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table pagination */}
          {totalPages > 1 && (
            <div className="py-4 px-6 border-t border-glass-border flex items-center justify-between bg-bg-accent/10">
              <span className="text-xs text-text-muted">
                Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredCommissions.length} total results)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-1.5 rounded-lg border border-glass-border bg-bg-accent/40 text-white hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-1.5 rounded-lg border border-glass-border bg-bg-accent/40 text-white hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payout Request Modal */}
      <AnimatePresence>
        {showPayoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => !submittingPayout && setShowPayoutModal(false)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-bg-dark border border-glass-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-glass-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary-bright">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-outfit text-white">Take commission amount</h3>
                    <p className="text-xs text-text-muted">Apply for your earned payouts</p>
                  </div>
                </div>
                <button
                  onClick={() => !submittingPayout && setShowPayoutModal(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Rules / Schedule Info */}
                <div className="p-4 rounded-xl border border-blue-500/15 bg-blue-500/5 text-xs text-blue-300 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5 text-blue-200">
                    <AlertCircle className="w-4 h-4" /> Payout Request Note:
                  </p>
                  <p className="leading-relaxed font-medium">
                    You can request payout of your commissions 2 times in a month:
                    <span className="block mt-1 font-semibold text-white">• Up to the 15th of the month</span>
                    <span className="block font-semibold text-white">• After the last working day (30th, 31st, or 1st of next month)</span>
                  </p>
                  <p className="text-[10px] text-blue-400/80 italic pt-1 border-t border-blue-500/10 mt-2">
                    Otherwise, the administrator will automatically disburse your money on standard schedules.
                  </p>
                </div>

                {/* Stat Display */}
                <div className="glass-card p-4 rounded-xl border border-glass-border flex justify-between items-center bg-white/[0.01]">
                  <div>
                    <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Withdrawable Amount</p>
                    <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{formatCurrency(pendingAmount)}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    payoutEligibility.eligible 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {payoutEligibility.eligible ? 'Eligible Today' : 'Closed Today'}
                  </div>
                </div>

                {/* Eligibility Window Warning */}
                {payoutEligibility.eligible ? (
                  <div className="p-3 rounded-lg border border-emerald-500/15 bg-emerald-500/5 text-xs text-emerald-400 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <p>Current window: <span className="font-semibold text-white">{payoutEligibility.windowName}</span> is open. You can request disbursal now.</p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-amber-500/15 bg-amber-500/5 text-xs text-amber-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <p>Payout window is currently closed. You can next request payout after the end of this month or on the next cycle.</p>
                  </div>
                )}

                {payoutError && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" /> {payoutError}
                  </p>
                )}

                {payoutSuccess && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5 shrink-0" /> {payoutSuccess}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    disabled={submittingPayout}
                    onClick={() => setShowPayoutModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-glass-border text-text-muted hover:text-white hover:bg-white/5 text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
                  >
                    Close
                  </button>
                  <button
                    disabled={!payoutEligibility.eligible || pendingAmount <= 0 || submittingPayout}
                    onClick={handleApplyPayout}
                    className="flex-1 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {submittingPayout ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{submittingPayout ? 'Submitting...' : 'Apply for Payout'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


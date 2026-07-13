'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { usePortalStore, Commission } from '@/lib/store';
import { 
  Check, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Search, 
  SlidersHorizontal, 
  ArrowUpRight, 
  X, 
  CreditCard, 
  Send,
  Paperclip,
  Upload,
  Loader2,
  FileText,
  AlertCircle,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Compress image file via canvas
async function compressImage(file: File, maxWidthPx = 1024): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidthPx / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, file.type, 0.82);
    };
    img.onerror = reject;
    img.src = url;
  });
}


export default function AdminCommissionsPage() {
  const { commissions, saathis, markCommissionPaid } = usePortalStore();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [timeFilter, setTimeFilter] = useState('all_time');
  const [payingCommissionId, setPayingCommissionId] = useState<string | null>(null);
  const [txnReference, setTxnReference] = useState('');
  const [dbCommissions, setDbCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/commissions');
      if (res.ok) {
        const data = await res.json();
        setDbCommissions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const activeCommissions = useMemo(() => {
    if (dbCommissions && dbCommissions.length > 0) {
      return dbCommissions;
    }
    return commissions;
  }, [dbCommissions, commissions]);

  // Get matching Saathi name for each commission
  const commissionsWithSaathi = useMemo(() => {
    return activeCommissions.map(c => {
      const saathi = saathis.find(s => s.id === c.saathiId);
      return {
        ...c,
        saathiName: saathi?.name || 'Unknown Partner',
        saathiCode: saathi?.partnerCode || 'PENDING'
      };
    });
  }, [activeCommissions, saathis]);

  // Filter/Search logic
  const filteredCommissions = useMemo(() => {
    const now = new Date();

    return commissionsWithSaathi.filter(c => {
      const matchesSearch = c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.saathiName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.saathiCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      
      if (!matchesSearch || !matchesStatus) return false;

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
  }, [commissionsWithSaathi, searchTerm, statusFilter, timeFilter]);

  const downloadStatement = () => {
    const headers = [
      'Generated Date',
      'Partner Name',
      'Partner Code',
      'Company referred',
      'Product',
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
      c.saathiName,
      c.saathiCode,
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
    link.setAttribute('download', `admin_commissions_statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [adminNote, setAdminNote] = useState('');
  const [payoutFiles, setPayoutFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentThrough, setPaymentThrough] = useState('GPay');

  const handleOpenPayoutModal = (comm: Commission) => {
    setTxnReference('');
    setPayingCommissionId(comm.id);
    setAdminNote('');
    setPayoutFiles([]);
    setFileError('');
    setPaymentMode('UPI');
    setPaymentThrough('GPay');
  };

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setFileError('');
    const newFiles = Array.from(incoming);
    const combined = [...payoutFiles, ...newFiles];

    if (combined.length > 3) {
      setFileError('Maximum 3 receipt files allowed.');
      return;
    }

    for (const f of newFiles) {
      if (f.size > 2 * 1024 * 1024) {
        setFileError('Each file must be under 2MB.');
        return;
      }
    }

    setPayoutFiles(combined);
  };

  const removeFile = (i: number) => {
    setPayoutFiles(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleConfirmPayout = async () => {
    if (!payingCommissionId || !txnReference) return;
    setSubmittingPayout(true);
    setFileError('');
    
    try {
      // 1. Upload files first
      const uploadedUrls: string[] = [];
      for (const file of payoutFiles) {
        let blob: Blob = file;
        if (file.type.startsWith('image/')) {
          blob = await compressImage(file);
        }
        const formData = new FormData();
        formData.append('file', blob, file.name);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) uploadedUrls.push(data.url);
      }

      // 2. Call DB API PATCH to mark paid
      const res = await fetch('/api/commissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissionId: payingCommissionId,
          status: 'paid',
          referenceNumber: txnReference,
          adminNote: adminNote.trim() || null,
          attachments: uploadedUrls,
          paymentMode,
          paymentThrough
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update commission');
      }

      markCommissionPaid(payingCommissionId, txnReference);
      fetchCommissions(); // refresh database records
      setPayingCommissionId(null);
      setAdminNote('');
      setPayoutFiles([]);
    } catch (err: any) {
      console.error('Error confirming payout in DB:', err);
      setFileError(err.message || 'Failed to release payout.');
    } finally {
      setSubmittingPayout(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Paid</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
            <span>Cancelled</span>
          </span>
        );
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
      <div>
        <p className="text-sm text-text-muted">
          Review, approve, and disburse partner payouts. Marking a commission item as paid updates the partner's local ledger and dashboard stats in real-time.
        </p>
      </div>

      {/* Filters ledger */}
      <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-85">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search partner name, code, or client company..."
            className="w-full bg-white/[0.03] border border-glass-border focus:border-purple-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-text-muted focus:outline-none transition-all"
          />
        </div>

        {/* Filters dropdowns */}
        <div className="flex flex-wrap md:flex-nowrap gap-3 items-center w-full md:w-auto justify-end">
          <SlidersHorizontal className="w-4 h-4 text-text-muted shrink-0" />
          
          {/* Time Filter */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-bg-accent/80 border border-glass-border text-white text-xs rounded-xl py-2 pl-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:0.8rem_0.8rem] bg-[position:right_0.5rem_center] focus:outline-none focus:border-purple-500 transition-all w-full md:w-auto cursor-pointer"
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
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-bg-accent/80 border border-glass-border text-white text-xs rounded-xl py-2 pl-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:0.8rem_0.8rem] bg-[position:right_0.5rem_center] focus:outline-none focus:border-purple-500 transition-all w-full md:w-auto cursor-pointer"
          >
            <option value="all">All Payout Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved (Pending Disbursal)</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button 
            onClick={downloadStatement}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-glass-border hover:bg-white/5 text-xs text-white transition-all cursor-pointer w-full md:w-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-glass-border shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-glass-border bg-bg-accent/40 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Generated Date</th>
                <th className="py-4 px-6">Partner</th>
                <th className="py-4 px-6">Company referred</th>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6 text-right">Commission Amount</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6">Payout Action / Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border text-sm text-white">
              {filteredCommissions.length > 0 ? (
                filteredCommissions.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                    {/* Date */}
                    <td className="py-4 px-6 text-text-muted">
                      {new Date(c.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    {/* Partner name */}
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold">{c.saathiName}</p>
                        <p className="text-[10px] font-mono text-purple-400 mt-0.5 tracking-wider">{c.saathiCode}</p>
                      </div>
                    </td>
                    {/* Company referred */}
                    <td className="py-4 px-6 font-medium">
                      {c.companyName}
                    </td>
                    {/* Product */}
                    <td className="py-4 px-6">
                      <span className="text-xs px-2.5 py-0.5 rounded bg-bg-accent border border-glass-border font-medium">
                        {c.product}
                      </span>
                    </td>
                    {/* Commission amount */}
                    <td className="py-4 px-6 text-right font-mono font-bold text-purple-300">
                      {formatCurrency(c.amount)}
                    </td>
                    {/* Payout Status */}
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(c.status)}
                    </td>
                    {/* Disbursal Action */}
                    <td className="py-4 px-6">
                      {c.status === 'paid' ? (
                        <div className="text-xs text-text-muted">
                          <p className="font-semibold text-emerald-400">Paid on {new Date(c.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <p className="font-mono text-[10px] mt-0.5 truncate max-w-[120px]">{c.referenceNumber}</p>
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
                                  className="inline-flex items-center gap-0.5 text-[9px] font-bold text-purple-400 hover:underline shrink-0"
                                >
                                  <Paperclip className="w-2.5 h-2.5" />
                                  <span>Receipt {idx + 1}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : c.status === 'approved' || c.status === 'pending' ? (
                        <button
                          onClick={() => handleOpenPayoutModal(c)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 font-semibold text-xs text-white shadow-md cursor-pointer transition-all"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Release Payout</span>
                        </button>
                      ) : (
                        <span className="text-xs text-text-muted/50">Disallowed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    No partner commission ledger records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Release Payout Bank Details Entry Modal */}
      <AnimatePresence>
        {payingCommissionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !submittingPayout && setPayingCommissionId(null)}></div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-accent border border-glass-border p-6 rounded-2xl max-w-md w-full relative z-10 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center pb-2 border-b border-glass-border">
                <h4 className="text-base font-bold font-outfit text-white">Record Commission Disbursal</h4>
                <button onClick={() => !submittingPayout && setPayingCommissionId(null)} className="p-1 rounded hover:bg-white/5 text-text-muted cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-text-muted leading-relaxed">
                  Enter transaction details, write notes, and upload receipts to mark this commission as "Paid".
                </p>

                {/* Txn ID */}
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Transaction Reference ID <span className="text-purple-400">*</span></label>
                  <input
                    type="text"
                    value={txnReference}
                    onChange={(e) => setTxnReference(e.target.value)}
                    className="w-full bg-white/[0.03] border border-glass-border focus:border-purple-500 rounded-xl py-2 px-3 text-sm text-white font-mono tracking-wider focus:outline-none"
                    placeholder="e.g. TXN10203040"
                    disabled={submittingPayout}
                    required
                  />
                </div>

                {/* Payment Details Grids */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Payment Mode */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full bg-[#181824] border border-glass-border focus:border-purple-500 rounded-xl py-2 pl-3 pr-8 text-sm text-white focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:0.8rem_0.8rem] bg-[position:right_0.5rem_center] cursor-pointer"
                      disabled={submittingPayout}
                    >
                      <option className="bg-[#181824] text-white" value="UPI">UPI</option>
                      <option className="bg-[#181824] text-white" value="NetBanking">Net Banking</option>
                      <option className="bg-[#181824] text-white" value="Cheque">Cheque</option>
                      <option className="bg-[#181824] text-white" value="IMPS">IMPS</option>
                      <option className="bg-[#181824] text-white" value="RTGS">RTGS</option>
                      <option className="bg-[#181824] text-white" value="NEFT">NEFT</option>
                      <option className="bg-[#181824] text-white" value="Other">Other</option>
                    </select>
                  </div>

                  {/* Payment Through */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Payment Through</label>
                    <select
                      value={paymentThrough}
                      onChange={(e) => setPaymentThrough(e.target.value)}
                      className="w-full bg-[#181824] border border-glass-border focus:border-purple-500 rounded-xl py-2 pl-3 pr-8 text-sm text-white focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:0.8rem_0.8rem] bg-[position:right_0.5rem_center] cursor-pointer"
                      disabled={submittingPayout}
                    >
                      <option className="bg-[#181824] text-white" value="GPay">Google Pay (GPay)</option>
                      <option className="bg-[#181824] text-white" value="PhonePe">PhonePe</option>
                      <option className="bg-[#181824] text-white" value="Paytm">Paytm</option>
                      <option className="bg-[#181824] text-white" value="NEFT">NEFT Transfer</option>
                      <option className="bg-[#181824] text-white" value="RTGS">RTGS Transfer</option>
                      <option className="bg-[#181824] text-white" value="Cheque">Cheque Book</option>
                      <option className="bg-[#181824] text-white" value="IMPS">IMPS Bank Transfer</option>
                      <option className="bg-[#181824] text-white" value="Other">Other Wallet/Bank</option>
                    </select>
                  </div>
                </div>

                {/* Admin Note */}
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Admin Notes / Comments</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full bg-white/[0.03] border border-glass-border focus:border-purple-500 rounded-xl py-2 px-3 text-sm text-white focus:outline-none resize-none"
                    placeholder="e.g. Processed via HDFC NetBanking."
                    rows={2}
                    disabled={submittingPayout}
                  />
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                    Receipt Receipts / Proof of Payment <span className="text-text-muted font-normal">(max 3 images, 2MB each)</span>
                  </label>

                  <label className={`flex flex-col items-center gap-1.5 p-3.5 border border-dashed rounded-xl cursor-pointer transition-all ${
                    payoutFiles.length >= 3 ? 'opacity-40 pointer-events-none border-glass-border' : 'border-glass-border hover:border-purple-500/50 hover:bg-purple-500/5'
                  }`}>
                    <Upload className="w-4 h-4 text-text-muted" />
                    <span className="text-[11px] text-text-muted text-center">Click to upload receipt image</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      disabled={submittingPayout || payoutFiles.length >= 3}
                      onChange={e => handleFiles(e.target.files)}
                    />
                  </label>

                  {/* List */}
                  {payoutFiles.length > 0 && (
                    <ul className="space-y-1.5">
                      {payoutFiles.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-glass-border text-xs text-white">
                          <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="truncate flex-1">{f.name}</span>
                          <span className="text-text-muted shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                          <button type="button" onClick={() => removeFile(i)} className="p-0.5 rounded hover:text-red-400 cursor-pointer" disabled={submittingPayout}>
                            <X className="w-3 h-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {fileError && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fileError}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingCommissionId(null)}
                  disabled={submittingPayout}
                  className="flex-1 py-2 rounded-xl border border-glass-border text-text-muted hover:text-white hover:bg-white/5 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayout}
                  disabled={!txnReference.trim() || submittingPayout}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs rounded-xl hover:opacity-90 shadow-lg cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submittingPayout ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{submittingPayout ? 'Uploading & Disbursing...' : 'Disburse & Confirm'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { usePortalStore } from '@/lib/store';
import { Search, Filter, ChevronLeft, ChevronRight, Download, SlidersHorizontal, Building, Plus, X, MapPin, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomersPage() {
  const { saathis, currentSaathiId } = usePortalStore();
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/Filters states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Add Customer Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [leadSource, setLeadSource] = useState('Referral');
  const [product, setProduct] = useState('ANSH Tasks');
  const [users, setUsers] = useState<number | string>('');
  const [mrr, setMrr] = useState<number | string>('');
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [joinedDate, setJoinedDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const leadSourceOptions = ['Referral', 'Cold Call', 'LinkedIn', 'Advertisement', 'Organic Search', 'Other'];

  // Product pricing helper
  const getProductPrice = (prodName: string) => {
    switch (prodName) {
      case 'ANSH Tasks': return 299;
      case 'ANSH HR': return 199;
      case 'ANSH Expense': return 199;
      case 'ANSH Forms': return 399;
      case 'ANSH Links': return 99;
      case 'ANSH Visitor': return 199;
      default: return 0;
    }
  };

  // Auto-calculate Contract MRR based on selected product and user count
  useEffect(() => {
    if (product && users !== '') {
      const price = getProductPrice(product);
      setMrr(price * Number(users));
    } else {
      setMrr('');
    }
  }, [product, users]);

  // Fetch Customers on Mount
  const fetchCustomers = async () => {
    if (!currentSaathiId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/customers?saathiId=${currentSaathiId}`);
      if (res.ok) {
        const data = await res.json();
        setCustomersList(data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Company Name',
      'Address',
      'Lead Source',
      'Product',
      'Users',
      'Contract MRR (INR)',
      'Status',
      'Joined Date',
      'Commission Rate (%)',
      'Monthly Commission Share (INR)'
    ];

    const rows = filteredCustomers.map(c => [
      c.companyName,
      c.companyAddress || '--',
      c.leadSource || '--',
      c.product,
      c.users,
      c.mrr,
      c.status,
      c.joinedDate,
      c.commissionRate,
      (c.mrr * c.commissionRate) / 100
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
    link.setAttribute('download', `my_referred_clients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentSaathiId]);

  // Reset form to blank empty values (not pre-filled)
  const resetForm = () => {
    setCompanyName('');
    setCompanyAddress('');
    setLeadSource('Referral');
    setProduct('ANSH Tasks');
    setUsers('');
    setMrr('');
    setStatus('pending');
    setJoinedDate('');
    setError('');
  };

  // Helper to determine commission rate based on saathi order and date
  const calculateCommissionRate = (joinedDateStr: string) => {
    if (!joinedDateStr) return 25; // Default standard rate

    // Sort saathis by joinedDate to find order
    const sortedSaathis = [...saathis].sort(
      (a, b) => new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime()
    );
    const saathiIndex = sortedSaathis.findIndex(s => s.id === currentSaathiId);

    // If Saathi is in the first 30 (index 0 to 29)
    if (saathiIndex !== -1 && saathiIndex < 30) {
      const date = new Date(joinedDateStr);
      const promoStart = new Date('2026-07-14');
      const promoEnd = new Date('2027-07-14');
      if (date >= promoStart && date <= promoEnd) {
        return 40; // 40% rate
      }
    }
    return 25; // 25% standard rate
  };

  const commissionRate = useMemo(() => {
    return calculateCommissionRate(joinedDate);
  }, [joinedDate, saathis, currentSaathiId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!companyName.trim()) {
      setError('Please enter a valid company name.');
      return;
    }
    if (!joinedDate) {
      setError('Please specify a joined date.');
      return;
    }
    if (users === '' || Number(users) < 1) {
      setError('Number of users must be at least 1.');
      return;
    }
    if (mrr === '' || Number(mrr) < 0) {
      setError('Contract MRR must be a positive number.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          companyAddress: companyAddress.trim(),
          leadSource,
          product,
          users: Number(users) || 1,
          mrr: Number(mrr) || 0,
          status,
          joinedDate,
          commissionRate,
          saathiId: currentSaathiId
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit client');
      }

      // Refresh list, reset, and close modal
      resetForm();
      setIsModalOpen(false);
      setCurrentPage(1);
      fetchCustomers();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // Static list of all available products for filter dropdown
  const uniqueProducts = ['all', 'ANSH Tasks', 'ANSH HR', 'ANSH Expense', 'ANSH Visitor', 'ANSH Forms', 'ANSH Links'];

  // Filter and Search logic
  const filteredCustomers = useMemo(() => {
    return customersList.filter(c => {
      const nameMatch = c.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
      const productMatch = c.product?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || productMatch;
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesProduct = productFilter === 'all' || c.product === productFilter;
      return matchesSearch && matchesStatus && matchesProduct;
    });
  }, [customersList, searchTerm, statusFilter, productFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
            View all clients referred by you to the ANSH ecosystem, their active product modules, MRR, and referral approval status.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-md text-sm font-semibold text-white transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client</span>
          </button>
          
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-glass-border hover:bg-white/5 text-sm font-semibold text-white transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-text-muted" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
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

        {/* Filters Group */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
          <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold tracking-wider uppercase">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Product Filter */}
          <select
            value={productFilter}
            onChange={(e) => { setProductFilter(e.target.value); setCurrentPage(1); }}
            className="bg-bg-accent/80 border border-glass-border text-white text-xs rounded-xl py-2 pl-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:0.8rem_0.8rem] bg-[position:right_0.5rem_center] focus:outline-none focus:border-primary transition-all cursor-pointer min-w-[125px]"
          >
            <option value="all" className="bg-[#0b091a] text-white">All Products</option>
            {uniqueProducts.filter(p => p !== 'all').map(prod => (
              <option key={prod} value={prod} className="bg-[#0b091a] text-white">{prod}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-bg-accent/80 border border-glass-border text-white text-xs rounded-xl py-2 pl-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:0.8rem_0.8rem] bg-[position:right_0.5rem_center] focus:outline-none focus:border-primary transition-all cursor-pointer min-w-[125px]"
          >
            <option value="all" className="bg-[#0b091a] text-white">All Statuses</option>
            <option value="approved" className="bg-[#0b091a] text-white">Approved</option>
            <option value="pending" className="bg-[#0b091a] text-white">Pending</option>
            <option value="rejected" className="bg-[#0b091a] text-white">Rejected</option>
          </select>
        </div>
      </div>

      {/* Customers Table Card */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xl border border-glass-border">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <div className="w-8 h-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
            <span className="text-xs text-text-muted">Loading clients directory...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-glass-border bg-bg-accent/40 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Company Name</th>
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6 text-center">Users</th>
                  <th className="py-4 px-6 text-right">MRR</th>
                  <th className="py-4 px-6 text-center">Approval</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-center">Commission %</th>
                  <th className="py-4 px-6 text-right">Monthly Comm.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((c) => {
                    const monthlyComm = (c.mrr * c.commissionRate) / 100;
                    return (
                      <tr key={c.id} className="hover:bg-white/[0.01] transition-colors text-sm text-white">
                        {/* Company */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-bright shrink-0">
                              <Building className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold">{c.companyName}</span>
                              {c.companyAddress && (
                                <span className="text-[10px] text-text-muted flex items-center gap-0.5 mt-0.5">
                                  <MapPin className="w-2.5 h-2.5 shrink-0 text-text-muted/60" />
                                  {c.companyAddress}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Product */}
                        <td className="py-4 px-6">
                          <span className="font-medium px-2.5 py-1 rounded-md bg-purple-950/40 text-purple-300 border border-purple-900/30 text-xs">
                            {c.product}
                          </span>
                        </td>
                        {/* Users */}
                        <td className="py-4 px-6 text-center font-medium">
                          {c.users}
                        </td>
                        {/* MRR */}
                        <td className="py-4 px-6 text-right font-mono font-bold text-white">
                          {formatCurrency(c.mrr)}
                        </td>
                        {/* Status */}
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadgeClass(c.status)}`}>
                            {c.status}
                          </span>
                        </td>
                        {/* Joined Date */}
                        <td className="py-4 px-6 text-text-muted">
                          {new Date(c.joinedDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        {/* Commission % */}
                        <td className="py-4 px-6 text-center font-bold text-primary-bright font-mono">
                          {c.commissionRate}%
                        </td>
                        {/* Monthly Commission */}
                        <td className={`py-4 px-6 text-right font-mono ${c.status === 'approved' ? 'font-extrabold text-emerald-400' : 'text-text-muted/40'}`}>
                          {c.status === 'approved' ? formatCurrency(monthlyComm) : 'Waiting'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-text-muted">
                      No referred customers match your search/filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer / Pagination */}
        {!loading && totalPages > 1 && (
          <div className="py-4 px-6 border-t border-glass-border flex items-center justify-between bg-bg-accent/10">
            <span className="text-xs text-text-muted">
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredCustomers.length} total results)
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

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-bg-accent border border-glass-border p-6 rounded-2xl max-w-lg w-full relative z-10 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-glass-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-bright">
                    <Building className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-outfit text-white">Add New Client</h3>
                    <p className="text-[11px] text-text-muted">Register a company referred to ANSH apps.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg border border-glass-border hover:bg-white/5 text-text-muted hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                    {error}
                  </div>
                )}

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    className="w-full bg-white/[0.02] border border-glass-border focus:border-primary rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-text-muted focus:outline-none transition-all"
                  />
                </div>

                {/* Company Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Company Address</label>
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="e.g. Sector-62, Noida, UP"
                    className="w-full bg-white/[0.02] border border-glass-border focus:border-primary rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-text-muted focus:outline-none transition-all"
                  />
                </div>

                {/* Lead Source */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Lead Source</label>
                  <select
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value)}
                    className="w-full bg-bg-accent/80 border border-glass-border text-white text-xs rounded-xl py-2.5 px-3.5 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:1rem_1rem] bg-[position:right_0.75rem_center] focus:outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    {leadSourceOptions.map(opt => (
                      <option key={opt} value={opt} className="bg-[#0b091a] text-white">{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Product Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Product Module</label>
                  <select
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full bg-bg-accent/80 border border-glass-border text-white text-xs rounded-xl py-2.5 px-3.5 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:1rem_1rem] bg-[position:right_0.75rem_center] focus:outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="ANSH Tasks" className="bg-[#0b091a] text-white">ANSH Tasks - ₹299/-</option>
                    <option value="ANSH HR" className="bg-[#0b091a] text-white">ANSH HR - ₹199/-</option>
                    <option value="ANSH Expense" className="bg-[#0b091a] text-white">ANSH Expense - ₹199/-</option>
                    <option value="ANSH Visitor" className="bg-[#0b091a] text-white">ANSH Visitor - ₹199/-</option>
                    <option value="ANSH Forms" className="bg-[#0b091a] text-white">ANSH Forms - ₹399/-</option>
                    <option value="ANSH Links" className="bg-[#0b091a] text-white">ANSH Links - ₹99/-</option>
                  </select>
                </div>

                {/* Users Count & MRR Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Number of Users</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={users}
                      onChange={(e) => setUsers(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 5"
                      className="w-full bg-white/[0.02] border border-glass-border focus:border-primary rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition-all font-mono"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Contract MRR (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={mrr}
                      onChange={(e) => setMrr(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 5000"
                      className="w-full bg-white/[0.02] border border-glass-border focus:border-primary rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Joined Date, Lead Status & Commission Rate Row */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Joined Date</label>
                      <input
                        type="date"
                        required
                        value={joinedDate}
                        onChange={(e) => setJoinedDate(e.target.value)}
                        className="w-full bg-white/[0.02] border border-glass-border focus:border-primary rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Approval Status</label>
                      <input
                        type="text"
                        disabled
                        value="Pending Admin Approval"
                        className="w-full bg-white/[0.01] border border-glass-border rounded-xl py-2.5 px-3.5 text-xs text-amber-400 font-semibold focus:outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                    <div className="flex-1 pr-2">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Applicable Commission Rate</span>
                      <p className="text-[11px] text-white/90 mt-0.5 leading-snug">
                        {commissionRate === 40 
                          ? '🎉 Early Partner Promo Active (First 30 Saathis, July 14, 2026 - July 14, 2027)' 
                          : 'Standard Commission Tier'}
                      </p>
                    </div>
                    <span className="text-2xl font-black font-mono text-primary-bright shrink-0 bg-primary/20 px-3 py-1 rounded-lg border border-primary/30">
                      {commissionRate}%
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-glass-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-glass-border hover:bg-white/5 text-xs font-semibold text-text-muted hover:text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-xs shadow-lg hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Client'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

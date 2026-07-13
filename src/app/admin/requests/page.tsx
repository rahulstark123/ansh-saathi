'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, CheckCircle2, XCircle, Search, Eye,
  SlidersHorizontal, Paperclip, X, Check, MessageSquare, Loader2
} from 'lucide-react';

interface ChangeRequest {
  id: string;
  subject: string;
  description: string;
  attachments: string[];
  status: 'pending' | 'approved' | 'rejected';
  adminNote: string | null;
  date: string;
  createdAt: string;
  saathi: {
    name: string;
    email: string;
    partnerCode: string | null;
  };
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approved' | 'rejected' | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/change-requests');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filtered = requests.filter(r => {
    const matchesSearch =
      r.saathi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.saathi.partnerCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/change-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedRequest.id, status, adminNote: adminNote.trim() || null })
      });
      if (!res.ok) throw new Error('Failed to update');
      await fetchRequests();
      setSelectedRequest(null);
      setAdminNote('');
      setConfirmAction(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><CheckCircle2 className="w-3 h-3" />Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-red-500/10 text-red-400 border-red-500/20"><XCircle className="w-3 h-3" />Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-amber-500/10 text-amber-400 border-amber-500/20"><Clock className="w-3 h-3" />Pending</span>;
    }
  };

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <p className="text-sm text-text-muted">
          Review and process profile modification requests submitted by Saathi partners.
        </p>
      </div>

      {/* Summary Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: 'all', label: 'All Requests', color: 'border-white/10 text-white' },
          { key: 'pending', label: 'Pending', color: 'border-amber-500/20 text-amber-400' },
          { key: 'approved', label: 'Approved', color: 'border-emerald-500/20 text-emerald-400' },
          { key: 'rejected', label: 'Rejected', color: 'border-red-500/20 text-red-400' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`glass-card p-4 rounded-xl border text-left cursor-pointer transition-all ${tab.color} ${statusFilter === tab.key ? 'ring-2 ring-purple-500/30' : 'hover:bg-white/[0.03]'}`}
          >
            <p className="text-2xl font-bold font-outfit">{counts[tab.key as keyof typeof counts]}</p>
            <p className="text-xs text-text-muted mt-0.5">{tab.label}</p>
          </button>
        ))}
      </div>

      {/* Filter Row */}
      <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search partner name, code or subject..."
            className="w-full bg-white/[0.03] border border-glass-border focus:border-purple-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-text-muted focus:outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 items-center w-full md:w-auto justify-end">
          <SlidersHorizontal className="w-4 h-4 text-text-muted shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-bg-accent/80 border border-glass-border text-white text-xs rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 transition-all"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-glass-border shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-text-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading requests...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-text-muted text-sm">No modification requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-glass-border bg-bg-accent/40 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Partner</th>
                  <th className="py-4 px-6">Subject</th>
                  <th className="py-4 px-6 text-center">Attachments</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border text-sm text-white">
                {filtered.map(req => (
                  <tr key={req.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6 text-text-muted text-xs">
                      {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold">{req.saathi.name}</p>
                      <p className="text-[10px] font-mono text-purple-400 mt-0.5">{req.saathi.partnerCode || 'PENDING'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm">{req.subject}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {req.attachments.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-primary-bright">
                          <Paperclip className="w-3 h-3" /> {req.attachments.length}
                        </span>
                      ) : (
                        <span className="text-text-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">{getStatusBadge(req.status)}</td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => { setSelectedRequest(req); setAdminNote(req.adminNote || ''); setConfirmAction(null); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold hover:bg-purple-500/20 transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => !actionLoading && setSelectedRequest(null)} />
            <motion.div
              className="relative bg-bg-dark border border-glass-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-glass-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-outfit text-white">Modification Request</h2>
                    <p className="text-xs text-text-muted">{selectedRequest.saathi.name} · {selectedRequest.saathi.partnerCode}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="p-2 rounded-lg hover:bg-white/5 text-text-muted cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-sm text-white font-medium">{selectedRequest.subject}</p>
                </div>

                <div>
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed bg-white/[0.02] border border-glass-border rounded-xl p-3">{selectedRequest.description}</p>
                </div>

                {selectedRequest.attachments.length > 0 && (
                  <div>
                    <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">Attachments ({selectedRequest.attachments.length})</p>
                    <ul className="space-y-2">
                      {selectedRequest.attachments.map((url, i) => (
                        <li key={i}>
                          <a href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-glass-border text-xs text-primary-bright hover:bg-white/[0.06] transition-all"
                          >
                            <Paperclip className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Attachment {i + 1}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1.5">Admin Note (optional)</p>
                  <textarea
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    rows={3}
                    placeholder="Add a note for the partner explaining the decision..."
                    className="w-full bg-white/[0.03] border border-glass-border focus:border-purple-500 rounded-xl py-2.5 px-4 text-sm text-white placeholder-text-muted focus:outline-none resize-none transition-all"
                  />
                </div>

                <div className="pt-1">
                  {selectedRequest.status === 'pending' ? (
                    confirmAction ? (
                      <div className="space-y-3">
                        <p className="text-sm text-center text-white font-medium">
                          Confirm {confirmAction === 'approved' ? '✅ Approval' : '❌ Rejection'}?
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setConfirmAction(null)}
                            className="flex-1 py-2.5 rounded-xl border border-glass-border text-text-muted hover:text-white hover:bg-white/5 text-sm font-medium cursor-pointer transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAction(confirmAction)}
                            disabled={actionLoading}
                            className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                              confirmAction === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                            } disabled:opacity-50`}
                          >
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmAction === 'approved' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            Confirm {confirmAction === 'approved' ? 'Approve' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setConfirmAction('rejected')}
                          className="flex-1 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/20 cursor-pointer transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                        <button
                          onClick={() => setConfirmAction('approved')}
                          className="flex-1 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 cursor-pointer transition-all flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="text-center">
                      {getStatusBadge(selectedRequest.status)}
                      {selectedRequest.adminNote && (
                        <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-glass-border text-xs text-white/70 flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-text-muted" />
                          <span>{selectedRequest.adminNote}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

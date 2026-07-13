'use client';

import React, { useState, useMemo } from 'react';
import { usePortalStore, SupportTicket } from '@/lib/store';
import { Check, CheckCircle2, Clock, MessageSquare, Send, X, AlertTriangle, ShieldCheck, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminTicketsPage() {
  const { tickets, saathis, replyToTicket, resolveTicket } = usePortalStore();

  // States
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Map partner name to each ticket
  const ticketsWithPartner = useMemo(() => {
    return tickets.map(t => {
      const saathi = saathis.find(s => s.id === t.saathiId);
      return {
        ...t,
        saathiName: saathi?.name || 'Unknown Partner',
        saathiCode: saathi?.partnerCode || 'PENDING'
      };
    });
  }, [tickets, saathis]);

  // Filter logic
  const filteredTickets = useMemo(() => {
    return ticketsWithPartner.filter(t => {
      return statusFilter === 'all' || t.status === statusFilter;
    });
  }, [ticketsWithPartner, statusFilter]);

  const activeTicket = useMemo(() => {
    return ticketsWithPartner.find(t => t.id === activeTicketId);
  }, [ticketsWithPartner, activeTicketId]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketId || !replyText) return;

    replyToTicket(activeTicketId, replyText, 'admin');
    setReplyText('');
  };

  const handleResolve = () => {
    if (!activeTicketId) return;
    resolveTicket(activeTicketId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>Resolved</span>
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-2.5 h-2.5 animate-pulse" />
            <span>In Progress</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-2.5 h-2.5" />
            <span>Open</span>
          </span>
        );
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl space-y-6 animate-in fade-in duration-500">
      
      {/* Console Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-glass-border pb-4 gap-4">
        <div>
          <h3 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-purple-400" />
            <span>Support Tickets Resolver Desk</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">Respond to partner support inquiries and handle billing disputes.</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-bg-accent/80 border border-glass-border text-white text-xs rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 transition-all"
        >
          <option value="all">All Ticket Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Dual Panel Console */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[450px]">
        
        {/* Left Side: Ticket List */}
        <div className="md:col-span-1 border-r border-glass-border/40 pr-2 space-y-2 max-h-[450px] overflow-y-auto">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveTicketId(t.id); setReplyText(''); }}
                className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  activeTicketId === t.id
                    ? 'bg-purple-950/20 border-purple-500/40 text-white'
                    : 'border-glass-border bg-bg-accent/20 text-text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] text-purple-400 font-mono tracking-wide uppercase font-semibold">
                    {t.category}
                  </span>
                  {getStatusBadge(t.status)}
                </div>
                
                <h4 className="text-xs font-bold text-white leading-tight mt-1.5 truncate">
                  {t.subject}
                </h4>
                
                <div className="flex items-center justify-between mt-3 text-[10px] text-text-muted">
                  <span className="font-semibold">{t.saathiName}</span>
                  <span className="font-mono">{t.date}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-text-muted">
              No tickets matches status filter.
            </div>
          )}
        </div>

        {/* Right Side: Conversation stream */}
        <div className="md:col-span-2 flex flex-col justify-between h-[450px] pl-2">
          {activeTicket ? (
            <>
              {/* Header inside conversational screen */}
              <div className="flex justify-between items-center border-b border-glass-border/30 pb-3 shrink-0">
                <div>
                  <h4 className="text-sm font-bold text-white">{activeTicket.subject}</h4>
                  <p className="text-[10px] text-text-muted">
                    Raised by <strong className="text-white">{activeTicket.saathiName} ({activeTicket.saathiCode})</strong>
                  </p>
                </div>

                {activeTicket.status !== 'resolved' && (
                  <button
                    onClick={handleResolve}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-400 text-xs font-semibold cursor-pointer transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Close & Resolve Ticket</span>
                  </button>
                )}
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
                {/* Original Ticket Description */}
                <div className="bg-white/[0.02] border border-glass-border p-4 rounded-xl">
                  <div className="flex justify-between items-center text-[10px] text-text-muted font-mono mb-2">
                    <span className="font-bold uppercase tracking-wider text-purple-400">
                      Original Query
                    </span>
                    <span>{activeTicket.date}</span>
                  </div>
                  <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                    {activeTicket.message}
                  </p>
                </div>

                {/* Thread replies */}
                {activeTicket.replies.map((rep) => (
                  <div
                    key={rep.id}
                    className={`p-3 rounded-2xl max-w-[85%] border leading-relaxed text-xs ${
                      rep.sender === 'admin'
                        ? 'bg-purple-950/20 border-purple-500/20 text-white ml-auto'
                        : 'bg-white/[0.01] border-glass-border text-text-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1 text-[9px] font-bold text-text-muted uppercase">
                      <span>{rep.sender === 'admin' ? 'You (ANSH Operations)' : activeTicket.saathiName}</span>
                      <span className="font-mono">{rep.date}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{rep.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              {activeTicket.status !== 'resolved' ? (
                <form onSubmit={handleSendReply} className="flex gap-2 pt-3 border-t border-glass-border/30 shrink-0">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type operations response to partner..."
                    className="flex-1 bg-white/[0.03] border border-glass-border focus:border-purple-500 rounded-xl py-2 px-3.5 text-xs text-white placeholder-text-muted focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="py-2 text-center text-xs text-emerald-400 bg-emerald-500/5 border-t border-glass-border/30 shrink-0 rounded-xl font-medium">
                  This issue was closed and marked resolved.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-text-muted gap-2">
              <MessageSquare className="w-8 h-8 text-glass-border" />
              <p className="text-xs">Select a support ticket from the list to respond to a partner or change state.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

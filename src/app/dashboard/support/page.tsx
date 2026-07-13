'use client';

import React, { useState, useMemo } from 'react';
import { usePortalStore } from '@/lib/store';
import { HelpCircle, ChevronDown, ChevronUp, PlusCircle, MessageSquare, Send, Clock, CheckCircle2, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupportPage() {
  const { tickets, currentSaathiId, raiseTicket, replyToTicket } = usePortalStore();

  // FAQs Data
  const faqs = [
    {
      q: 'How does the commission structure work?',
      a: 'Partners earn a recurring 15% to 20% commission on the Monthly Recurring Revenue (MRR) of every active referral. The exact commission percentage is determined based on the total active users introduced. Founding partners start at a flat 15% tier across all products (ANSH ERP, ANSH HR, CRM, Tasks, Leaves).'
    },
    {
      q: 'When are commissions calculated and disbursed?',
      a: 'Commission logs are generated on the 1st of every month based on active customer subscriptions. Payouts are verified by the admin team and directly disbursed to your registered bank account on the 5th of every month.'
    },
    {
      q: 'What products are included in the referral system?',
      a: 'All major modules of the ANSH suite are eligible for commission earnings: ANSH ERP (GST invoicing, inventory), ANSH HR (biometric sync, payroll, leaves), ANSH CRM (leads pipeline, business cards scan), and ANSH Tasks.'
    },
    {
      q: 'Is there a limit to how many companies I can refer?',
      a: 'No, there are no limits. You can refer as many clients as you want. In fact, referring more active customers elevates your tier percentage up to 20% recurring monthly commissions.'
    }
  ];

  // States
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Commissions & Payouts');
  const [message, setMessage] = useState('');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Success states
  const [submittedMessage, setSubmittedMessage] = useState(false);

  // Filter tickets for current Saathi
  const myTickets = useMemo(() => {
    return tickets.filter(t => t.saathiId === currentSaathiId);
  }, [tickets, currentSaathiId]);

  const activeTicket = useMemo(() => {
    return myTickets.find(t => t.id === activeTicketId);
  }, [myTickets, activeTicketId]);

  const handleRaiseTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    raiseTicket(currentSaathiId, subject, category, message);
    
    // Reset Form
    setSubject('');
    setMessage('');
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 3000);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketId || !replyText) return;

    replyToTicket(activeTicketId, replyText, 'saathi');
    setReplyText('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Resolved</span>
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
            <Clock className="w-3 h-3" />
            <span>In Progress</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>Open</span>
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      
      {/* Left Columns (Col Span 2): FAQs and Ticketing */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* FAQs Accordion */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold font-outfit text-white">Frequently Asked Questions</h3>
          <div className="divide-y divide-glass-border">
            {faqs.map((faq, i) => (
              <div key={i} className="py-4 first:pt-0 last:pb-0">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full flex items-center justify-between text-left text-sm font-semibold text-white hover:text-primary-bright transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === i ? (
                    <ChevronUp className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaqIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs text-text-muted leading-relaxed mt-2.5 pl-1.5 border-l border-primary/30">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Support Tickets Console */}
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-glass-border pb-4">
            <h3 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary-bright" />
              <span>Your Support Tickets</span>
            </h3>
            <span className="text-xs text-text-muted">{myTickets.length} active threads</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[350px]">
            {/* Tickets List */}
            <div className="md:col-span-1 border-r border-glass-border/40 pr-2 space-y-2 max-h-[350px] overflow-y-auto">
              {myTickets.length > 0 ? (
                myTickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setActiveTicketId(t.id); setReplyText(''); }}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTicketId === t.id
                        ? 'bg-primary/20 border-primary/40 text-white'
                        : 'border-glass-border bg-bg-accent/20 text-text-muted hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <p className="text-xs font-semibold truncate leading-tight">{t.subject}</p>
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <span className="text-[9px] font-mono text-text-muted/80">{t.date}</span>
                      {getStatusBadge(t.status)}
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-text-muted">
                  No tickets found. Raise a ticket on the right to start.
                </div>
              )}
            </div>

            {/* Active Ticket Details & Replies thread */}
            <div className="md:col-span-2 flex flex-col justify-between h-[350px]">
              {activeTicket ? (
                <>
                  {/* Messages Stream */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
                    {/* Original Message */}
                    <div className="bg-white/[0.02] border border-glass-border p-3.5 rounded-2xl">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider px-2 py-0.5 rounded bg-bg-accent border border-glass-border">
                          {activeTicket.category}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">{activeTicket.date}</span>
                      </div>
                      <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                        {activeTicket.message}
                      </p>
                    </div>

                    {/* Replies */}
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
                          <span>{rep.sender === 'admin' ? 'ANSH Operations' : 'You (Saathi)'}</span>
                          <span className="font-mono">{rep.date}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{rep.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input Form */}
                  {activeTicket.status !== 'resolved' ? (
                    <form onSubmit={handleSendReply} className="flex gap-2 pt-3 border-t border-glass-border/40 shrink-0">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your response..."
                        className="flex-1 bg-white/[0.03] border border-glass-border focus:border-primary rounded-xl py-2 px-3.5 text-xs text-white placeholder-text-muted focus:outline-none transition-all"
                        required
                      />
                      <button
                        type="submit"
                        className="p-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-md transition-all cursor-pointer shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="py-2.5 text-center text-xs text-text-muted border-t border-glass-border/40 shrink-0 bg-emerald-500/5 text-emerald-400 rounded-xl font-medium">
                      This ticket is resolved. You cannot send further replies.
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-text-muted gap-2">
                  <MessageSquare className="w-8 h-8 text-glass-border" />
                  <p className="text-xs">Select a support ticket from the list to view replies or send a follow-up.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Support form */}
      <div className="space-y-6">
        
        {/* Support Ticket Submission Card */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-lg font-bold font-outfit text-white">Raise a Support Ticket</h3>
            <p className="text-xs text-text-muted mt-0.5">Need help with commissions, customer issues, or resources?</p>
          </div>

          {submittedMessage && (
            <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400 font-semibold animate-bounce">
              Ticket raised successfully! Track progress in your tickets dashboard.
            </div>
          )}

          <form onSubmit={handleRaiseTicket} className="space-y-4">
            {/* Subject */}
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-semibold tracking-wider uppercase">Ticket Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Missing payout for Vardhman textiles"
                className="w-full bg-white/[0.02] border border-glass-border focus:border-primary rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-text-muted focus:outline-none transition-all"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-semibold tracking-wider uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-bg-accent border border-glass-border focus:border-primary rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition-all"
                required
              >
                <option value="Commissions & Payouts">Commissions & Payouts</option>
                <option value="Client Onboarding">Client Onboarding</option>
                <option value="Marketing Resources">Marketing Resources</option>
                <option value="Technical Queries">Technical Queries</option>
              </select>
            </div>

            {/* Message */}
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-semibold tracking-wider uppercase">Your Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your query in detail..."
                className="w-full h-28 bg-white/[0.02] border border-glass-border focus:border-primary rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-text-muted focus:outline-none transition-all resize-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-xs shadow-lg shadow-primary/20 hover:opacity-90 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Raise Ticket</span>
            </button>
          </form>
        </div>

        {/* Contact Info Card */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white font-outfit uppercase tracking-wider">Direct Channels</h3>
          <div className="space-y-3 text-xs text-text-muted leading-relaxed">
            <div>
              <p className="font-semibold text-white">Partner Operations Desk:</p>
              <p className="font-mono mt-0.5">saathi@anshapps.com</p>
            </div>
            <div>
              <p className="font-semibold text-white">SMS & WhatsApp Hotlines:</p>
              <p className="font-mono mt-0.5">+91 99998 88887</p>
            </div>
            <div className="pt-2 border-t border-glass-border/40 text-[10px]">
              Available Monday to Friday, 9:30 AM to 6:30 PM.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

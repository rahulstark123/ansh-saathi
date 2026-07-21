'use client';

import React, { useState } from 'react';
import { usePortalStore } from '@/lib/store';
import { Download, FileText, Layout, Copy, Check, MessageSquare, Mail, Search, Grid, Info } from 'lucide-react';

export default function ResourcesPage() {
  const { resources } = usePortalStore();
  const [activeTab, setActiveTab] = useState<'downloads' | 'templates'>('downloads');
  const [downloadCategory, setDownloadCategory] = useState<string>('All');

  // Copy feedback states
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  const categories = [
    'All', 
    'Brand Assets', 
    'Brochures & Pricing', 
    'Sales Materials',
    'Drive Folders & Links',
    'Video Tutorials & Demos',
    'Marketing Templates',
    'Training & Onboarding'
  ];

  const filteredResources = resources.filter(res => {
    return downloadCategory === 'All' || res.category === downloadCategory;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'logo':
        return <Layout className="w-5 h-5 text-indigo-400" />;
      case 'kit':
        return <Grid className="w-5 h-5 text-purple-400" />;
      default:
        return <FileText className="w-5 h-5 text-blue-400" />;
    }
  };

  // Outreach swipe templates
  const outreachTemplates = [
    {
      id: 'wa-1',
      title: 'WhatsApp Intro: Pitching ANSH ERP to MSMEs',
      channel: 'whatsapp',
      text: `Hello [Client Name], [Your Name] here. I have been helping growing businesses upgrade their systems lately. I recently partnered with ANSH (anshapps.com), which has built an incredibly simple, mobile-first ERP for growing teams. It covers billing, stock management, production tracking, and purchases in one clean app (no complex accounting setup required). I can schedule a free demo and get you a special founding trial. Let me know if you would like me to set this up!`
    },
    {
      id: 'wa-2',
      title: 'WhatsApp Followup: For ANSH HR (Attendance & Leaves)',
      channel: 'whatsapp',
      text: `Hi [Client Name], hope you are doing well. I noticed you were looking to automate employee attendance/leaves. ANSH HR has a geofenced mobile app where staff clock-in/out easily, which feeds directly into salary calculations. Let me know if I can share their 5-minute product video with you.`
    },
    {
      id: 'email-1',
      title: 'Email: Elevating MSME Efficiency with Unified Software Suite',
      channel: 'email',
      subject: 'Streamlining your business operations with ANSH software',
      text: `Dear [Business Owner Name],

I hope this email finds you well.

As your business grows, keeping track of accounts, inventory, employee attendance, and customer leads across multiple excel sheets can become a bottleneck.

I am writing to introduce you to ANSH (anshapps.com), a next-generation software suite engineered for growing businesses worldwide. Unlike heavy enterprise systems, ANSH offers modular apps that work seamlessly together:
1. ANSH ERP - Invoicing, Stock Management, Purchases
2. ANSH HR - Attendance, Payroll, Leave Management
3. ANSH CRM - Sales Leads & Deal Pipeline

As a registered ANSH Saathi, I would love to offer you a free operational audit and run you through a 15-minute customized product demo. 

Please let me know if you have some availability this week for a brief call.

Best regards,
[Your Name]
ANSH Partner
[Your Phone Number]`
    }
  ];

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplateId(id);
    setTimeout(() => setCopiedTemplateId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page explanation header */}
      <div className="p-4 rounded-xl border border-glass-border bg-bg-accent/40 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary-bright shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted leading-relaxed">
          Use the assets below to run marketing campaigns, present proposals, and explain product benefits. Download official pitch decks, share localized pricing PDFs, or copy pre-made messaging templates to contact leads.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-glass-border">
        <button
          onClick={() => setActiveTab('downloads')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer mr-6 ${
            activeTab === 'downloads' ? 'border-primary text-white' : 'border-transparent text-text-muted hover:text-white'
          }`}
        >
          Partner Toolkit & Collateral
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'templates' ? 'border-primary text-white' : 'border-transparent text-text-muted hover:text-white'
          }`}
        >
          Outreach Copy Templates
        </button>
      </div>

      {activeTab === 'downloads' ? (
        <div className="space-y-6">
          {/* Download Category Buttons */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setDownloadCategory(cat as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  downloadCategory === cat
                    ? 'bg-primary/20 border-primary text-white'
                    : 'border-glass-border bg-bg-accent/30 text-text-muted hover:text-white hover:border-glass-border-hover'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid of collateral cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => (
              <div key={res.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between gap-4 h-48">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary-bright uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {res.category}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">{res.size}</span>
                  </div>
                  
                  <div className="flex gap-2.5 items-start">
                    <div className="w-9 h-9 rounded-lg bg-bg-accent border border-glass-border flex items-center justify-center shrink-0">
                      {getResourceIcon(res.type)}
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                      {res.name}
                    </h4>
                  </div>
                </div>

                <a
                  href={res.downloadUrl}
                  target={res.downloadUrl && res.downloadUrl.startsWith('http') ? '_blank' : undefined}
                  rel={res.downloadUrl && res.downloadUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-glass-border hover:bg-white/5 transition-all text-xs font-semibold text-white cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-text-muted" />
                  <span>{res.downloadUrl && res.downloadUrl.startsWith('http') ? 'Open Link' : 'Download Resource'}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {outreachTemplates.map((template) => (
              <div key={template.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-glass-border/40 pb-3">
                    <h4 className="text-sm font-bold text-white font-outfit flex items-center gap-2">
                      {template.channel === 'whatsapp' ? (
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Mail className="w-4 h-4 text-purple-400" />
                      )}
                      <span>{template.title}</span>
                    </h4>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      template.channel === 'whatsapp' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                    }`}>
                      {template.channel}
                    </span>
                  </div>

                  {template.subject && (
                    <p className="text-xs text-white bg-bg-accent/40 px-3 py-1.5 rounded border border-glass-border font-medium">
                      <span className="text-text-muted font-bold mr-1">Subject:</span> {template.subject}
                    </p>
                  )}

                  <pre className="text-xs text-text-muted whitespace-pre-wrap font-sans bg-bg-accent/30 p-3 rounded-xl border border-glass-border max-h-48 overflow-y-auto leading-relaxed">
                    {template.text}
                  </pre>
                </div>

                <button
                  onClick={() => handleCopyText(template.id, template.text)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-bg-accent hover:bg-white/5 border border-glass-border transition-all text-xs font-semibold text-white cursor-pointer"
                >
                  {copiedTemplateId === template.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-text-muted" />
                  )}
                  <span>{copiedTemplateId === template.id ? 'Copied Template!' : 'Copy Outreach Copy'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

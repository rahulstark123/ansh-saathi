'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePortalStore } from '@/lib/store';
import SaathiSidebar from '@/components/saathi-sidebar';
import DashboardHeader from '@/components/dashboard-header';
import { X, Clock, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function SaathiLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role } = usePortalStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Wait for client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync state & routing
  useEffect(() => {
    if (!isMounted) return;
    if (role === 'guest') {
      router.replace('/login');
    } else if (role === 'admin') {
      router.replace('/admin');
    }
  }, [role, router, isMounted]);

  if (!isMounted || role === 'guest' || role === 'admin') {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent border-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Determine current page title
  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Saathi Dashboard';
      case '/dashboard/customers':
        return 'My Customers';
      case '/dashboard/renewals':
        return 'Upcoming Renewals';
      case '/dashboard/commissions':
        return 'My Commissions';
      case '/dashboard/resources':
        return 'Partner Resources & Toolkit';
      case '/dashboard/profile':
        return 'Profile & Payout Settings';
      case '/dashboard/support':
        return 'Partner Help & Support';
      default:
        return 'Saathi Portal';
    }
  };

  // If pending, we restrict access to core screens, showing an onboarding portal
  const isRestrictedPage = pathname === '/dashboard' || pathname === '/dashboard/customers' || pathname === '/dashboard/renewals' || pathname === '/dashboard/commissions';
  const showPendingOverlay = false;

  return (
    <div className="min-h-screen bg-bg-dark text-white flex">
      {/* Desktop Sidebar (Left-locked) */}
      <div className="hidden md:block w-64 flex-shrink-0 h-screen sticky top-0">
        <SaathiSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay */}
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          ></div>

          {/* Sidebar content container */}
          <div className="relative w-64 bg-bg-dark h-full flex flex-col">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-lg border border-glass-border hover:bg-white/5 text-white cursor-pointer z-50"
            >
              <X className="w-4 h-4" />
            </button>
            <SaathiSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader
          title={getPageTitle()}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          isAdmin={false}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {showPendingOverlay ? (
            <div className="py-12 flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2 shadow-lg shadow-amber-500/5 animate-pulse">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight font-outfit text-white">
                  Application Under Review
                </h2>
                <p className="text-text-muted text-base leading-relaxed">
                  Thank you for applying to be an ANSH Saathi! Our operations team is currently reviewing your profile. Once approved, you will receive an active partner code and full access to your referral portal.
                </p>
              </div>

              <div className="glass-card w-full p-6 rounded-2xl text-left border-amber-500/10 bg-amber-500/[0.02]">
                <h3 className="text-sm font-bold text-white font-outfit uppercase tracking-wider mb-4">
                  What happens next?
                </h3>
                <ul className="space-y-3 text-sm text-text-muted">
                  <li className="flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Review</strong>: We verify your profile and LinkedIn link within 24 hours.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Code Assignment</strong>: An admin will assign you a custom code like <code className="text-purple-300 font-mono">SAATHIXXX</code>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Ready to Go</strong>: You can check back here or use the Support page to write to us if you have questions.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => router.push('/dashboard/profile')}
                  className="px-6 py-2.5 rounded-xl border border-glass-border hover:bg-white/5 font-semibold transition-all cursor-pointer text-sm"
                >
                  Verify Profile Settings
                </button>
                <button
                  onClick={() => router.push('/dashboard/support')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 shadow-lg shadow-primary/10 transition-all cursor-pointer text-sm"
                >
                  Write to Support
                </button>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

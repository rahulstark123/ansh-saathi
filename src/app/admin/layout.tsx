'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalStore } from '@/lib/store';
import AdminSidebar from '@/components/admin-sidebar';
import DashboardHeader from '@/components/dashboard-header';
import { X, ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { role, saathis, currentSaathiId } = usePortalStore();
  const currentSaathi = saathis.find(s => s.id === currentSaathiId);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Wait for client-side hydration before evaluating auth state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAuthorized = role === 'admin' || currentSaathi?.companyRole === 'Owner';

  // Sync state & routing
  useEffect(() => {
    if (!isMounted) return;
    if (role === 'guest') {
      router.replace('/login');
    } else if (!isAuthorized && (role === 'saathi' || role === 'saathi-pending')) {
      router.replace('/dashboard');
    }
  }, [role, isAuthorized, router, isMounted]);

  // Show a neutral loading spinner during hydration to prevent Access Denied flash
  if (!isMounted || role === 'guest') {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent border-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center text-white p-6">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
          <h2 className="text-xl font-bold font-outfit">Admin Access Denied</h2>
          <p className="text-sm text-text-muted">
            You do not have administrative privileges. Only Portal Admins and company Owners can access this section.
          </p>
        </div>
      </div>
    );
  }

  // Determine current page title
  const getPageTitle = () => {
    return 'ANSH Partner Control Center';
  };

  return (
    <div className="min-h-screen bg-bg-dark text-white flex">
      {/* Desktop Sidebar (Left-locked) */}
      <div className="hidden md:block w-64 flex-shrink-0 h-screen sticky top-0">
        <AdminSidebar />
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
            <AdminSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader 
          title={getPageTitle()} 
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          isAdmin={true}
        />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

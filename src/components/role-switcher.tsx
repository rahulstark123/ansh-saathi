'use client';

import React, { useState } from 'react';
import { usePortalStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Shield, Clock, LogOut, Settings } from 'lucide-react';

export default function RoleSwitcher() {
  const { role, setRole, saathis, currentSaathiId } = usePortalStore();
  const currentSaathi = saathis.find(s => s.id === currentSaathiId);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Never show on landing page or login page
  if (pathname === '/' || pathname === '/login') {
    return null;
  }

  // Show demo role control panel only for users with "Owner" role or admin
  if (role !== 'admin' && currentSaathi?.companyRole !== 'Owner') {
    return null;
  }

  const handleRoleChange = async (newRole: 'guest' | 'saathi-pending' | 'saathi' | 'admin') => {
    setIsOpen(false);
 
    if (newRole === 'guest') {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out:', err);
      }
      setRole('guest');
      router.push('/login');
    } else {
      setRole(newRole);
      if (newRole === 'admin') {
        router.push('/admin');
      } else {
        // both 'saathi' and 'saathi-pending' go to /dashboard, layout will handle rendering differences
        router.push('/dashboard');
      }
    }
  };

  const getRoleIcon = (r: typeof role) => {
    switch (r) {
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'saathi-pending':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'saathi':
        return <User className="w-4 h-4 text-emerald-400" />;
      default:
        return <LogOut className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRoleLabel = (r: typeof role) => {
    switch (r) {
      case 'admin':
        return 'Admin';
      case 'saathi-pending':
        return 'Saathi (Pending)';
      case 'saathi':
        return 'Saathi';
      default:
        return 'Logged Out';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="mb-2 w-56 rounded-xl border border-glass-border bg-bg-accent/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-3 py-1.5 text-xs font-semibold text-text-muted border-b border-glass-border mb-1">
            Portal Navigation
          </div>
          <button
            onClick={() => handleRoleChange('saathi')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
              role === 'saathi' ? 'bg-primary/20 text-white font-medium' : 'text-text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>Saathi Portal</span>
          </button>

          <button
            onClick={() => handleRoleChange('admin')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
              role === 'admin' ? 'bg-primary/20 text-white font-medium' : 'text-text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Admin Portal</span>
          </button>

          <button
            onClick={() => handleRoleChange('guest')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
              role === 'guest' ? 'bg-primary/20 text-white font-medium' : 'text-text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Logout</span>
          </button>
        </div>
      ) : null}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-glass-border bg-bg-accent/90 hover:bg-bg-accent text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer backdrop-blur-md"
      >
        <Settings className={`w-4 h-4 text-primary-bright ${isOpen ? 'animate-spin' : ''}`} />
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide">
          {getRoleIcon(role)}
          <span>{getRoleLabel(role)}</span>
        </div>
      </button>
    </div>
  );
}

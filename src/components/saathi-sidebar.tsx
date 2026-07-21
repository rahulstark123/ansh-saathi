'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePortalStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  Users, 
  IndianRupee, 
  BookOpen, 
  User, 
  HelpCircle, 
  LogOut,
  MapPin,
  Trophy,
  RefreshCw
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function SaathiSidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setRole, saathis, currentSaathiId } = usePortalStore();
  
  const currentSaathi = saathis.find(s => s.id === currentSaathiId);

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Renewals', href: '/dashboard/renewals', icon: RefreshCw },
    { name: 'Commissions', href: '/dashboard/commissions', icon: IndianRupee },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
    { name: 'Resources', href: '/dashboard/resources', icon: BookOpen },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Support', href: '/dashboard/support', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
    setRole('guest');
    router.push('/login');
    if (onCloseMobile) onCloseMobile();
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-full glass-sidebar flex flex-col text-white">
      {/* Brand Header */}
      <div className="p-6 border-b border-glass-border flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <img src="/logoAnshapps.png" alt="ANSH logo" className="h-9 object-contain" />
          <span className="text-primary-bright font-bold text-xs font-outfit uppercase tracking-wider mt-0.5 whitespace-nowrap">ANSH SAATHI</span>
        </div>
        <p className="text-[10px] text-text-muted mt-2.5 tracking-wide font-sans uppercase">
          Saathi Ecosystem
        </p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                active 
                  ? 'bg-gradient-to-r from-primary/25 to-secondary/15 text-white border border-primary/20 shadow-[0_4px_12px_-4px_rgba(99,102,241,0.3)]' 
                  : 'text-text-muted hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-primary-bright' : 'text-text-muted group-hover:text-white'}`} />
              <span className="text-sm font-medium tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User card and global network footer */}
      <div className="p-4 border-t border-glass-border bg-bg-accent/40">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-white/[0.02] border border-glass-border">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-semibold text-white">
            {currentSaathi?.name ? currentSaathi.name.split(' ').map(n => n[0]).join('') : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white">{currentSaathi?.name || 'Loading...'}</p>
            <p className="text-xs text-text-muted truncate flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {currentSaathi?.partnerCode || 'Assigning...'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-glass-border hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-sm text-text-muted font-medium transition-all duration-300 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>

        <div className="mt-4 pt-3 border-t border-glass-border/40 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] text-text-muted font-outfit uppercase tracking-widest font-bold">
            <MapPin className="w-3 h-3 text-secondary animate-pulse" />
            <span>Global Partner Network</span>
          </div>
          <p className="text-[9px] text-text-muted/60 mt-1 italic font-sans">
            Walk Together. Grow Together.
          </p>
        </div>
      </div>
    </aside>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePortalStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  UserCheck, 
  Percent, 
  UploadCloud, 
  MessageSquare,
  LogOut,
  Settings,
  Trophy,
  Building,
  ClipboardList
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setRole } = usePortalStore();

  const menuItems = [
    { name: 'Analytics & Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Manage Saathis', href: '/admin/saathis', icon: UserCheck },
    { name: 'Approve Clients', href: '/admin/customers', icon: Building },
    { name: 'Commissions Disbursal', href: '/admin/commissions', icon: Percent },
    { name: 'Partner Leaderboard', href: '/admin/leaderboard', icon: Trophy },
    { name: 'Upload Resources', href: '/admin/resources', icon: UploadCloud },
    { name: 'Support Tickets', href: '/admin/tickets', icon: MessageSquare },
    { name: 'Modification Requests', href: '/admin/requests', icon: ClipboardList },
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
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-full glass-sidebar flex flex-col text-white">
      {/* Brand Header */}
      <div className="p-6 border-b border-glass-border flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <img src="/logoAnshapps.png" alt="ANSH logo" className="h-9 object-contain" />
          <span className="text-purple-400 font-semibold text-sm font-outfit uppercase tracking-widest mt-0.5">Admin</span>
        </div>
        <p className="text-[10px] text-purple-300/70 mt-2 tracking-wide font-sans uppercase">
          Portal Control Center
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
                  ? 'bg-gradient-to-r from-purple-500/25 to-indigo-500/15 text-white border border-purple-500/20 shadow-[0_4px_12px_-4px_rgba(168,85,247,0.3)]' 
                  : 'text-text-muted hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-purple-400' : 'text-text-muted group-hover:text-white'}`} />
              <span className="text-sm font-medium tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Card */}
      <div className="p-4 border-t border-glass-border bg-bg-accent/40">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-purple-900/10 border border-purple-900/30">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-semibold text-white">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white">ANSH Admin</p>
            <p className="text-xs text-purple-300 truncate flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              Super Admin
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
            <Settings className="w-3 h-3 text-purple-400 animate-spin-slow" />
            <span>Portal Controls</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

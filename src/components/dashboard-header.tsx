'use client';

import Link from 'next/link';
import { Menu, Trophy, Shield, User, Clock } from 'lucide-react';
import { usePortalStore } from '@/lib/store';

interface HeaderProps {
  title: string;
  onOpenMobileSidebar: () => void;
  isAdmin?: boolean;
}

export default function DashboardHeader({ title, onOpenMobileSidebar, isAdmin = false }: HeaderProps) {
  const { role, saathis, currentSaathiId } = usePortalStore();
  const currentSaathi = saathis.find(s => s.id === currentSaathiId);

  return (
    <header className="h-20 border-b border-glass-border bg-bg-dark/40 backdrop-blur-md sticky top-0 z-30 px-6 md:px-8 flex items-center justify-between">
      {/* Title & Mobile Trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-lg border border-glass-border bg-bg-accent/50 hover:bg-white/5 text-white md:hidden transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-outfit text-white tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Status Badge */}
        {!isAdmin && role === 'saathi-pending' && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Verification</span>
          </div>
        )}
        {!isAdmin && role === 'saathi' && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Active Partner</span>
          </div>
        )}
        {isAdmin && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </div>
        )}

        {/* Universal Ranking (Trophy) */}
        <Link 
          href={isAdmin ? '/admin/leaderboard' : '/dashboard/leaderboard'}
          title="View Leaderboard"
          className="p-2.5 rounded-xl border border-glass-border bg-bg-accent/40 hover:bg-white/5 text-text-muted hover:text-white transition-all cursor-pointer flex items-center justify-center"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
        </Link>

        {/* Profile indicator */}
        <div className="flex items-center gap-3 pl-3 border-l border-glass-border">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-white">
              {isAdmin ? 'System Admin' : (currentSaathi?.name || 'Loading...')}
            </p>
            <p className="text-xs text-text-muted">
              {isAdmin ? 'admin@anshapps.com' : (currentSaathi?.email || '')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary/80 to-secondary/80 flex items-center justify-center text-white font-bold border border-white/10 shadow-lg">
            {isAdmin ? (
              <Shield className="w-5 h-5 text-white" />
            ) : (
              currentSaathi?.name ? currentSaathi.name.split(' ').map(n => n[0]).join('') : '?'
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

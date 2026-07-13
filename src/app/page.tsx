'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalStore } from '@/lib/store';
import SaathiClient from './saathi-client';

export default function RootPage() {
  const router = useRouter();
  const { role } = usePortalStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (role === 'admin') {
      router.replace('/admin');
    } else if (role === 'saathi' || role === 'saathi-pending') {
      router.replace('/dashboard');
    }
  }, [role, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center animate-pulse">
            <img src="/logoAnshapps.png" alt="ANSH logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-sm font-medium text-text-muted font-outfit uppercase tracking-widest animate-pulse">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (role === 'admin' || role === 'saathi' || role === 'saathi-pending') {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center animate-pulse">
            <img src="/logoAnshapps.png" alt="ANSH logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-sm font-medium text-text-muted font-outfit uppercase tracking-widest animate-pulse">
            Redirecting to Portal...
          </div>
        </div>
      </div>
    );
  }

  return <SaathiClient />;
}

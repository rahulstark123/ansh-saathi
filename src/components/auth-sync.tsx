'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { usePortalStore } from '@/lib/store';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthSync() {
  const { setRole, setCurrentSaathiId, upsertSaathi } = usePortalStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // 1. Check current session on load
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const email = session.user.email || '';
        const id = session.user.id;

        if (email.toLowerCase() === 'admin@anshapps.com') {
          setRole('admin');
          return;
        }

        try {
          // Fetch the real profile from DB
          const res = await fetch(`/api/profile?id=${id}`);
          if (res.ok) {
            const profile = await res.json();
            
            // Add/update to Zustand store so it's available in saathis array with correct ID and joinedDate
            upsertSaathi({
              id: profile.id,
              wid: profile.wid,
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              profession: profile.profession,
              companyRole: profile.companyRole,
              pincode: profile.pincode,
              address: profile.address,
              city: profile.city,
              state: profile.state,
              linkedin: profile.linkedin,
              status: profile.status || 'approved',
              partnerCode: profile.partnerCode,
              profilePicture: profile.profilePicture,
              joinedDate: profile.joinedDate || new Date().toISOString().split('T')[0],
              payoutDetails: profile.payoutDetails || {
                bankName: profile.bankName || '',
                accountNumber: profile.accountNumber || '',
                ifsc: profile.ifsc || '',
                upiId: profile.upiId || ''
              },
              emergencyName: profile.emergencyName || '',
              emergencyPhone: profile.emergencyPhone || '',
              emergencyRelation: profile.emergencyRelation || '',
              emergencyEmail: profile.emergencyEmail || '',
            });

            setCurrentSaathiId(profile.id);
            setRole('saathi');
          } else {
            // Fallback using user metadata if profile API fetch fails
            const meta = session.user.user_metadata || {};
            const fallbackSaathi = {
              id,
              wid: 1,
              name: meta.name || 'Saathi Partner',
              email,
              phone: meta.phone || '',
              profession: meta.profession || 'Consultant',
              companyRole: meta.companyRole || 'Owner',
              pincode: meta.pincode || '',
              address: meta.address || '',
              city: meta.city || '',
              state: meta.state || '',
              linkedin: meta.linkedin || '',
              status: 'approved' as const,
              partnerCode: `SAATHI-${id.slice(0, 6).toUpperCase()}`,
              profilePicture: meta.profilePicture || null,
              joinedDate: new Date().toISOString().split('T')[0],
              payoutDetails: {
                bankName: meta.bankName || '',
                accountNumber: meta.accountNumber || '',
                ifsc: meta.ifsc || '',
                upiId: meta.upiId || ''
              },
              emergencyName: meta.emergencyName || '',
              emergencyPhone: meta.emergencyPhone || '',
              emergencyRelation: meta.emergencyRelation || '',
              emergencyEmail: meta.emergencyEmail || '',
            };
            upsertSaathi(fallbackSaathi);
            setCurrentSaathiId(id);
            setRole('saathi');
          }
        } catch (err) {
          console.error('[AuthSync] Error syncing profile:', err);
        }
      } else {
        // If no Supabase session and trying to access dashboard pages, redirect to login
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
          setRole('guest');
          router.replace('/login');
        }
      }
    };

    syncSession();

    // 2. Listen for auth state changes (e.g. login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        syncSession();
      } else {
        // Logged out
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
          setRole('guest');
          router.replace('/login');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router, setRole, setCurrentSaathiId, upsertSaathi]);

  return null;
}

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabase();

    const checkAuth = async () => {
      // 1. Skip check for auth-related and public marketing routes
      if (pathname === '/login' || pathname === '/auth/callback' || pathname === '/' || pathname === '/pricing') {
        setIsAuthorized(true);
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setIsAuthorized(true);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner />
          <span className="font-mono text-[10px] text-[#ff8c00] animate-pulse">
            SCANNING CREDENTIALS...
          </span>
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}

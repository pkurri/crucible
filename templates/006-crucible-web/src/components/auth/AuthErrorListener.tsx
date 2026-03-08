'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AuthErrorListener() {
  const router = useRouter();

  useEffect(() => {
    // Catch Supabase hash errors (e.g. #error=access_denied&error_code=otp_expired)
    // This happens when Supabase redirects to the SITE_URL instead of the REDIRECT_URL on failure
    if (typeof window !== 'undefined' && window.location.hash.includes('error=')) {
      router.push('/auth/auth-code-error');
    }
  }, [router]);

  return null;
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Add a timeout to ensure redirect happens even if loading takes too long
    const timeout = setTimeout(() => {
      if (!redirecting) {
        setRedirecting(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      }
    }, 2000); // 2 second timeout

    if (!loading && !redirecting) {
      setRedirecting(true);
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }

    return () => clearTimeout(timeout);
  }, [user, loading, router, redirecting]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
        {!process.env.NEXT_PUBLIC_API_URL && (
          <p className="mt-2 text-sm text-red-500">
            Warning: API URL not configured
          </p>
        )}
      </div>
    </div>
  );
}

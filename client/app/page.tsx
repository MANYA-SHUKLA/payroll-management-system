'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Wait a bit for hydration, then redirect
    const redirectTimer = setTimeout(() => {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(redirectTimer);
  }, [user, loading, router, mounted]);

  // Show a proper loading page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center space-y-6 px-4">
        {/* Logo/Icon */}
        <div className="mx-auto h-20 w-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.05.245 2.5.6.45.355.5.8.5 1.4 0 1.105-1.343 2-3 2s-3-.895-3-2c0-.6.05-1.045.5-1.4C9.95 4.245 10.89 4 12 4zm-8 8c1.105 0 2 .895 2 2s-.895 2-2 2-2-.895-2-2 .895-2 2-2zm14 0c1.105 0 2 .895 2 2s-.895 2-2 2-2-.895-2-2 .895-2 2-2z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900">
          Payroll Management System
        </h1>

        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>

        {/* Loading Text */}
        <p className="text-gray-600">Loading...</p>

        {/* API Warning (only in browser) */}
        {mounted && typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CollectionsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/products');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-neutral-600">Redirecting...</p>
      </div>
    </div>
  );
}

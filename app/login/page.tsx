"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        router.push('/admin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-[#1A1A1A] mb-3">Atelier</h1>
          <p className="text-sm text-[#1A1A1A]/60 tracking-wider uppercase">
            Admin Access
          </p>
        </div>

        <div className="bg-white border border-[#1A1A1A]/10 p-8">
          <div className="flex gap-2 mb-8 border-b border-[#1A1A1A]/10">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 pb-3 text-sm tracking-wider uppercase transition-colors ${
                !isSignUp
                  ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]'
                  : 'text-[#1A1A1A]/40'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 pb-3 text-sm tracking-wider uppercase transition-colors ${
                isSignUp
                  ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]'
                  : 'text-[#1A1A1A]/40'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#1A1A1A]/60 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#1A1A1A]/20 bg-white text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#1A1A1A]/60 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#1A1A1A]/20 bg-white text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1A1A] text-white py-4 text-sm tracking-wider uppercase hover:bg-[#1A1A1A]/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <a
            href="/"
            className="text-xs text-[#1A1A1A]/60 hover:text-[#1A1A1A] tracking-wider uppercase"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

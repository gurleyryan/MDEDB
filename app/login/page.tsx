'use client';
import { useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="panel-glass backdrop-blur-xl shadow-lg border border-gray-600/50 dark:border-gray-600/50 p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-mde" style={{ color: 'var(--foreground)' }}>Admin Login</h1>
            <p className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.7 }}>Sign in to manage organizations</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium font-mde mb-2" style={{ color: 'var(--foreground)', opacity: 0.9 }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 panel-glass border border-gray-600/50 dark:border-gray-600/50 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-all duration-200"
                style={{ color: 'var(--foreground)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium font-mde mb-2" style={{ color: 'var(--foreground)', opacity: 0.9 }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 panel-glass border border-gray-600/50 dark:border-gray-600/50 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-all duration-200"
                style={{ color: 'var(--foreground)' }}
              />
            </div>

            {error && (
              <div className="panel-glass border border-red-500/50 p-3">
                <p className="text-red-500 text-sm font-mde">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full panel-glass border border-gray-600/50 dark:border-gray-600/50 font-medium font-mde py-2 px-4 transition-all duration-200 hover:border-[#f7ed6a] hover:text-[#f7ed6a]"
              style={{ color: 'var(--foreground)' }}
            >
              Sign In
            </button>
          </form>

          <div className="border-t border-gray-600/50 dark:border-gray-600/50 pt-4">
            <p className="text-center text-sm font-mde" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
              Forgot your password?{' '}
              <Link href="/forgot-password" className="font-medium transition-colors duration-200 hover:!text-[#f7ed6a]" style={{ color: 'var(--foreground)' }}>
                Reset it here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

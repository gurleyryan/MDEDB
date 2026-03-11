'use client';
import { useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for a password reset link.');
        setEmail('');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="panel-glass backdrop-blur-xl shadow-lg border border-gray-600/50 dark:border-gray-600/50 p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-mde" style={{ color: 'var(--foreground)' }}>Reset Password</h1>
            <p className="text-sm font-mde" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {message && (
              <div className="panel-glass border border-green-500/50 p-3">
                <p className="text-green-500 text-sm font-mde">{message}</p>
              </div>
            )}

            {error && (
              <div className="panel-glass border border-red-500/50 p-3">
                <p className="text-red-500 text-sm font-mde">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full panel-glass border border-gray-600/50 dark:border-gray-600/50 font-medium font-mde py-2 px-4 transition-all duration-200 hover:border-[#f7ed6a] hover:text-[#f7ed6a] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-600/50 disabled:hover:text-[var(--foreground)]"
              style={{ color: 'var(--foreground)' }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="border-t border-gray-600/50 dark:border-gray-600/50 pt-4">
            <p className="text-center text-sm font-mde" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
              Remember your password?{' '}
              <Link href="/login" className="font-medium transition-colors duration-200 hover:!text-[#f7ed6a]" style={{ color: 'var(--foreground)' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

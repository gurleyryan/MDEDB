'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordClient() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Check if Supabase verify endpoint already returned an error
    if (error) {
      setTokenError(
        errorDescription 
          ? `${errorDescription}. Please request a new reset link.`
          : 'Invalid or expired reset link. Please request a new one.'
      );
      return;
    }

    const exchangePkce = async (code: string) => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Exchange error:', error);
        setTokenError('Invalid or expired reset link. Please request a new one.');
      }
    };

    if (token && type === 'recovery') {
      void exchangePkce(token);
      return;
    }

    if (!hash || !hash.includes('access_token')) {
      setTokenError('Invalid or expired reset link. Please request a new one.');
    }
  }, [searchParams, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
        <div className="w-full max-w-md">
          <div className="panel-glass backdrop-blur-xl rounded-lg shadow-lg border border-gray-600/50 dark:border-gray-600/50 p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-bold font-mde" style={{ color: 'var(--foreground)' }}>Reset Password</h1>
            </div>
            
            <div className="panel-glass border border-red-500/50 rounded-lg p-4">
              <p className="text-red-500 font-mde">{tokenError}</p>
            </div>

            <div className="space-y-3">
              <Link
                href="/forgot-password"
                className="block w-full text-center panel-glass border border-gray-600/50 dark:border-gray-600/50 font-medium font-mde py-2 px-4 rounded-lg transition-all duration-200 hover:border-[#f7ed6a] hover:text-[#f7ed6a]"
                style={{ color: 'var(--foreground)' }}
              >
                Request a New Reset Link
              </Link>
              <Link
                href="/login"
                className="block w-full text-center panel-glass border border-gray-600/50 dark:border-gray-600/50 font-medium font-mde py-2 px-4 rounded-lg transition-all duration-200 hover:border-[#f7ed6a] hover:text-[#f7ed6a]"
                style={{ color: 'var(--foreground)' }}
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="panel-glass backdrop-blur-xl rounded-lg shadow-lg border border-gray-600/50 dark:border-gray-600/50 p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-mde" style={{ color: 'var(--foreground)' }}>Set New Password</h1>
            <p className="text-sm font-mde" style={{ color: 'var(--foreground)', opacity: 0.7 }}>Enter a new password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium font-mde mb-2" style={{ color: 'var(--foreground)', opacity: 0.9 }}>
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 panel-glass border border-gray-600/50 dark:border-gray-600/50 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-all duration-200"
                style={{ color: 'var(--foreground)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium font-mde mb-2" style={{ color: 'var(--foreground)', opacity: 0.9 }}>
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 panel-glass border border-gray-600/50 dark:border-gray-600/50 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-all duration-200"
                style={{ color: 'var(--foreground)' }}
              />
            </div>

            {message && (
              <div className="panel-glass border border-green-500/50 rounded-lg p-3">
                <p className="text-green-500 text-sm font-mde">{message}</p>
              </div>
            )}

            {error && (
              <div className="panel-glass border border-red-500/50 rounded-lg p-3">
                <p className="text-red-500 text-sm font-mde">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full panel-glass border border-gray-600/50 dark:border-gray-600/50 font-medium font-mde py-2 px-4 rounded-lg transition-all duration-200 hover:border-[#f7ed6a] hover:text-[#f7ed6a] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-600/50 disabled:hover:text-[var(--foreground)]"
              style={{ color: 'var(--foreground)' }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <div className="border-t border-gray-600/50 dark:border-gray-600/50 pt-4">
            <p className="text-center text-sm font-mde" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
              <Link href="/login" className="font-medium transition-colors duration-200 hover:!text-[#f7ed6a]" style={{ color: 'var(--foreground)' }}>
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

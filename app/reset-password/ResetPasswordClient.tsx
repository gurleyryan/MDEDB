'use client';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [isExchanging, setIsExchanging] = useState(true);

  const code = searchParams.get('code');
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const urlError = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const hasCode = Boolean(code);

  const supabase = useMemo(() => {
    if (hasCode) return null;
    return createClient();
  }, [hasCode]);

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    // Check if Supabase verify endpoint already returned an error
    if (urlError) {
      setTokenError(
        errorDescription
          ? `${errorDescription}. Please request a new reset link.`
          : 'Invalid or expired reset link. Please request a new one.'
      );
      setIsExchanging(false);
      return;
    }

    const exchangePkceServer = (codeParam: string) => {
      // Let the server route handle cookies and redirect back cleanly
      if (typeof window !== 'undefined') {
        window.location.replace(`/api/auth/exchange?code=${encodeURIComponent(codeParam)}`);
      }
    };

    // Handle new PKCE flow: code parameter from verify redirect
    if (code) {
      exchangePkceServer(code);
      return;
    }

    // Handle legacy flow: token + type=recovery
    if (token && type === 'recovery' && supabase) {
      // Legacy flow still uses client exchange
      const exchangeLegacy = async () => {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(token);
          if (exchangeError) {
            console.error('Exchange error:', exchangeError);
            setTokenError('Invalid or expired reset link. Please request a new one.');
          }
        } catch (err) {
          console.error('Exchange exception:', err);
          setTokenError('Invalid or expired reset link. Please request a new one.');
        } finally {
          setIsExchanging(false);
        }
      };
      void exchangeLegacy();
      return;
    }

    // Handle hash-based flow (legacy)
    if (hash && hash.includes('access_token')) {
      setIsExchanging(false);
      return;
    }

    // No valid auth params found
    setIsExchanging(false);
    setTokenError('Invalid or expired reset link. Please request a new one.');
  }, [code, token, type, urlError, errorDescription, supabase]);

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

    if (!supabase) {
      setError('Session not ready. Please retry the link.');
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
    // Show loading while exchange is in progress
    if (isExchanging) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
          <div className="w-full max-w-md">
            <div className="panel-glass backdrop-blur-xl rounded-lg shadow-lg border border-gray-600/50 dark:border-gray-600/50 p-8 space-y-6">
              <div>
                <h1 className="text-3xl font-bold font-mde" style={{ color: 'var(--foreground)' }}>Verifying Link...</h1>
              </div>
              <p className="text-sm font-mde" style={{ color: 'var(--foreground)', opacity: 0.7 }}>Please wait while we verify your reset link.</p>
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

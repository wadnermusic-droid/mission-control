'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenFromUrl, setTokenFromUrl] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setTokenFromUrl(urlToken);
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('No reset token provided');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to reset password');
        return;
      }

      toast.success('Password reset successful!');
      router.push('/login');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mc-bg p-4 page-enter">
      <div className="w-full max-w-md">
        <div className="bg-mc-surface border border-mc-border rounded-lg p-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-mc-text mb-2">Mission Control</h1>
          <p className="text-mc-text-secondary mb-8">Create a new password</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
                Reset Token
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="input w-full"
                placeholder="Paste your reset token here"
                required
              />
              {!tokenFromUrl && (
                <p className="text-xs text-mc-text-secondary mt-1">
                  Get one from the{' '}
                  <Link href="/forgot-password" className="text-mc-primary hover:underline">
                    forgot password
                  </Link>{' '}
                  page
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input w-full"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Resetting password...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-mc-text-secondary">
            <Link href="/login" className="text-mc-primary hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

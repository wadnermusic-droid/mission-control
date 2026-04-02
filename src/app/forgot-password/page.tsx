'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to generate reset token');
        return;
      }

      setResetToken(data.token);
      setResetLink(data.resetLink);
      toast.success('Reset token generated!');
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
          <p className="text-mc-text-secondary mb-8">Reset your password</p>

          {!resetToken ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-mc-text mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full"
                  required
                  placeholder="test@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Generating token...' : 'Generate Reset Token'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-sm font-semibold text-green-900 mb-2">
                  ✅ Token Generated!
                </p>
                <p className="text-sm text-green-800 mb-3">
                  Your password reset token has been created. Copy it and use it on the reset page.
                </p>

                <div className="bg-mc-surface border border-mc-border rounded p-3 mb-3">
                  <p className="text-xs text-mc-text-secondary mb-1">Reset Token:</p>
                  <code className="text-xs text-mc-text break-all font-mono block">
                    {resetToken}
                  </code>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resetToken);
                    toast.success('Token copied!');
                  }}
                  className="btn-secondary w-full mb-2 text-sm"
                >
                  📋 Copy Token
                </button>

                <Link
                  href={resetLink || '/reset-password'}
                  className="btn-primary w-full block text-center text-sm"
                >
                  Go to Reset Page
                </Link>
              </div>

              <button
                onClick={() => {
                  setResetToken(null);
                  setResetLink(null);
                  setEmail('');
                }}
                className="btn-ghost w-full text-sm"
              >
                Reset Form
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-mc-text-secondary">
            Remember your password?{' '}
            <Link href="/login" className="text-mc-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

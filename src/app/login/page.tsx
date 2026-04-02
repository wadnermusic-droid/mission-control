'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Login failed');
        return;
      }

      toast.success('Logged in successfully!');
      router.push('/');
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
          <p className="text-mc-text-secondary mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-mc-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-mc-text-secondary">
            Don't have an account?{' '}
            <Link href="/signup" className="text-mc-primary hover:underline">
              Sign up
            </Link>
          </div>

          <div className="mt-6 p-4 bg-mc-surface-hover rounded text-sm text-mc-text-secondary">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <p>Email: test@example.com</p>
            <p>Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

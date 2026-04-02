'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  lastLoginAt?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Form states
  const [nameForm, setNameForm] = useState({ name: '' });
  const [emailForm, setEmailForm] = useState({ email: '' });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setNameForm({ name: data.user.name });
        setEmailForm({ email: data.user.email });
      } catch (error) {
        toast.error('Failed to load profile');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleSaveName = async () => {
    if (!nameForm.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameForm.name }),
        credentials: 'include',
      });

      if (!res.ok) {
        toast.error('Failed to update name');
        return;
      }

      setUser({ ...user!, name: nameForm.name });
      setEditingSection(null);
      toast.success('Name updated!');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!emailForm.email.trim()) {
      toast.error('Email cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForm.email }),
        credentials: 'include',
      });

      if (!res.ok) {
        toast.error('Failed to update email');
        return;
      }

      setUser({ ...user!, email: emailForm.email });
      setEditingSection(null);
      toast.success('Email updated!');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      toast.error('All fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to change password');
        return;
      }

      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setEditingSection(null);
      toast.success('Password changed!');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        toast.error('Failed to delete account');
        return;
      }

      toast.success('Account deleted');
      router.push('/login');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      toast.success('Logged out');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mc-bg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mc-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-mc-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-mc-bg p-4 page-enter">
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-mc-primary hover:underline text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-mc-text mt-4">Profile Settings</h1>
          <p className="text-mc-text-secondary">Manage your account</p>
        </div>

        {/* User Info Card */}
        <div className="bg-mc-surface border border-mc-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-mc-primary bg-opacity-20 flex items-center justify-center text-xl">
                  👤
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-mc-text">{user.name}</h2>
                  <p className="text-sm text-mc-text-secondary">{user.email}</p>
                </div>
              </div>
              <div className="text-sm text-mc-text-secondary space-y-1">
                <p>Role: <span className="text-mc-text capitalize">{user.role}</span></p>
                {user.lastLoginAt && (
                  <p>Last login: <span className="text-mc-text">{new Date(user.lastLoginAt).toLocaleDateString()}</span></p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary text-sm"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Edit Name Section */}
        <div className="bg-mc-surface border border-mc-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-mc-text">Full Name</h3>
            {editingSection !== 'name' && (
              <button
                onClick={() => setEditingSection('name')}
                className="btn-ghost text-sm"
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {editingSection === 'name' ? (
            <div className="space-y-4">
              <input
                type="text"
                value={nameForm.name}
                onChange={(e) => setNameForm({ name: e.target.value })}
                className="input w-full"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditingSection(null);
                    setNameForm({ name: user.name });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-mc-text">{user.name}</p>
          )}
        </div>

        {/* Edit Email Section */}
        <div className="bg-mc-surface border border-mc-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-mc-text">Email Address</h3>
            {editingSection !== 'email' && (
              <button
                onClick={() => setEditingSection('email')}
                className="btn-ghost text-sm"
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {editingSection === 'email' ? (
            <div className="space-y-4">
              <input
                type="email"
                value={emailForm.email}
                onChange={(e) => setEmailForm({ email: e.target.value })}
                className="input w-full"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSaveEmail}
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditingSection(null);
                    setEmailForm({ email: user.email });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-mc-text">{user.email}</p>
          )}
        </div>

        {/* Change Password Section */}
        <div className="bg-mc-surface border border-mc-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-mc-text">Password</h3>
            {editingSection !== 'password' && (
              <button
                onClick={() => setEditingSection('password')}
                className="btn-ghost text-sm"
              >
                🔐 Change
              </button>
            )}
          </div>

          {editingSection === 'password' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-mc-text mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      oldPassword: e.target.value,
                    })
                  }
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mc-text mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mc-text mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="input w-full"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Saving...' : 'Change Password'}
                </button>
                <button
                  onClick={() => {
                    setEditingSection(null);
                    setPasswordForm({
                      oldPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-mc-text-secondary">••••••••</p>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            ⚠️ Danger Zone
          </h3>
          <p className="text-sm text-red-800 dark:text-red-200 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm"
          >
            🗑️ Delete Account
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-mc-surface border border-mc-border rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-bold text-mc-text mb-2">Delete Account?</h3>
              <p className="text-mc-text-secondary mb-6">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                >
                  {saving ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

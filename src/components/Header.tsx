'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface HeaderProps {
  taskCount: number;
  onCreateTask: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  taskCount,
  onCreateTask,
  sidebarOpen,
  onToggleSidebar,
  userName = 'User',
}) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  React.useEffect(() => setMounted(true), []);

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

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-mc-border glass sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="btn-ghost text-lg"
            title="Open sidebar"
          >
            ☰
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold gradient-text">Mission Control</h1>
          <p className="text-sm text-mc-text-secondary">
            {taskCount} task{taskCount !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onCreateTask} className="btn-primary flex items-center gap-2">
          <span className="text-lg">+</span>
          New Task
        </button>

        <button 
          onClick={onToggleSidebar} 
          className="btn-secondary text-sm"
        >
          {sidebarOpen ? 'Hide Tools' : 'Show Tools'}
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn-ghost text-xl p-2 rounded-lg"
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        )}

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="btn-secondary text-sm flex items-center gap-2 px-3 py-2"
          >
            👤 {userName}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-mc-surface border border-mc-border rounded-lg shadow-lg z-20">
              <div className="p-3 border-b border-mc-border">
                <p className="text-sm text-mc-text-secondary">Logged in as</p>
                <p className="font-semibold text-mc-text truncate">{userName}</p>
              </div>
              <a
                href="/profile"
                onClick={() => setShowUserMenu(false)}
                className="w-full text-left px-4 py-2 text-sm text-mc-text hover:bg-mc-surface-hover block"
              >
                ⚙️ Settings
              </a>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-mc-text hover:bg-mc-surface-hover border-t border-mc-border"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

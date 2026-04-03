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
  viewMode?: 'kanban' | 'calendar' | 'analytics' | 'trash';
  onViewModeChange?: (mode: 'kanban' | 'calendar' | 'analytics' | 'trash') => void;
  onTrash?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  taskCount,
  onCreateTask,
  sidebarOpen,
  onToggleSidebar,
  userName = 'User',
  viewMode = 'kanban',
  onViewModeChange = () => {},
  onTrash = () => {},
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
    <header className="glass sticky top-0 z-10 border-b border-mc-border px-4 py-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="btn-ghost text-lg md:hidden min-h-10 min-w-10 flex items-center justify-center"
              title="Open tools"
            >
              ☰
            </button>
          )}
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">Mission Control</h1>
            <p className="text-xs text-mc-text-secondary">
              {taskCount} task{taskCount !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 justify-between md:justify-end flex-wrap">
          {/* View Mode Buttons - Mobile optimized */}
          <div className="flex gap-1 rounded-lg bg-mc-surface p-1 sm:gap-2 sm:p-1.5">
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`px-2 sm:px-3 py-1.5 text-sm rounded min-w-10 min-h-10 flex items-center justify-center transition ${
                viewMode === 'kanban' 
                  ? 'bg-mc-primary text-white' 
                  : 'hover:bg-mc-surface-hover'
              }`}
              title="Kanban board"
            >
              📋
            </button>
            <button
              onClick={() => onViewModeChange('calendar')}
              className={`px-2 sm:px-3 py-1.5 text-sm rounded min-w-10 min-h-10 flex items-center justify-center transition ${
                viewMode === 'calendar' 
                  ? 'bg-mc-primary text-white' 
                  : 'hover:bg-mc-surface-hover'
              }`}
              title="Calendar view"
            >
              📅
            </button>
            <button
              onClick={() => onViewModeChange('analytics')}
              className={`px-2 sm:px-3 py-1.5 text-sm rounded min-w-10 min-h-10 flex items-center justify-center transition ${
                viewMode === 'analytics' 
                  ? 'bg-mc-primary text-white' 
                  : 'hover:bg-mc-surface-hover'
              }`}
              title="Analytics dashboard"
            >
              📊
            </button>
            <button
              onClick={() => onViewModeChange('trash')}
              className={`px-3 py-1.5 text-sm rounded ${
                viewMode === 'trash' 
                  ? 'bg-mc-primary text-white' 
                  : 'hover:bg-mc-surface-hover'
              }`}
              title="Trash & recovery"
            >
              🗑️
            </button>
          </div>

          <button
            onClick={onCreateTask}
            className="btn-primary flex items-center gap-1 text-sm px-3 py-1.5 md:px-4 md:py-2"
          >
            <span className="text-base md:text-lg">+</span>
            <span className="inline md:inline">New</span>
          </button>

          <button
            onClick={onToggleSidebar}
            className="btn-secondary text-sm px-3 py-1.5 md:px-4 md:py-2 flex items-center gap-2 hidden md:flex"
          >
            <span>{sidebarOpen ? 'Hide Tools' : 'Show Tools'}</span>
          </button>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn-ghost text-lg md:text-xl p-2 rounded-lg"
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
      </div>
    </header>
  );
};

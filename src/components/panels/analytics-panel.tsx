'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalTasks: number;
  overdueTasks: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  totalTimeTracked: number;
  totalPomodoroSessions: number;
  totalPomodoroFocusTime: number;
  completedThisWeek: number;
  averageTimePerTask: number;
}

const STATUS_COLORS: Record<string, string> = {
  inbox: 'bg-gray-100',
  assigned: 'bg-blue-100',
  in_progress: 'bg-yellow-100',
  done: 'bg-green-100',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-green-100',
  medium: 'bg-yellow-100',
  high: 'bg-orange-100',
  urgent: 'bg-red-100',
};

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/tasks/analytics');
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <div className="p-6 text-center">Loading analytics...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        📊 Analytics
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-600 text-white p-4 rounded-lg border border-blue-700 shadow-md">
          <div className="text-sm font-semibold opacity-90">Total Tasks</div>
          <div className="text-4xl font-bold mt-2">{data.totalTasks}</div>
        </div>

        <div className="bg-red-600 text-white p-4 rounded-lg border border-red-700 shadow-md">
          <div className="text-sm font-semibold opacity-90">Overdue</div>
          <div className="text-4xl font-bold mt-2">{data.overdueTasks}</div>
        </div>

        <div className="bg-green-600 text-white p-4 rounded-lg border border-green-700 shadow-md">
          <div className="text-sm font-semibold opacity-90">Completed This Week</div>
          <div className="text-4xl font-bold mt-2">{data.completedThisWeek}</div>
        </div>

        <div className="bg-purple-600 text-white p-4 rounded-lg border border-purple-700 shadow-md">
          <div className="text-sm font-semibold opacity-90">Pomodoros</div>
          <div className="text-4xl font-bold mt-2">{data.totalPomodoroSessions}</div>
        </div>
      </div>

      {/* Time Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-amber-600 text-white p-4 rounded-lg border border-amber-700 shadow-md">
          <div className="text-sm font-semibold opacity-90">Total Time Tracked</div>
          <div className="text-3xl font-bold mt-2">{formatDuration(data.totalTimeTracked)}</div>
          <div className="text-xs opacity-80 mt-2">
            Avg: {formatDuration(data.averageTimePerTask)} per task
          </div>
        </div>

        <div className="bg-indigo-600 text-white p-4 rounded-lg border border-indigo-700 shadow-md">
          <div className="text-sm font-semibold opacity-90">Pomodoro Focus Time</div>
          <div className="text-3xl font-bold mt-2">{formatDuration(data.totalPomodoroFocusTime)}</div>
          <div className="text-xs opacity-80 mt-2">
            {data.totalPomodoroSessions} completed sessions
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-mc-border rounded-lg p-4 bg-mc-surface-hover">
          <h3 className="font-semibold mb-4 text-lg text-mc-text">By Status</h3>
          <div className="space-y-3">
            {Object.entries(data.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full font-bold text-xs flex items-center justify-center text-white ${
                    status === 'inbox' ? 'bg-gray-500' :
                    status === 'assigned' ? 'bg-blue-500' :
                    status === 'in_progress' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <span className="text-sm capitalize font-medium text-mc-text">{status.replace('_', ' ')}</span>
                </div>
                <span className="font-bold text-lg text-mc-text">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-mc-border rounded-lg p-4 bg-mc-surface-hover">
          <h3 className="font-semibold mb-4 text-lg text-mc-text">By Priority</h3>
          <div className="space-y-3">
            {Object.entries(data.byPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full font-bold text-xs flex items-center justify-center text-white ${
                    priority === 'low' ? 'bg-green-600' :
                    priority === 'medium' ? 'bg-blue-600' :
                    priority === 'high' ? 'bg-orange-600' :
                    'bg-red-600'
                  }`} />
                  <span className="text-sm capitalize font-medium text-mc-text">{priority}</span>
                </div>
                <span className="font-bold text-lg text-mc-text">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

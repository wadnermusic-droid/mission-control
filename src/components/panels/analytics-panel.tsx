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
        <div className="bg-blue-50 p-4 rounded-lg border">
          <div className="text-sm font-semibold text-gray-600">Total Tasks</div>
          <div className="text-3xl font-bold mt-2">{data.totalTasks}</div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border">
          <div className="text-sm font-semibold text-gray-600">Overdue</div>
          <div className="text-3xl font-bold mt-2 text-red-600">{data.overdueTasks}</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border">
          <div className="text-sm font-semibold text-gray-600">Completed This Week</div>
          <div className="text-3xl font-bold mt-2 text-green-600">{data.completedThisWeek}</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border">
          <div className="text-sm font-semibold text-gray-600">Pomodoros</div>
          <div className="text-3xl font-bold mt-2 text-purple-600">{data.totalPomodoroSessions}</div>
        </div>
      </div>

      {/* Time Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-amber-50 p-4 rounded-lg border">
          <div className="text-sm font-semibold text-gray-600">Total Time Tracked</div>
          <div className="text-2xl font-bold mt-2">{formatDuration(data.totalTimeTracked)}</div>
          <div className="text-xs text-gray-500 mt-2">
            Avg: {formatDuration(data.averageTimePerTask)} per task
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg border">
          <div className="text-sm font-semibold text-gray-600">Pomodoro Focus Time</div>
          <div className="text-2xl font-bold mt-2">{formatDuration(data.totalPomodoroFocusTime)}</div>
          <div className="text-xs text-gray-500 mt-2">
            {data.totalPomodoroSessions} completed sessions
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">By Status</h3>
          <div className="space-y-2">
            {Object.entries(data.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${STATUS_COLORS[status] || 'bg-gray-200'}`} />
                  <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">By Priority</h3>
          <div className="space-y-2">
            {Object.entries(data.byPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${PRIORITY_COLORS[priority] || 'bg-gray-200'}`} />
                  <span className="text-sm capitalize">{priority}</span>
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

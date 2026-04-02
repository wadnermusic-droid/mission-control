'use client';

import React, { useMemo } from 'react';
import { ToolComponentProps, PRIORITY_CONFIG } from '@/lib/tools';

export const Analytics: React.FC<ToolComponentProps> = ({ tasks }) => {
  const stats = useMemo(() => {
    const byStatus = tasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byPriority = tasks.reduce(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const workload = tasks.reduce(
      (acc, task) => {
        if (task.assignee && task.status !== 'done') {
          acc[task.assignee] = (acc[task.assignee] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const completionRate =
      tasks.length > 0
        ? Math.round(((byStatus.done || 0) / tasks.length) * 100)
        : 0;

    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;

    return { byStatus, byPriority, workload, completionRate, overdue };
  }, [tasks]);

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-lg bg-mc-primary/10 border border-mc-primary/20">
          <div className="text-2xl font-bold text-mc-primary">{tasks.length}</div>
          <div className="text-xs text-mc-text-secondary">Total Tasks</div>
        </div>
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="text-2xl font-bold text-green-500">
            {stats.byStatus.done || 0}
          </div>
          <div className="text-xs text-mc-text-secondary">Completed</div>
        </div>
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
          <div className="text-xs text-mc-text-secondary">Overdue</div>
        </div>
      </div>

      {/* Completion Rate */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-mc-text-secondary">
            Completion Rate
          </h4>
          <span className="text-sm font-bold text-mc-text">{stats.completionRate}%</span>
        </div>
        <div className="w-full bg-mc-surface-hover rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-mc-primary to-mc-accent h-full transition-all duration-300"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      {/* Status Breakdown */}
      <div>
        <h4 className="text-xs font-semibold text-mc-text-secondary mb-2">
          By Status
        </h4>
        <div className="space-y-1.5">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div
              key={status}
              className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-mc-surface-hover"
            >
              <span className="capitalize text-mc-text">{status.replace(/_/g, ' ')}</span>
              <span className="font-medium text-mc-text">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Breakdown */}
      <div>
        <h4 className="text-xs font-semibold text-mc-text-secondary mb-2">
          Priority Distribution
        </h4>
        <div className="space-y-1.5">
          {(Object.entries(stats.byPriority) as [string, number][]).map(
            ([priority, count]) => {
              const config =
                PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];
              return (
                <div
                  key={priority}
                  className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-mc-surface-hover"
                >
                  <span className={`px-2 py-0.5 rounded-full ${config.color}`}>
                    {config.icon} {config.label}
                  </span>
                  <span className="font-medium text-mc-text">{count}</span>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Assignee Workload */}
      {Object.keys(stats.workload).length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-mc-text-secondary mb-2">
            Workload
          </h4>
          <div className="space-y-1.5">
            {Object.entries(stats.workload)
              .sort(([, a], [, b]) => b - a)
              .map(([assignee, count]) => (
                <div
                  key={assignee}
                  className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-mc-surface-hover"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-mc-primary/20 text-mc-primary text-[10px] flex items-center justify-center font-medium">
                      {assignee.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-mc-text">{assignee}</span>
                  </div>
                  <span className="font-medium text-mc-text">{count} open</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

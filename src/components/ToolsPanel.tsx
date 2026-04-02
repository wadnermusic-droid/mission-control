'use client';

import React, { useState, useEffect } from 'react';
import { ToolComponentProps, TOOL_REGISTRY } from '@/lib/tools';
import { fetchTools, toggleTool } from '@/lib/api';
import { TimeTracker } from './tools/TimeTracker';
import { NotesPanel } from './tools/NotesPanel';
import { CalendarView } from './tools/CalendarView';
import { Analytics } from './tools/Analytics';
import { PomodoroTimer } from './tools/PomodoroTimer';
import toast from 'react-hot-toast';

interface ToolsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  tasks: any[];
  selectedTask: any | null;
  onTaskUpdate: (id: string, data: any) => Promise<void>;
  onRefresh: () => void;
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  isOpen,
  onToggle,
  tasks,
  selectedTask,
  onTaskUpdate,
  onRefresh,
}) => {
  const [tools, setTools] = useState<any[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [activeTool, setActiveTool] = useState<string>('time-tracker');

  useEffect(() => {
    const loadTools = async () => {
      try {
        const data = await fetchTools();
        setTools(data);
        if (data.length > 0 && !activeTool) {
          setActiveTool(data[0].name);
        }
      } catch (error) {
        toast.error('Failed to load tools');
      } finally {
        setLoadingTools(false);
      }
    };
    loadTools();
  }, []);

  const handleToggleTool = async (name: string) => {
    try {
      const tool = tools.find((t) => t.name === name);
      if (tool) {
        await toggleTool(name, !tool.enabled);
        setTools((prev) =>
          prev.map((t) =>
            t.name === name ? { ...t, enabled: !t.enabled } : t
          )
        );
      }
    } catch (error) {
      toast.error('Failed to toggle tool');
    }
  };

  const enabledTools = tools.filter((t) => t.enabled);
  const activeToolDef = TOOL_REGISTRY[activeTool];

  const getToolComponent = (name: string) => {
    switch (name) {
      case 'time-tracker':
        return TimeTracker;
      case 'notes-panel':
        return NotesPanel;
      case 'calendar-view':
        return CalendarView;
      case 'analytics':
        return Analytics;
      case 'pomodoro-timer':
        return PomodoroTimer;
      default:
        return null;
    }
  };

  const ActiveComponent = getToolComponent(activeTool);

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col border-r border-mc-border bg-mc-surface overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-mc-border">
        <h2 className="font-semibold text-mc-text flex items-center gap-2">
          🧰 Tools
        </h2>
        <button
          onClick={onToggle}
          className="btn-ghost text-lg p-0 w-6 h-6 flex items-center justify-center"
          title="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Tool Tabs */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-mc-border">
        {enabledTools.map((tool) => {
          const def = TOOL_REGISTRY[tool.name];
          return (
            <button
              key={tool.name}
              onClick={() => setActiveTool(tool.name)}
              className={`text-xs px-2 py-1.5 rounded-lg transition-all duration-150 ${
                activeTool === tool.name
                  ? 'bg-mc-primary text-white shadow-sm'
                  : 'hover:bg-mc-surface-hover text-mc-text-secondary'
              }`}
              title={def?.description}
            >
              {def?.icon} {tool.displayName}
            </button>
          );
        })}
      </div>

      {/* Active Tool Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedTask && (
          <div className="text-center py-8 bg-mc-surface-hover rounded-lg border-2 border-dashed border-mc-border p-4">
            <p className="text-3xl mb-3">👉</p>
            <p className="text-sm font-semibold text-mc-text mb-2">Select a Task First</p>
            <p className="text-xs text-mc-text-secondary mb-4">
              Click on any task in the Kanban board to see its details and use tools
            </p>
            <button
              onClick={() => {
                // Scroll to kanban board (user responsibility)
                alert('👈 Click on a task in the Kanban board on the left side');
              }}
              className="btn-secondary text-xs"
            >
              How to Use Tools
            </button>
          </div>
        )}

        {selectedTask && ActiveComponent && (
          <div className="animate-fade-in">
            {activeToolDef && (
              <div className="tool-panel-header mb-3 pb-3 border-b border-mc-border">
                <h3 className="font-semibold text-mc-text flex items-center gap-2">
                  {activeToolDef.icon} {activeToolDef.displayName}
                </h3>
                <p className="text-xs text-mc-text-secondary mt-1">
                  📌 Working on: <span className="font-semibold text-mc-text">{selectedTask.title}</span>
                </p>
              </div>
            )}
            <ActiveComponent
              tasks={tasks}
              selectedTask={selectedTask}
              onTaskUpdate={onTaskUpdate}
              onRefresh={onRefresh}
            />
          </div>
        )}

        {!ActiveComponent && !loadingTools && selectedTask && (
          <div className="text-center py-8 text-mc-text-secondary">
            <p className="text-3xl mb-2">🧰</p>
            <p className="text-sm">No tool selected</p>
            <p className="text-xs mt-1">Click a tool button above to get started</p>
          </div>
        )}
      </div>

      {/* Tool Settings */}
      <div className="border-t border-mc-border p-3">
        <details className="group">
          <summary className="cursor-pointer text-xs text-mc-text-secondary flex items-center gap-1 select-none">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            Manage Tools
          </summary>
          <div className="mt-2 space-y-1">
            {tools.map((tool) => {
              const def = TOOL_REGISTRY[tool.name];
              return (
                <label
                  key={tool.name}
                  className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-mc-surface-hover cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={tool.enabled}
                    onChange={() => handleToggleTool(tool.name)}
                    className="rounded border-mc-border"
                  />
                  <span>{def?.icon}</span>
                  <span className="text-mc-text">{tool.displayName}</span>
                </label>
              );
            })}
          </div>
        </details>
      </div>
    </aside>
  );
};

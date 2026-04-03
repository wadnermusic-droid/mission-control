'use client';

import React, { useState } from 'react';
import { TimeTracker } from './tools/TimeTracker';
import { NotesPanel } from './tools/NotesPanel';
import { Analytics } from './tools/Analytics';
import { PomodoroTimer } from './tools/PomodoroTimer';

interface ToolsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  tasks: any[];
  selectedTask: any | null;
  onTaskUpdate: (id: string, data: any) => Promise<void>;
  onTaskDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
  onOpenEdit?: () => void;
}

const AVAILABLE_TOOLS = [
  { id: 'time-tracker', name: '⏱️ Time Tracker' },
  { id: 'notes', name: '📝 Notes' },
  { id: 'pomodoro', name: '🍅 Pomodoro' },
  { id: 'analytics', name: '📊 Analytics' },
];

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  isOpen,
  onToggle,
  tasks,
  selectedTask,
  onTaskUpdate,
  onTaskDelete,
  onRefresh,
  onOpenEdit,
}) => {
  const [activeTool, setActiveTool] = useState<string>('time-tracker');

  // Listen for double-click edit event
  React.useEffect(() => {
    const handleEditEvent = (e: CustomEvent) => {
      if (e.detail?.id === selectedTask?.id) {
        onOpenEdit?.();
      }
    };
    window.addEventListener('openTaskEdit', handleEditEvent as EventListener);
    return () => window.removeEventListener('openTaskEdit', handleEditEvent as EventListener);
  }, [selectedTask, onOpenEdit]);

  if (!selectedTask) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'time-tracker':
        return (
          <TimeTracker
            tasks={tasks}
            selectedTask={selectedTask}
            onTaskUpdate={onTaskUpdate}
            onRefresh={onRefresh}
          />
        );
      case 'notes':
        return (
          <NotesPanel
            tasks={tasks}
            selectedTask={selectedTask}
            onTaskUpdate={onTaskUpdate}
            onRefresh={onRefresh}
          />
        );
      case 'pomodoro':
        return (
          <PomodoroTimer
            tasks={tasks}
            selectedTask={selectedTask}
            onTaskUpdate={onTaskUpdate}
            onRefresh={onRefresh}
          />
        );
      case 'analytics':
        return (
          <Analytics
            tasks={tasks}
            selectedTask={selectedTask}
            onTaskUpdate={onTaskUpdate}
            onRefresh={onRefresh}
          />
        );
      default:
        return null;
    }
  };

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col border-r border-mc-border bg-mc-surface overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-mc-border">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-mc-text truncate">
            {AVAILABLE_TOOLS.find(t => t.id === activeTool)?.name}
          </h2>
          <p className="text-xs text-mc-text-secondary truncate">{selectedTask.title}</p>
        </div>
        <button
          onClick={onToggle}
          className="btn-ghost text-lg p-0 w-6 h-6 flex items-center justify-center flex-shrink-0 ml-2"
          title="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Tool Tabs + Edit Button */}
      <div className="flex gap-1 p-2 border-b border-mc-border bg-mc-surface-hover overflow-x-auto">
        {AVAILABLE_TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`px-2 py-1.5 rounded text-sm transition-all duration-150 whitespace-nowrap flex-shrink-0 ${
              activeTool === tool.id
                ? 'bg-mc-primary text-white shadow-sm font-semibold'
                : 'hover:bg-mc-surface text-mc-text-secondary hover:text-mc-text'
            }`}
            title={tool.name}
          >
            {tool.name}
          </button>
        ))}
        <button
          onClick={() => onOpenEdit?.()}
          className="px-2 py-1.5 rounded text-sm transition-all duration-150 whitespace-nowrap flex-shrink-0 hover:bg-mc-surface text-mc-text-secondary hover:text-mc-text"
          title="Edit task details"
        >
          ✏️ Edit
        </button>
      </div>

      {/* Active Tool Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderActiveTool()}
      </div>


    </aside>
  );
};

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
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col border-r border-mc-border bg-mc-surface overflow-hidden animate-slide-in min-h-0">
      {/* Header - Mobile optimized */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-mc-border gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm sm:text-base text-mc-text truncate">
            {AVAILABLE_TOOLS.find(t => t.id === activeTool)?.name}
          </h2>
          <p className="text-xs text-mc-text-secondary truncate">{selectedTask.title}</p>
        </div>
        <button
          onClick={onToggle}
          className="btn-ghost text-lg p-2 w-10 h-10 flex items-center justify-center flex-shrink-0 ml-2 min-w-10 min-h-10"
          title="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Tool Tabs + Edit Button - Mobile optimized */}
      <div className="flex gap-1 p-2 sm:p-2.5 border-b border-mc-border bg-mc-surface-hover overflow-x-auto snap-x snap-mandatory">
        {AVAILABLE_TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`px-2 sm:px-3 py-2 rounded text-xs sm:text-sm transition-all duration-150 whitespace-nowrap flex-shrink-0 min-h-10 snap-start ${
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
          className="px-2 sm:px-3 py-2 rounded text-xs sm:text-sm transition-all duration-150 whitespace-nowrap flex-shrink-0 min-h-10 hover:bg-mc-surface text-mc-text-secondary hover:text-mc-text snap-start"
          title="Edit task details"
        >
          ✏️ Edit
        </button>
      </div>

      {/* Active Tool Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
        {renderActiveTool()}
      </div>


    </aside>
  );
};

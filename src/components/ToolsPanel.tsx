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
}) => {
  const [activeTool, setActiveTool] = useState<string>('time-tracker');
  const [showEditModal, setShowEditModal] = useState(false);

  // Listen for double-click edit event
  React.useEffect(() => {
    const handleEditEvent = (e: CustomEvent) => {
      if (e.detail?.id === selectedTask?.id) {
        setShowEditModal(true);
      }
    };
    window.addEventListener('openTaskEdit', handleEditEvent as EventListener);
    return () => window.removeEventListener('openTaskEdit', handleEditEvent as EventListener);
  }, [selectedTask]);

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
          onClick={() => setShowEditModal(true)}
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

      {/* Edit Modal (within the sidebar) */}
      {showEditModal && selectedTask && (
        <div className="absolute inset-0 z-50 bg-black/50 rounded-lg flex items-center justify-center p-4">
          <div className="bg-mc-surface rounded-lg p-6 max-w-sm w-full max-h-96 overflow-y-auto border border-mc-border">
            <h3 className="font-bold text-lg mb-4">Quick Edit</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-mc-text-secondary block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="quick-title"
                  defaultValue={selectedTask.title}
                  className="input w-full text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-mc-text-secondary block mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  id="quick-date"
                  defaultValue={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ''}
                  className="input w-full text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-mc-text-secondary block mb-1">
                  Priority
                </label>
                <select
                  id="quick-priority"
                  defaultValue={selectedTask.priority}
                  className="input w-full text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-mc-text-secondary block mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="quick-tags"
                  defaultValue={selectedTask.tags?.join(', ') || ''}
                  placeholder="e.g. content-pipeline, filming"
                  className="input w-full text-sm"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  onClick={async () => {
                    const title = (document.getElementById('quick-title') as HTMLInputElement)?.value || selectedTask.title;
                    const dueDate = (document.getElementById('quick-date') as HTMLInputElement)?.value;
                    const priority = (document.getElementById('quick-priority') as HTMLSelectElement)?.value;
                    const tagsInput = (document.getElementById('quick-tags') as HTMLInputElement)?.value || '';
                    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t) : [];

                    await onTaskUpdate(selectedTask.id, {
                      title,
                      dueDate: dueDate || null,
                      priority: priority as any,
                      tags,
                    });
                    setShowEditModal(false);
                  }}
                  className="btn-primary text-sm flex-1"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary text-sm flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

'use client';

import React, { useState } from 'react';
import { Task, UpdateTaskData, PRIORITY_CONFIG } from '@/lib/tools';
import { ToolsPanel } from './ToolsPanel';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface MobileTaskDetailProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  tasks: any[];
  onTaskUpdate: (id: string, data: UpdateTaskData) => Promise<void>;
  onTaskDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

/**
 * MOBILE TASK DETAIL SIDEBAR
 * Right-sliding sidebar that shows task details + tools on mobile
 * Doesn't cover the kanban board, allows swipe to close
 */
export const MobileTaskDetail: React.FC<MobileTaskDetailProps> = ({
  task,
  isOpen,
  onClose,
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onRefresh,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(task);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  React.useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!task) return null;

  const handleStatusChange = async (newStatus: Task['status']) => {
    try {
      await onTaskUpdate(task.id, { status: newStatus });
      toast.success('Task status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handlePriorityChange = async (newPriority: Task['priority']) => {
    try {
      await onTaskUpdate(task.id, { priority: newPriority });
      toast.success('Priority updated');
    } catch {
      toast.error('Failed to update priority');
    }
  };

  const handleDelete = async () => {
    try {
      await onTaskDelete(task.id);
      toast.success('Task deleted');
      setShowDeleteConfirm(false);
      onClose();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-in Sidebar */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-mc-surface border-l border-mc-border z-50 transform transition-transform duration-300 ease-out overflow-y-auto md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-mc-border sticky top-0 bg-mc-surface">
            <h2 className="font-bold text-lg text-mc-text truncate flex-1">
              {task.title}
            </h2>
            <button
              onClick={onClose}
              className="btn-ghost text-xl p-1 -mr-2 flex-shrink-0"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-mc-text-secondary block mb-2">
                Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['inbox', 'assigned', 'in_progress', 'done'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`text-xs py-2 px-3 rounded-lg font-medium transition ${
                        task.status === status
                          ? 'bg-mc-primary text-white'
                          : 'bg-mc-surface-hover text-mc-text-secondary hover:bg-mc-surface-hover/80'
                      }`}
                    >
                      {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-mc-text-secondary block mb-2">
                Priority
              </label>
              <div className="flex gap-2 flex-wrap">
                {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePriorityChange(p)}
                    className={`text-xs py-1 px-2 rounded transition ${
                      task.priority === p
                        ? PRIORITY_CONFIG[p].color + ' shadow-sm'
                        : 'bg-mc-surface-hover text-mc-text-secondary hover:bg-mc-surface-hover/80'
                    }`}
                  >
                    {PRIORITY_CONFIG[p].icon} {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-mc-text-secondary block mb-2">
                Description
              </label>
              <p className="text-sm text-mc-text bg-mc-surface-hover rounded-lg p-3">
                {task.description || '(No description)'}
              </p>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div>
                <label className="text-xs font-semibold text-mc-text-secondary block mb-2">
                  Due Date
                </label>
                <p className="text-sm text-mc-text">
                  📅 {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </p>
              </div>
            )}

            {/* Assignee & Tags */}
            <div className="grid grid-cols-2 gap-4">
              {task.assignee && (
                <div>
                  <label className="text-xs font-semibold text-mc-text-secondary block mb-2">
                    Assignee
                  </label>
                  <p className="text-sm text-mc-text">👤 {task.assignee}</p>
                </div>
              )}
              {task.tags.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-mc-text-secondary block mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-mc-primary/20 text-mc-primary rounded-full px-2 py-1"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-mc-border my-2" />

            {/* Tools Section */}
            <div>
              <h3 className="text-xs font-semibold text-mc-text-secondary mb-3">
                Tools
              </h3>
              <ToolsPanel
                isOpen={true}
                onToggle={() => {}}
                tasks={tasks}
                selectedTask={task}
                onTaskUpdate={onTaskUpdate}
                onRefresh={onRefresh}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-mc-border p-4 space-y-2 sticky bottom-0 bg-mc-surface">
            {!showDeleteConfirm ? (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-sm py-2 text-red-600 hover:bg-red-50 rounded transition opacity-70 hover:opacity-100"
                >
                  🗑️ Delete Task
                </button>
                <button
                  onClick={onClose}
                  className="w-full btn-secondary text-sm py-2"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 mb-2">
                  ⚠️ This will permanently delete the task. This cannot be undone.
                </div>
                <button
                  onClick={handleDelete}
                  className="w-full btn-danger text-sm py-2"
                >
                  Yes, Delete Task
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full btn-secondary text-sm py-2"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

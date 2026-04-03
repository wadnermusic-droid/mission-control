'use client';

import React, { useState } from 'react';
import { Task, UpdateTaskData, PRIORITY_CONFIG } from '@/lib/tools';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface TaskDetailPanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateTaskData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
  );
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(task?.tags || []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!task) return null;

  const handleSave = async () => {
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
        priority,
        tags: selectedTags,
      });
      setEditing(false);
      toast.success('Task updated');
    } catch {
      toast.error('Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await onDelete(task.id);
      setShowDeleteConfirm(false);
      onClose();
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setSubmitting(false);
    }
  };

  const priorityConfig = PRIORITY_CONFIG[priority];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-mc-surface border-l border-mc-border z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-mc-border sticky top-0 bg-mc-surface">
            <h2 className="font-bold text-lg text-mc-text truncate flex-1">
              {editing ? 'Edit Task' : task.title}
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
            {!editing ? (
              <>
                {/* View Mode */}
                <div>
                  <label className="text-xs font-semibold text-mc-text-secondary block mb-2">
                    Priority
                  </label>
                  <div className={`inline-block px-3 py-1.5 rounded-full ${priorityConfig.color}`}>
                    <span className="text-sm font-semibold">
                      {priorityConfig.icon} {priorityConfig.label}
                    </span>
                  </div>
                </div>

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

                {task.description && (
                  <div>
                    <label className="text-xs font-semibold text-mc-text-secondary block mb-2">
                      Description
                    </label>
                    <p className="text-sm text-mc-text bg-mc-surface-hover rounded p-3 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-mc-text-secondary block mb-2">
                    Tags
                  </label>
                  {task.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-mc-primary/20 text-mc-primary rounded-full px-3 py-1"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-mc-text-secondary">No tags yet. Click Edit to add them.</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <div>
                  <label className="text-xs font-semibold text-mc-text-secondary block mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-mc-text-secondary block mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input w-full min-h-[80px] resize-y"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-mc-text-secondary block mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-mc-text-secondary block mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task['priority'])}
                    className="input w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-mc-text-secondary block mb-2">
                    Tags
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="Type tag and press Enter or click Add"
                        className="input flex-1 text-sm"
                      />
                      <button onClick={addTag} className="btn-secondary text-sm px-3">
                        Add
                      </button>
                    </div>
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-mc-primary/20 text-mc-primary rounded-full px-3 py-1 flex items-center gap-2 font-medium"
                          >
                            #{tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:opacity-70 transition"
                              type="button"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {selectedTags.length === 0 && (
                      <p className="text-xs text-mc-text-secondary italic">No tags yet</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-mc-border p-4 space-y-2 sticky bottom-0 bg-mc-surface">
            {!showDeleteConfirm ? (
              <>
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={!title.trim() || submitting}
                      className="btn-primary w-full"
                    >
                      {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="btn-secondary w-full"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="btn-primary w-full"
                    >
                      ✏️ Edit Task
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-sm text-red-600 hover:bg-red-50 rounded w-full py-2 transition opacity-70 hover:opacity-100"
                    >
                      🗑️ Delete Task
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 mb-2">
                  ⚠️ This will move the task to trash. You can recover it later.
                </div>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="btn-danger w-full"
                >
                  {submitting ? 'Deleting...' : 'Yes, Delete Task'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary w-full"
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

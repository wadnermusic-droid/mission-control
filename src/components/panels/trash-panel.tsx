'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface DeletedTask {
  id: string;
  title: string;
  priority: string;
  status: string;
  deletedAt: string;
}

export default function TrashPanel() {
  const [deletedTasks, setDeletedTasks] = useState<DeletedTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrash = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/tasks/trash');
        if (res.ok) {
          const data = await res.json();
          setDeletedTasks(data.tasks || []);
        }
      } catch (error) {
        console.error('Failed to fetch trash:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrash();
  }, []);

  const handleRestore = async (taskId: string) => {
    try {
      const res = await fetch('/api/tasks/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });

      if (res.ok) {
        setDeletedTasks(prev => prev.filter(t => t.id !== taskId));
        alert('✅ Task restored!');
      }
    } catch (error) {
      console.error('Failed to restore task:', error);
      alert('❌ Failed to restore task');
    }
  };

  const handlePermanentlyDelete = async (taskId: string) => {
    if (!confirm('⚠️ This will permanently delete the task. Cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/tasks/trash?taskId=${taskId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setDeletedTasks(prev => prev.filter(t => t.id !== taskId));
        alert('✅ Task permanently deleted');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('❌ Failed to delete task');
    }
  };

  const PRIORITY_COLORS: Record<string, string> = {
    urgent: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-blue-100 text-blue-800 border-blue-300',
    low: 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-mc-text">🗑️ Trash</h1>
        <p className="text-sm text-mc-text-secondary">
          {deletedTasks.length} deleted task{deletedTasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading trash...</div>
      ) : deletedTasks.length === 0 ? (
        <div className="text-center py-12 bg-mc-surface-hover rounded-lg border-2 border-dashed border-mc-border">
          <p className="text-3xl mb-2">✨</p>
          <p className="text-sm font-semibold text-mc-text">Trash is empty</p>
          <p className="text-xs text-mc-text-secondary mt-1">
            Your deleted tasks will appear here for recovery
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2">
          {deletedTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 rounded-lg border ${PRIORITY_COLORS[task.priority] || 'bg-gray-100 border-gray-300'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm truncate">{task.title}</h3>
                  <p className="text-xs opacity-70 mt-1">
                    Deleted: {format(new Date(task.deletedAt), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded bg-black/10">
                  {task.priority}
                </span>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleRestore(task.id)}
                  className="flex-1 btn-primary text-xs py-2"
                >
                  ↩️ Restore
                </button>
                <button
                  onClick={() => handlePermanentlyDelete(task.id)}
                  className="flex-1 text-xs py-2 px-3 rounded hover:bg-red-200 transition text-red-700 font-medium"
                >
                  🗑️ Delete Forever
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-mc-text-secondary border-t border-mc-border pt-3">
        <p>💡 <strong>Recovery tip:</strong> Deleted tasks stay in trash for 30 days.</p>
      </div>
    </div>
  );
}

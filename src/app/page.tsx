'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTasks, createTask, updateTask, deleteTask } from '@/lib/api';
import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  getUniqueAssignees,
  getUniqueTags,
} from '@/lib/tools';
import { KanbanBoard } from '@/components/KanbanBoard';
import { ToolsPanel } from '@/components/ToolsPanel';
import { TaskModal } from '@/components/TaskModal';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import toast from 'react-hot-toast';

export interface Filters {
  search: string;
  priority: string;
  assignee: string;
  tag: string;
}

export default function HomePage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('User');

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          setIsAuthenticated(false);
          router.push('/login');
          return;
        }
        const data = await res.json();
        setUserName(data.user?.name || 'User');
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    priority: '',
    assignee: '',
    tag: '',
  });

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (error) {
      toast.error('Failed to load tasks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (
          !task.title.toLowerCase().includes(search) &&
          !task.description.toLowerCase().includes(search) &&
          !task.assignee.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.assignee && task.assignee !== filters.assignee) return false;
      if (filters.tag && !task.tags.includes(filters.tag)) return false;
      return true;
    });
  }, [tasks, filters]);

  const handleCreateTask = useCallback(
    async (data: CreateTaskData) => {
      try {
        const newTask = await createTask(data);
        setTasks((prev) => [...prev, newTask]);
        setShowCreateModal(false);
        toast.success('Task created');
      } catch (error) {
        toast.error('Failed to create task');
        throw error;
      }
    },
    []
  );

  const handleUpdateTask = useCallback(
    async (id: string, data: UpdateTaskData) => {
      try {
        const updated = await updateTask(id, data);
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        setSelectedTask((prev) => (prev?.id === id ? updated : prev));
        toast.success('Task updated');
      } catch (error) {
        toast.error('Failed to update task');
        throw error;
      }
    },
    []
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      try {
        await deleteTask(id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
        if (selectedTask?.id === id) setSelectedTask(null);
        toast.success('Task deleted');
      } catch (error) {
        toast.error('Failed to delete task');
        throw error;
      }
    },
    [selectedTask]
  );

  const handleMoveTask = useCallback(
    async (id: string, newStatus: Task['status']) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
      try {
        await updateTask(id, { status: newStatus });
      } catch (error) {
        loadTasks();
        toast.error('Failed to move task');
      }
    },
    [loadTasks]
  );

  const assignees = useMemo(() => getUniqueAssignees(tasks), [tasks]);
  const allTags = useMemo(() => getUniqueTags(tasks), [tasks]);

  // Show loading while authenticating or loading tasks
  if (isAuthenticated === null || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mc-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-mc-text-secondary">Loading Mission Control...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect to login)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Tools Sidebar */}
      <ToolsPanel
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        tasks={tasks}
        selectedTask={selectedTask}
        onTaskUpdate={handleUpdateTask}
        onRefresh={loadTasks}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          taskCount={tasks.length}
          onCreateTask={() => setShowCreateModal(true)}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userName={userName}
        />

        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          assignees={assignees}
          tags={allTags}
        />

        <KanbanBoard
          tasks={filteredTasks}
          onMoveTask={handleMoveTask}
          onSelectTask={setSelectedTask}
          onDeleteTask={handleDeleteTask}
          selectedTaskId={selectedTask?.id || null}
        />
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <TaskModal
          mode="create"
          onSubmit={(data) => handleCreateTask(data as CreateTaskData)}
          onClose={() => setShowCreateModal(false)}
          assignees={assignees}
          tags={allTags}
        />
      )}

      {/* Edit Task Modal */}
      {selectedTask && (
        <TaskModal
          mode="edit"
          task={selectedTask}
          onSubmit={(data) => handleUpdateTask(selectedTask.id, data)}
          onClose={() => setSelectedTask(null)}
          onDelete={() => handleDeleteTask(selectedTask.id)}
          assignees={assignees}
          tags={allTags}
        />
      )}
    </div>
  );
}

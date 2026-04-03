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
import { MobileTaskDetail } from '@/components/MobileTaskDetail';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import CalendarPanel from '@/components/panels/calendar-panel';
import AnalyticsPanel from '@/components/panels/analytics-panel';
import toast from 'react-hot-toast';

export interface Filters {
  search: string;
  priority: string;
  assignee: string;
  tag: string;
}

type ViewMode = 'kanban' | 'calendar' | 'analytics';

export default function HomePage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('User');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

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

  const handleSelectTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setSidebarOpen(true); // Auto-open sidebar when task is selected
  }, []);

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
      {/* Tools Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block">
        <ToolsPanel
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          tasks={tasks}
          selectedTask={selectedTask}
          onTaskUpdate={handleUpdateTask}
          onRefresh={loadTasks}
        />
      </div>

      {/* Tools Modal - Visible on mobile only */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="absolute bottom-0 left-0 right-0 bg-mc-surface rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
            <ToolsPanel
              isOpen={true}
              onToggle={() => setSidebarOpen(false)}
              tasks={tasks}
              selectedTask={selectedTask}
              onTaskUpdate={handleUpdateTask}
              onRefresh={loadTasks}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          taskCount={tasks.length}
          onCreateTask={() => setShowCreateModal(true)}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userName={userName}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {viewMode === 'kanban' && (
          <>
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              assignees={assignees}
              tags={allTags}
            />

            <KanbanBoard
              tasks={filteredTasks}
              onMoveTask={handleMoveTask}
              onSelectTask={handleSelectTask}
              onDeleteTask={handleDeleteTask}
              selectedTaskId={selectedTask?.id || null}
            />
          </>
        )}

        {viewMode === 'calendar' && (
          <div className="flex-1 flex flex-col p-4 min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
              <CalendarPanel onCreateTask={() => setShowCreateModal(true)} />
            </div>
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-6xl mx-auto">
              <AnalyticsPanel />
            </div>
          </div>
        )}
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

      {/* Edit Task Modal - Desktop only - Only show if explicitly opened */}
      {/* (Removed auto-open on selection to avoid blocking the sidebar) */}

      {/* Mobile Task Detail - Mobile only */}
      <MobileTaskDetail
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        tasks={tasks}
        onTaskUpdate={handleUpdateTask}
        onTaskDelete={handleDeleteTask}
        onRefresh={loadTasks}
      />
    </div>
  );
}

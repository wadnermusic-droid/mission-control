export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'inbox' | 'assigned' | 'in_progress' | 'done';
  tags: string[];
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: Task['priority'];
  status?: Task['status'];
  tags?: string[];
  assignee?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: string | null;
  priority?: Task['priority'];
  status?: Task['status'];
  tags?: string[];
  assignee?: string;
}

export interface ToolComponentProps {
  tasks: Task[];
  selectedTask: Task | null;
  onTaskUpdate: (id: string, data: UpdateTaskData) => Promise<void>;
  onRefresh: () => void;
}

export interface ToolDefinition {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: 'productivity' | 'visualization' | 'tracking' | 'utility';
}

export interface KanbanColumn {
  id: Task['status'];
  title: string;
  color: string;
  icon: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'inbox', title: 'Inbox', color: 'bg-gray-500', icon: '📥' },
  { id: 'assigned', title: 'Assigned', color: 'bg-blue-500', icon: '👤' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-500', icon: '🔄' },
  { id: 'done', title: 'Done', color: 'bg-green-500', icon: '✅' },
];

export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: '○' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: '◑' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', icon: '●' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: '🔴' },
} as const;

export const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  'time-tracker': {
    name: 'time-tracker',
    displayName: 'Time Tracker',
    description: 'Log and track hours spent on each task',
    icon: '⏱️',
    category: 'tracking',
  },
  'notes-panel': {
    name: 'notes-panel',
    displayName: 'Notes',
    description: 'Add detailed notes and comments to tasks',
    icon: '📝',
    category: 'productivity',
  },
  'calendar-view': {
    name: 'calendar-view',
    displayName: 'Calendar',
    description: 'View tasks organized by due date',
    icon: '📅',
    category: 'visualization',
  },
  'analytics': {
    name: 'analytics',
    displayName: 'Analytics',
    description: 'Task velocity, completion rates, and metrics',
    icon: '📊',
    category: 'visualization',
  },
  'pomodoro-timer': {
    name: 'pomodoro-timer',
    displayName: 'Pomodoro Timer',
    description: 'Focus timer with 25/5 minute intervals',
    icon: '🍅',
    category: 'productivity',
  },
};

export function parseTags(tags: string | string[]): string[] {
  if (Array.isArray(tags)) return tags;
  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
}

export function formatTask(raw: any): Task {
  return {
    ...raw,
    tags: parseTags(raw.tags),
    dueDate: raw.dueDate || null,
  };
}

export function getUniqueAssignees(tasks: Task[]): string[] {
  const assignees = new Set(tasks.map((t) => t.assignee).filter(Boolean));
  return Array.from(assignees).sort();
}

export function getUniqueTags(tasks: Task[]): string[] {
  const tags = new Set(tasks.flatMap((t) => t.tags));
  return Array.from(tags).sort();
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

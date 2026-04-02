import { Task, CreateTaskData, UpdateTaskData, formatTask } from './tools';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }
  return response.json();
}

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE}/tasks`, { cache: 'no-store' });
  const data = await handleResponse<any[]>(response);
  return data.map(formatTask);
}

export async function createTask(data: CreateTaskData): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await handleResponse<any>(response);
  return formatTask(result);
}

export async function updateTask(id: string, data: UpdateTaskData): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await handleResponse<any>(response);
  return formatTask(result);
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
  });
  await handleResponse(response);
}

export async function fetchTimeEntries(taskId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE}/tasks/${taskId}/time-entries`, { cache: 'no-store' });
  return handleResponse<any[]>(response);
}

export async function createTimeEntry(taskId: string, duration: number, description?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/tasks/${taskId}/time-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ duration, description }),
  });
  return handleResponse(response);
}

export async function fetchNotes(taskId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE}/tasks/${taskId}/notes`, { cache: 'no-store' });
  return handleResponse<any[]>(response);
}

export async function createNote(taskId: string, content: string): Promise<any> {
  const response = await fetch(`${API_BASE}/tasks/${taskId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return handleResponse(response);
}

export async function deleteNote(taskId: string, noteId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/tasks/${taskId}/notes/${noteId}`, {
    method: 'DELETE',
  });
  await handleResponse(response);
}

export async function fetchTools(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/tools`, { cache: 'no-store' });
  return handleResponse<any[]>(response);
}

export async function toggleTool(name: string, enabled: boolean): Promise<any> {
  const response = await fetch(`${API_BASE}/tools/${name}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  return handleResponse(response);
}

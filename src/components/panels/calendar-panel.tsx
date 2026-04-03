'use client';

import { useState, useEffect, useCallback } from 'react';

interface CalendarTask {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-red-600 font-bold',
  high: 'text-orange-600 font-semibold',
  medium: 'text-yellow-600',
  low: 'text-green-600',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface CalendarPanelProps {
  onCreateTask?: () => void;
}

export default function CalendarPanel({ onCreateTask }: CalendarPanelProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasksByDate, setTasksByDate] = useState<Record<string, CalendarTask[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateTasks, setSelectedDateTasks] = useState<CalendarTask[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const start = new Date(firstDay);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(lastDay);
        end.setDate(end.getDate() + (6 - end.getDay()));

        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        const res = await fetch(`/api/tasks/calendar?start=${startStr}&end=${endStr}`);
        if (res.ok) {
          const data = await res.json();
          setTasksByDate(data.tasksByDate || {});
        }
      } catch (error) {
        console.error('Failed to fetch calendar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-mc-text">📅 Calendar</h1>
        <div className="flex gap-2 items-center">
          {onCreateTask && (
            <button
              onClick={onCreateTask}
              className="btn-primary text-sm px-3 py-1.5"
            >
              + New Task
            </button>
          )}
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1))}
            className="p-2 hover:bg-mc-surface-hover rounded text-xl transition"
          >
            ←
          </button>
          <span className="px-4 py-2 font-semibold text-mc-text min-w-[150px] text-center">{MONTH_NAMES[month]} {year}</span>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1))}
            className="p-2 hover:bg-mc-surface-hover rounded text-xl transition"
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="border border-mc-border rounded-lg overflow-hidden bg-mc-surface flex-1 flex flex-col">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0 bg-mc-primary text-white">
            {DAY_NAMES.map(day => (
              <div key={day} className="p-3 text-center font-semibold text-sm border-r border-mc-primary last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0 border-t border-mc-border flex-1 overflow-auto">
            {days.map((date, idx) => {
              const dateStr = date.toISOString().split('T')[0];
              const tasks = tasksByDate[dateStr] || [];
              const isCurrentMonth = date.getMonth() === month;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={idx}
                  className={`h-20 p-2 border-r border-b border-mc-border overflow-hidden ${
                    isCurrentMonth 
                      ? isToday 
                        ? 'bg-mc-primary/5' 
                        : 'bg-mc-surface' 
                      : 'bg-mc-surface-hover'
                  } last:border-r-0`}
                >
                  <div className={`text-xs font-bold mb-1 ${isToday ? 'text-mc-primary text-sm' : 'text-mc-text-secondary'}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-0.5 text-[10px]">
                    {tasks.slice(0, 2).map(task => {
                      const bgColor = 
                        task.priority === 'urgent' ? 'bg-red-500 text-white' :
                        task.priority === 'high' ? 'bg-orange-500 text-white' :
                        task.priority === 'medium' ? 'bg-blue-500 text-white' :
                        'bg-green-500 text-white';
                      return (
                        <button
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Trigger task selection callback if available
                            window.dispatchEvent(new CustomEvent('selectTask', { detail: task }));
                          }}
                          className={`w-full text-left p-1 rounded truncate font-semibold leading-tight ${bgColor} hover:opacity-80 transition cursor-pointer`}
                          title={task.title}
                        >
                          {task.title.substring(0, 15)}
                        </button>
                      );
                    })}
                    {tasks.length > 2 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Show all tasks for this date
                          window.dispatchEvent(new CustomEvent('viewDateTasks', { detail: { date: dateStr, tasks } }));
                        }}
                        className="text-[9px] text-mc-text-secondary font-semibold hover:text-mc-text transition cursor-pointer"
                      >
                        +{tasks.length - 2} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

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

export default function CalendarPanel() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasksByDate, setTasksByDate] = useState<Record<string, CalendarTask[]>>({});
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1))}
            className="p-2 hover:bg-secondary rounded text-xl"
          >
            ←
          </button>
          <span className="px-4 py-2 font-semibold">{MONTH_NAMES[month]} {year}</span>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1))}
            className="p-2 hover:bg-secondary rounded text-xl"
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="border border-mc-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 bg-mc-surface-hover">
            {DAY_NAMES.map(day => (
              <div key={day} className="p-4 text-center font-semibold text-sm text-mc-text">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((date, idx) => {
              const dateStr = date.toISOString().split('T')[0];
              const tasks = tasksByDate[dateStr] || [];
              const isCurrentMonth = date.getMonth() === month;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={idx}
                  className={`min-h-[120px] p-2 border border-mc-border ${
                    isCurrentMonth 
                      ? isToday 
                        ? 'bg-mc-primary/10' 
                        : 'bg-mc-surface' 
                      : 'bg-mc-surface-hover opacity-50'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-mc-primary' : 'text-mc-text'}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {tasks.slice(0, 3).map(task => {
                      const bgColor = 
                        task.priority === 'urgent' ? 'bg-red-600 text-white' :
                        task.priority === 'high' ? 'bg-orange-600 text-white' :
                        task.priority === 'medium' ? 'bg-yellow-600 text-white' :
                        'bg-green-600 text-white';
                      return (
                        <div
                          key={task.id}
                          className={`text-xs p-1.5 rounded truncate font-semibold ${bgColor}`}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      );
                    })}
                    {tasks.length > 3 && (
                      <div className="text-xs text-mc-text-secondary font-semibold">
                        +{tasks.length - 3} more
                      </div>
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

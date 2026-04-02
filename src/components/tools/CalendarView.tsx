'use client';

import React, { useMemo, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from 'date-fns';
import { ToolComponentProps, PRIORITY_CONFIG } from '@/lib/tools';

/**
 * CALENDAR VIEW TOOL
 *
 * Displays tasks organized by their due date in a monthly calendar.
 * Clicking a day shows tasks due on that date.
 */
export const CalendarView: React.FC<ToolComponentProps> = ({ tasks }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Map tasks to dates
  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    tasks.forEach((task) => {
      if (task.dueDate) {
        const key = format(new Date(task.dueDate), 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    });
    return map;
  }, [tasks]);

  const selectedDateTasks = selectedDate
    ? tasksByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  const tasksWithoutDates = tasks.filter((t) => !t.dueDate);

  return (
    <div className="space-y-3">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="btn-ghost text-sm"
        >
          ◀
        </button>
        <h3 className="font-semibold text-sm text-mc-text">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="btn-ghost text-sm"
        >
          ▶
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-mc-text-secondary py-1"
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayTasks = tasksByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <button
              key={dateKey}
              onClick={() => setSelectedDate(day)}
              className={`
                relative p-1 text-xs rounded-lg transition-all duration-100 min-h-[32px]
                ${!isCurrentMonth ? 'text-mc-text-secondary/40' : 'text-mc-text'}
                ${isSelected ? 'bg-mc-primary text-white' : ''}
                ${today && !isSelected ? 'ring-1 ring-mc-primary' : ''}
                ${dayTasks.length > 0 && !isSelected ? 'bg-mc-primary/10 font-medium' : ''}
                hover:bg-mc-surface-hover
              `}
            >
              {format(day, 'd')}
              {dayTasks.length > 0 && (
                <span
                  className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-mc-primary'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <div className="mt-3">
          <h4 className="text-xs font-semibold text-mc-text-secondary mb-2">
            {format(selectedDate, 'MMMM d, yyyy')} (
            {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''})
          </h4>
          {selectedDateTasks.length > 0 ? (
            <div className="space-y-1.5">
              {selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-2 rounded-lg bg-mc-surface-hover text-xs flex items-center gap-2"
                >
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      PRIORITY_CONFIG[task.priority].color
                    }`}
                  >
                    {PRIORITY_CONFIG[task.priority].icon}
                  </span>
                  <span className="text-mc-text truncate flex-1">{task.title}</span>
                  <span className="text-mc-text-secondary capitalize">
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-mc-text-secondary text-center py-2">
              No tasks on this date
            </p>
          )}
        </div>
      )}

      {/* Tasks without dates */}
      {tasksWithoutDates.length > 0 && (
        <div className="mt-2 pt-2 border-t border-mc-border">
          <p className="text-xs text-mc-text-secondary">
            ⚠️ {tasksWithoutDates.length} task
            {tasksWithoutDates.length !== 1 ? 's' : ''} without due dates
          </p>
        </div>
      )}
    </div>
  );
};

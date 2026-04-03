'use client';

import React from 'react';
import { format, isPast, isToday } from 'date-fns';
import { Task, PRIORITY_CONFIG } from '@/lib/tools';

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isDragging,
  isSelected,
  onClick,
  onDelete,
}) => {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`task-card ${isDragging ? 'task-card-dragging' : ''} ${
        isSelected ? 'task-card-selected' : ''
      } cursor-pointer hover:shadow-md active:shadow-lg transition-shadow active:scale-95`}
    >
      {/* Priority & Delete */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className={`text-xs sm:text-sm font-medium px-2 py-1 sm:py-0.5 rounded-full ${priorityConfig.color}`}>
          {priorityConfig.icon} <span className="hidden sm:inline">{priorityConfig.label}</span>
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 md:group-hover:opacity-100 hover:opacity-100 md:opacity-0 text-mc-text-secondary hover:text-red-500 transition-opacity p-2 min-w-10 min-h-10 flex items-center justify-center -mr-2"
          title="Delete task"
        >
          🗑️
        </button>
      </div>

      {/* Title */}
      <h3 className="font-medium text-sm sm:text-base mb-1 text-mc-text line-clamp-2">{task.title}</h3>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs sm:text-sm text-mc-text-secondary line-clamp-2 mb-2">{task.description}</p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded bg-mc-primary/10 text-mc-primary truncate"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="text-xs text-mc-text-secondary">+{task.tags.length - 2}</span>
          )}
        </div>
      )}

      {/* Footer: Due date & Assignee */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-mc-border text-xs sm:text-sm">
        {task.dueDate ? (
          <span
            className={`${
              isOverdue
                ? 'text-red-500 font-medium'
                : isDueToday
                  ? 'text-yellow-600 dark:text-yellow-400 font-medium'
                  : 'text-mc-text-secondary'
            }`}
          >
            {isOverdue ? '⚠️ ' : isDueToday ? '📌 ' : '📅 '}
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        ) : (
          <span />
        )}
        {task.assignee && (
          <span className="text-mc-text-secondary flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-mc-primary/20 text-mc-primary text-[10px] flex items-center justify-center font-medium flex-shrink-0">
              {task.assignee.charAt(0).toUpperCase()}
            </span>
            <span className="max-w-[80px] truncate hidden sm:inline">{task.assignee}</span>
          </span>
        )}
      </div>
    </div>
  );
};

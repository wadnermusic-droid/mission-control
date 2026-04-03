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
      } cursor-pointer hover:shadow-md transition-shadow`}
    >
      {/* Priority & Delete */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityConfig.color}`}>
          {priorityConfig.icon} {priorityConfig.label}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-mc-text-secondary hover:text-red-500 transition-opacity p-1"
          title="Delete task"
        >
          🗑️
        </button>
      </div>

      {/* Title */}
      <h3 className="font-medium text-sm mb-1 text-mc-text line-clamp-2">{task.title}</h3>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-mc-text-secondary line-clamp-2 mb-2">{task.description}</p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded bg-mc-primary/10 text-mc-primary"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs text-mc-text-secondary">+{task.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer: Due date & Assignee */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-mc-border">
        {task.dueDate ? (
          <span
            className={`text-xs ${
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
          <span className="text-xs text-mc-text-secondary flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-mc-primary/20 text-mc-primary text-[10px] flex items-center justify-center font-medium">
              {task.assignee.charAt(0).toUpperCase()}
            </span>
            <span className="max-w-[80px] truncate">{task.assignee}</span>
          </span>
        )}
      </div>
    </div>
  );
};

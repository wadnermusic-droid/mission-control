'use client';

import React from 'react';
import type { Filters } from '@/app/page';

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  assignees: string[];
  tags: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  assignees,
  tags,
}) => {
  const hasActiveFilters =
    filters.search || filters.priority || filters.assignee || filters.tag;

  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ search: '', priority: '', assignee: '', tag: '' });
  };

  return (
    <div className="px-2 lg:px-4 py-2 border-b border-mc-border flex flex-wrap items-center gap-1 lg:gap-2 justify-between overflow-x-auto">
      {/* Filters on Left - Responsive */}
      <div className="flex flex-nowrap items-center gap-1 lg:gap-2 overflow-x-auto">
        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={(e) => updateFilter('priority', e.target.value)}
          className="input input-sm w-auto min-w-[100px] lg:min-w-[130px] text-xs lg:text-sm"
        >
          <option value="">Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        {/* Assignee Filter */}
        <select
          value={filters.assignee}
          onChange={(e) => updateFilter('assignee', e.target.value)}
          className="input input-sm w-auto min-w-[110px] lg:min-w-[140px] text-xs lg:text-sm"
        >
          <option value="">Assignee</option>
          {assignees.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        {/* Tag Filter */}
        <select
          value={filters.tag}
          onChange={(e) => updateFilter('tag', e.target.value)}
          className="input input-sm w-auto min-w-[90px] lg:min-w-[120px] text-xs lg:text-sm"
        >
          <option value="">Tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button onClick={clearFilters} className="btn-ghost text-sm text-red-500">
            ✕ Clear
          </button>
        )}
      </div>

      {/* Search on Right - Hidden on mobile, shown on desktop */}
      <div className="relative hidden lg:block w-64">
        {!filters.search && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-mc-text-secondary pointer-events-none">
            🔍
          </span>
        )}
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className={filters.search ? 'input input-sm pr-3 w-full' : 'input input-sm pr-9 w-full'}
        />
      </div>
    </div>
  );
};

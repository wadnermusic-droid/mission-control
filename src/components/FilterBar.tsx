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
    <div className="px-4 py-2 border-b border-mc-border flex flex-wrap items-center gap-2 justify-between">
      {/* Filters on Left */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={(e) => updateFilter('priority', e.target.value)}
          className="input input-sm w-auto min-w-[130px]"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        {/* Assignee Filter */}
        <select
          value={filters.assignee}
          onChange={(e) => updateFilter('assignee', e.target.value)}
          className="input input-sm w-auto min-w-[140px]"
        >
          <option value="">All Assignees</option>
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
          className="input input-sm w-auto min-w-[120px]"
        >
          <option value="">All Tags</option>
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

      {/* Search on Right */}
      <div className="relative w-64">
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

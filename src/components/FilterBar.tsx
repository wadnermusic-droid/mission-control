'use client';

import React, { useState } from 'react';
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const hasActiveFilters =
    filters.search || filters.priority || filters.assignee || filters.tag;

  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ search: '', priority: '', assignee: '', tag: '' });
  };

  return (
    <>
      <div className="px-2 lg:px-4 py-2 border-b border-mc-border flex items-center justify-between gap-2">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className={`md:hidden btn-secondary text-xs px-3 py-1.5 flex items-center gap-2 ${hasActiveFilters ? 'border-mc-primary text-mc-primary' : ''}`}
        >
          🧮 Filters
          {hasActiveFilters && <span className="text-[10px] bg-mc-primary text-white px-1.5 py-0.5 rounded-full">!</span>}
        </button>

        <div className="hidden md:flex items-center gap-2 flex-1">
          <select
            value={filters.priority}
            onChange={(e) => updateFilter('priority', e.target.value)}
            className="input input-sm w-auto min-w-[120px]"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={filters.assignee}
            onChange={(e) => updateFilter('assignee', e.target.value)}
            className="input input-sm w-auto min-w-[140px]"
          >
            <option value="">Assignee</option>
            {assignees.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select
            value={filters.tag}
            onChange={(e) => updateFilter('tag', e.target.value)}
            className="input input-sm w-auto min-w-[120px]"
          >
            <option value="">Tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-ghost text-sm text-red-500">
              ✕ Clear
            </button>
          )}
        </div>

        <div className="relative hidden md:block w-64">
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

        <button
          onClick={clearFilters}
          className="md:hidden text-xs text-red-500 underline"
          disabled={!hasActiveFilters}
        >
          Clear
        </button>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-mc-surface rounded-t-2xl p-4 space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-mc-text">Filters</h3>
              <button className="btn-ghost" onClick={() => setMobileFiltersOpen(false)}>
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-mc-text-secondary mb-1 block">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Search tasks..."
                  className="input input-sm"
                />
              </div>
              <div>
                <label className="text-xs text-mc-text-secondary mb-1 block">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => updateFilter('priority', e.target.value)}
                  className="input input-sm"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-mc-text-secondary mb-1 block">Assignee</label>
                <select
                  value={filters.assignee}
                  onChange={(e) => updateFilter('assignee', e.target.value)}
                  className="input input-sm"
                >
                  <option value="">Any</option>
                  {assignees.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-mc-text-secondary mb-1 block">Tag</label>
                <select
                  value={filters.tag}
                  onChange={(e) => updateFilter('tag', e.target.value)}
                  className="input input-sm"
                >
                  <option value="">Any</option>
                  {tags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button className="btn-secondary flex-1" onClick={clearFilters}>
                Reset
              </button>
              <button
                className="btn-primary flex-1"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

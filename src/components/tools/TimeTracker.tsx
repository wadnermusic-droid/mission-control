'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ToolComponentProps, formatDuration } from '@/lib/tools';
import { fetchTimeEntries, createTimeEntry } from '@/lib/api';

export const TimeTracker: React.FC<ToolComponentProps> = ({
  selectedTask,
}) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [description, setDescription] = useState('');

  const loadEntries = useCallback(async () => {
    if (!selectedTask) return;
    setLoading(true);
    try {
      const data = await fetchTimeEntries(selectedTask.id);
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTask]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleStartStop = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleSaveEntry = async () => {
    if (!selectedTask || timerSeconds === 0) return;

    setIsTimerRunning(false);
    try {
      await createTimeEntry(selectedTask.id, timerSeconds, description);
      setTimerSeconds(0);
      setDescription('');
      loadEntries();
    } catch {
      // Error handled
    }
  };

  const handleManualAdd = async () => {
    if (!selectedTask) return;
    const minutes = prompt('Enter minutes to log:');
    if (!minutes || isNaN(Number(minutes))) return;

    try {
      await createTimeEntry(selectedTask.id, Number(minutes) * 60, 'Manual entry');
      loadEntries();
    } catch {
      // Error handled
    }
  };

  const totalTime = entries.reduce((sum, e) => sum + e.duration, 0);

  if (!selectedTask) {
    return (
      <div className="text-center py-6 text-mc-text-secondary text-sm">
        <p className="text-2xl mb-2">⏱️</p>
        <p>Select a task to track time</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current task */}
      <div className="text-sm">
        <span className="text-mc-text-secondary">Tracking: </span>
        <span className="font-medium text-mc-text">{selectedTask.title}</span>
      </div>

      {/* Timer */}
      <div className="text-center py-4 bg-mc-surface-hover rounded-xl">
        <div className="text-3xl font-mono font-bold text-mc-text mb-3">
          {formatDuration(timerSeconds)}
        </div>
        <div className="flex justify-center gap-2">
          <button
            onClick={handleStartStop}
            className={isTimerRunning ? 'btn-danger text-sm' : 'btn-primary text-sm'}
          >
            {isTimerRunning ? '⏸ Pause' : '▶ Start'}
          </button>
          {timerSeconds > 0 && !isTimerRunning && (
            <button onClick={handleSaveEntry} className="btn-primary text-sm">
              💾 Save
            </button>
          )}
          {timerSeconds > 0 && (
            <button
              onClick={() => {
                setTimerSeconds(0);
                setIsTimerRunning(false);
              }}
              className="btn-ghost text-sm"
            >
              Reset
            </button>
          )}
        </div>
        {isTimerRunning && (
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
            className="input input-sm mt-3 max-w-[250px] mx-auto"
          />
        )}
      </div>

      {/* Manual add */}
      <button onClick={handleManualAdd} className="btn-ghost text-sm w-full">
        ➕ Add time manually
      </button>

      {/* Total */}
      <div className="flex items-center justify-between text-sm py-2 px-3 bg-mc-primary/5 rounded-lg">
        <span className="text-mc-text-secondary">Total logged</span>
        <span className="font-bold text-mc-primary">{formatDuration(totalTime)}</span>
      </div>

      {/* Entries list */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-mc-text-secondary">Recent Entries</h4>
          <div className="space-y-1">
            {entries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between text-xs p-2 bg-mc-surface-hover rounded"
              >
                <span className="text-mc-text-secondary">{entry.description || 'Time entry'}</span>
                <span className="font-medium text-mc-text">{formatDuration(entry.duration)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ToolComponentProps, formatDuration } from '@/lib/tools';
import { createTimeEntry } from '@/lib/api';

type TimerMode = 'work' | 'short_break' | 'long_break';

const DURATIONS: Record<TimerMode, number> = {
  work: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

const MODE_LABELS: Record<
  TimerMode,
  { label: string; emoji: string; color: string }
> = {
  work: { label: 'Focus Time', emoji: '🍅', color: 'text-red-500' },
  short_break: { label: 'Short Break', emoji: '☕', color: 'text-green-500' },
  long_break: { label: 'Long Break', emoji: '🌴', color: 'text-blue-500' },
};

export const PomodoroTimer: React.FC<ToolComponentProps> = ({ selectedTask }) => {
  const [mode, setMode] = useState<TimerMode>('work');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentModeConfig = MODE_LABELS[mode];
  const totalSeconds = DURATIONS[mode];
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, secondsLeft]);

  const handleTimerComplete = async () => {
    setIsRunning(false);

    // Play notification
    if ('Notification' in window && (Notification as any)?.permission === 'granted') {
      new (Notification as any)('Mission Control', {
        body: `${currentModeConfig.label} completed!`,
      });
    }

    if (mode === 'work') {
      setPomodoroCount((c) => c + 1);
      setSessionsCompleted((s) => s + 1);

      // Log time entry
      if (selectedTask) {
        try {
          await createTimeEntry(selectedTask.id, DURATIONS.work, 'Pomodoro work session');
        } catch {
          // Error handled silently
        }
      }

      // Determine next mode
      const nextMode = pomodoroCount % 4 === 3 ? ('long_break' as TimerMode) : ('short_break' as TimerMode);
      setMode(nextMode);
      setSecondsLeft(DURATIONS[nextMode]);
    } else {
      setMode('work');
      setSecondsLeft(DURATIONS.work);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(DURATIONS[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setSecondsLeft(DURATIONS[newMode]);
  };

  return (
    <div className="space-y-4">
      {/* Timer Display */}
      <div className="text-center py-6">
        <div className="relative inline-flex items-center justify-center w-40 h-40">
          <svg
            className="absolute w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              className="text-mc-surface-hover"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              className={currentModeConfig.color}
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-mc-text">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className={`text-xs font-medium ${currentModeConfig.color}`}>
              {currentModeConfig.emoji} {currentModeConfig.label}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <button
          onClick={toggleTimer}
          className={`${isRunning ? 'btn-danger' : 'btn-primary'} px-6`}
        >
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        <button onClick={resetTimer} className="btn-secondary">
          ↺ Reset
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center gap-2 text-xs">
        <button
          onClick={() => switchMode('work')}
          className={`px-2 py-1 rounded ${
            mode === 'work'
              ? 'bg-mc-primary text-white'
              : 'bg-mc-surface-hover text-mc-text'
          }`}
        >
          🍅 Work
        </button>
        <button
          onClick={() => switchMode('short_break')}
          className={`px-2 py-1 rounded ${
            mode === 'short_break'
              ? 'bg-mc-primary text-white'
              : 'bg-mc-surface-hover text-mc-text'
          }`}
        >
          ☕ Short
        </button>
        <button
          onClick={() => switchMode('long_break')}
          className={`px-2 py-1 rounded ${
            mode === 'long_break'
              ? 'bg-mc-primary text-white'
              : 'bg-mc-surface-hover text-mc-text'
          }`}
        >
          🌴 Long
        </button>
      </div>

      {/* Current Task */}
      {selectedTask && (
        <div className="text-center text-xs text-mc-text-secondary">
          Working on:{' '}
          <span className="font-medium text-mc-text">{selectedTask.title}</span>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-around text-center pt-2 border-t border-mc-border">
        <div>
          <div className="text-lg font-bold text-mc-text">{pomodoroCount}</div>
          <div className="text-xs text-mc-text-secondary">🍅 Today</div>
        </div>
        <div>
          <div className="text-lg font-bold text-mc-text">{sessionsCompleted}</div>
          <div className="text-xs text-mc-text-secondary">Sessions</div>
        </div>
        <div>
          <div className="text-lg font-bold text-mc-text">
            {formatDuration(pomodoroCount * DURATIONS.work)}
          </div>
          <div className="text-xs text-mc-text-secondary">Focus Time</div>
        </div>
      </div>

      {/* Request notification permission */}
      {'Notification' in window &&
        (Notification as any)?.permission === 'default' && (
          <button
            onClick={() => (Notification as any).requestPermission()}
            className="btn-ghost text-xs w-full"
          >
            🔔 Enable notifications for timer alerts
          </button>
        )}
    </div>
  );
};

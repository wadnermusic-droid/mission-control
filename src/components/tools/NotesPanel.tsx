'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ToolComponentProps } from '@/lib/tools';
import { fetchNotes, createNote, deleteNote } from '@/lib/api';
import { format } from 'date-fns';

/**
 * NOTES PANEL TOOL
 *
 * Allows adding detailed notes/comments to the selected task.
 * Notes are stored separately from the task description for
 * ongoing commentary and updates.
 */
export const NotesPanel: React.FC<ToolComponentProps> = ({ selectedTask }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadNotes = useCallback(async () => {
    if (!selectedTask) return;
    setLoading(true);
    try {
      const data = await fetchNotes(selectedTask.id);
      setNotes(data);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTask]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleAddNote = async () => {
    if (!selectedTask || !newNote.trim()) return;
    setSubmitting(true);
    try {
      await createNote(selectedTask.id, newNote.trim());
      setNewNote('');
      loadNotes();
    } catch {
      // Error handled
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!selectedTask) return;
    try {
      await deleteNote(selectedTask.id, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch {
      // Error handled
    }
  };

  if (!selectedTask) {
    return (
      <div className="text-center py-6 text-mc-text-secondary text-sm">
        <p className="text-2xl mb-2">📝</p>
        <p>Select a task to view notes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm">
        <span className="text-mc-text-secondary">Notes for: </span>
        <span className="font-medium text-mc-text">{selectedTask.title}</span>
      </div>

      {/* Add Note */}
      <div className="space-y-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a note..."
          className="input text-sm min-h-[80px] resize-y"
          rows={3}
        />
        <button
          onClick={handleAddNote}
          disabled={!newNote.trim() || submitting}
          className="btn-primary text-sm w-full"
        >
          {submitting ? 'Adding...' : '📝 Add Note'}
        </button>
      </div>

      {/* Notes List */}
      {loading ? (
        <p className="text-center text-sm text-mc-text-secondary">Loading...</p>
      ) : notes.length > 0 ? (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-lg bg-mc-surface-hover border border-mc-border group"
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs text-mc-text-secondary">
                  {format(new Date(note.createdAt), 'MMM d, yyyy HH:mm')}
                </span>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700 transition-opacity"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-mc-text whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-xs text-mc-text-secondary py-4">
          No notes yet. Add one above!
        </p>
      )}
    </div>
  );
};

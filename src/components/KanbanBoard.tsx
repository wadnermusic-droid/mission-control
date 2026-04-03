'use client';

import React from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { Task, KANBAN_COLUMNS } from '@/lib/tools';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  onMoveTask: (id: string, newStatus: Task['status']) => void;
  onSelectTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  selectedTaskId: string | null;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onMoveTask,
  onSelectTask,
  onDeleteTask,
  selectedTaskId,
}) => {
  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;
    if (result.source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as Task['status'];
    onMoveTask(draggableId, newStatus);
  };

  const tasksByStatus = KANBAN_COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  return (
    <div className="flex-1 overflow-hidden p-2 md:p-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 h-full w-full overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0">
          {KANBAN_COLUMNS.map((column) => (
            <div
              key={column.id}
              className="flex-1 min-w-[85vw] md:min-w-[280px] lg:min-w-0 flex flex-col snap-start md:snap-none"
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-lg">{column.icon}</span>
                <h2 className="font-semibold text-sm md:text-base text-mc-text">{column.title}</h2>
                <span className="ml-auto text-xs md:text-sm text-mc-text-secondary bg-mc-surface-hover rounded-full px-2 py-0.5">
                  {tasksByStatus[column.id]?.length || 0}
                </span>
              </div>

              {/* Droppable Column */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`kanban-column flex-1 overflow-y-auto ${
                      snapshot.isDraggingOver ? 'kanban-column-dragging-over' : ''
                    }`}
                  >
                    {tasksByStatus[column.id]?.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTask(task);
                            }}
                            className="cursor-pointer"
                          >
                            <TaskCard
                              task={task}
                              isDragging={snapshot.isDragging}
                              isSelected={task.id === selectedTaskId}
                              onClick={() => onSelectTask(task)}
                              onDelete={() => onDeleteTask(task.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Empty state */}
                    {(!tasksByStatus[column.id] ||
                      tasksByStatus[column.id].length === 0) && (
                      <div className="text-center py-8 text-mc-text-secondary text-sm">
                        <p className="text-2xl mb-2 opacity-50">{column.icon}</p>
                        <p>No tasks</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

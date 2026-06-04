import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { secureEntity } from '@/lib/secureEntities';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import { TASK_COLUMNS } from '@/lib/taskUtils';

export default function TaskBoard({ tasks = [], onEdit, onAdd, onChanged }) {
  const [items, setItems] = useState(tasks);

  React.useEffect(() => setItems(tasks), [tasks]);

  const grouped = TASK_COLUMNS.map((col) => ({
    ...col,
    tasks: items
      .filter((t) => t.status === col.key)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }));

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const moved = items.find((t) => t.id === draggableId);
    if (!moved) return;

    // Optimistic update
    const updated = items.map((t) =>
      t.id === draggableId
        ? { ...t, status: newStatus, completed_date: newStatus === 'done' ? new Date().toISOString() : t.completed_date }
        : t
    );
    setItems(updated);

    try {
      await secureEntity('ProjectTask').update(draggableId, {
        status: newStatus,
        order: destination.index,
        completed_date: newStatus === 'done' ? new Date().toISOString() : moved.completed_date
      });
      onChanged?.();
    } catch (e) {
      console.error(e);
      setItems(tasks); // revert
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {grouped.map((col) => (
          <Droppable droppableId={col.key} key={col.key}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`rounded-xl p-2.5 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-indigo-50' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between px-1 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full bg-${col.color}-500`} />
                    <h3 className="text-xs font-bold text-slate-900">{col.label}</h3>
                    <span className="text-[11px] text-slate-400 tabular-nums">{col.tasks.length}</span>
                  </div>
                  {col.key === 'todo' && (
                    <button onClick={onAdd} className="text-slate-400 hover:text-indigo-600">
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2 min-h-[60px]">
                  {col.tasks.map((task, idx) => (
                    <Draggable draggableId={task.id} index={idx} key={task.id}>
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={snap.isDragging ? 'opacity-90 rotate-1' : ''}
                        >
                          <TaskCard task={task} allTasks={items} onClick={onEdit} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
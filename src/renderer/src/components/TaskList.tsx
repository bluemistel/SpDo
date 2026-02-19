import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, Status, Tag } from '../types'
import { TaskItem } from './TaskItem'

interface TaskListProps {
    tasks: Task[]
    statuses: Status[]
    tags: Tag[]
    onReorder: (tasks: Task[]) => void
    onDelete: (id: string) => void
    onStatusChange: (id: string, statusId: string) => void
    onEditTask: (id: string, updates: Partial<Task>) => void
}

export function TaskList({ tasks, statuses, tags, onReorder, onDelete, onStatusChange, onEditTask }: TaskListProps): JSX.Element {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    )

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = tasks.findIndex((t) => t.id === active.id)
            const newIndex = tasks.findIndex((t) => t.id === over.id)
            onReorder(arrayMove(tasks, oldIndex, newIndex))
        }
    }

    if (tasks.length === 0) {
        return (
            <div className="text-center text-gray-400 text-sm py-8">
                <p>タスクがありません</p>
            </div>
        )
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {tasks.map((task) => {
                        return (
                            <TaskItem
                                key={task.id}
                                task={task}
                                statuses={statuses}
                                tags={tags}
                                onDelete={onDelete}
                                onStatusChange={onStatusChange}
                                onEditTask={onEditTask}
                            />
                        )
                    })}
                </div>
            </SortableContext>
        </DndContext>
    )
}

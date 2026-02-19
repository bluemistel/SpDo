import { useMemo } from 'react'
import { Task, Status, Tag } from '../types'
import { TaskList } from './TaskList'

interface KanbanViewProps {
    tasks: Task[]
    statuses: Status[]
    tags: Tag[]
    onDelete: (id: string) => void
    onStatusChange: (id: string, statusId: string) => void
    onEditTask: (id: string, updates: Partial<Task>) => void
    onReorder: (tasks: Task[]) => void
}

export function KanbanView({
    tasks,
    statuses,
    tags,
    onDelete,
    onStatusChange,
    onEditTask,
    onReorder
}: KanbanViewProps): JSX.Element {

    // Group tasks by status
    const tasksByStatus = useMemo(() => {
        const grouped: Record<string, Task[]> = {}
        statuses.forEach(status => {
            grouped[status.id] = tasks.filter(task => task.statusId === status.id)
        })
        return grouped
    }, [tasks, statuses])

    return (
        <div className="h-full overflow-x-auto">
            <div className="flex flex-col lg:flex-row gap-4 h-full min-w-full pb-2">
                {statuses.map((status) => (
                    <div
                        key={status.id}
                        className="flex-1 min-w-[300px] flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 h-full max-h-full"
                    >
                        <div
                            className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-gray-50 dark:bg-gray-800 z-10"
                            style={{ borderTop: `3px solid ${status.color}` }}
                        >
                            <h3 className="font-medium text-gray-700 dark:text-gray-200 text-sm flex items-center gap-2">
                                {status.label}
                                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                                    {tasksByStatus[status.id]?.length || 0}
                                </span>
                            </h3>
                        </div>

                        <div className="p-2 flex-1 overflow-y-auto custom-scrollbar">
                            <TaskList
                                tasks={tasksByStatus[status.id] || []}
                                statuses={statuses}
                                tags={tags}
                                onReorder={(reorderedTasks) => {
                                    // This local reorder only affects this column
                                    // We need to merge with other tasks to update main state
                                    const otherTasks = tasks.filter(t => t.statusId !== status.id)
                                    onReorder([...otherTasks, ...reorderedTasks])
                                }}
                                onDelete={onDelete}
                                onStatusChange={onStatusChange}
                                onEditTask={onEditTask}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Calendar, Trash2, Edit2, Check, X, Tag as TagIcon, Archive } from 'lucide-react'
import { Task, Status, Tag } from '../types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { StatusDropdown } from './StatusDropdown'

interface TaskItemProps {
    task: Task
    statuses: Status[]
    tags: Tag[]
    onDelete: (id: string) => void
    onStatusChange: (id: string, statusId: string) => void
    onEditTask: (id: string, updates: Partial<Task>) => void
}

export function TaskItem({ task, statuses, tags, onDelete, onStatusChange, onEditTask }: TaskItemProps): JSX.Element {
    const [isEditing, setIsEditing] = useState(false)
    const [editDueDate, setEditDueDate] = useState(format(task.dueDate, 'yyyy-MM-dd'))
    const [editTags, setEditTags] = useState<string[]>(task.tags)

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    }

    const isOverdue = task.dueDate < Date.now() && task.statusId !== 'done'

    const handleSaveEdit = () => {
        const newDueDate = new Date(editDueDate).getTime()
        onEditTask(task.id, {
            dueDate: newDueDate,
            tags: editTags
        })
        setIsEditing(false)
    }

    const handleCancelEdit = () => {
        setEditDueDate(format(task.dueDate, 'yyyy-MM-dd'))
        setEditTags(task.tags)
        setIsEditing(false)
    }

    const toggleEditTag = (tagId: string) => {
        setEditTags((prev) =>
            prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
        )
    }

    if (isEditing) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-purple-300 dark:border-purple-700 p-3 mb-2"
            >
                <div className="flex items-start gap-2">
                    <div className="mt-1">
                        <GripVertical size={16} className="text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">{task.title}</p>
                        <div className="space-y-2">
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">期限</label>
                                <input
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                                    <TagIcon size={12} />
                                    タグ
                                </label>
                                <div className="flex flex-wrap gap-1">
                                    {tags.map((tag) => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleEditTag(tag.id)}
                                            className={`text-xs px-2 py-1 rounded-full transition-all ${editTags.includes(tag.id) ? 'opacity-100 font-medium' : 'opacity-50'
                                                }`}
                                            style={{ backgroundColor: tag.color + '30', color: tag.color }}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={handleSaveEdit}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                                title="保存"
                            >
                                <Check size={12} />
                                保存
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                title="キャンセル"
                            >
                                <X size={12} />
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-2 hover:shadow-md dark:hover:bg-gray-700/50 transition-all"
        >
            <div className="flex items-start gap-2">
                <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
                    <GripVertical size={16} className="text-gray-400" />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 break-words">
                            {task.title}
                            {task.archived && (
                                <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded border border-gray-200 dark:border-gray-600 font-normal">
                                    アーカイブ済み
                                </span>
                            )}
                        </p>
                        <div className="flex gap-1 flex-shrink-0">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-gray-400 hover:text-blue-500 transition-colors"
                                title="編集"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button
                                onClick={() => onEditTask(task.id, { archived: !task.archived })}
                                className="text-gray-400 hover:text-amber-500 transition-colors"
                                title={task.archived ? '元に戻す' : 'アーカイブ'}
                            >
                                <Archive size={14} />
                            </button>
                            <button
                                onClick={() => onDelete(task.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="削除"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <StatusDropdown
                            currentStatusId={task.statusId}
                            statuses={statuses}
                            onStatusChange={(statusId) => onStatusChange(task.id, statusId)}
                        />
                        <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            <Calendar size={12} />
                            <span>{format(task.dueDate, 'M/d', { locale: ja })}</span>
                        </div>
                        {task.tags.length > 0 && (
                            <div className="flex gap-1">
                                {task.tags.slice(0, 2).map((tagId) => {
                                    const tag = tags.find((t) => t.id === tagId)
                                    return tag ? (
                                        <span
                                            key={tagId}
                                            className="text-xs px-1.5 py-0.5 rounded-full"
                                            style={{ backgroundColor: tag.color + '30', color: tag.color }}
                                        >
                                            {tag.name}
                                        </span>
                                    ) : null
                                })}
                                {task.tags.length > 2 && (
                                    <span className="text-xs text-gray-400">+{task.tags.length - 2}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

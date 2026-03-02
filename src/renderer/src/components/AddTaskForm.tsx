import { useState } from 'react'
import { Plus, Tag as TagIcon, X } from 'lucide-react'
import { Tag } from '../types'

const TAG_COLORS = [
    { name: '青', value: '#3b82f6' },
    { name: '緑', value: '#10b981' },
    { name: '赤', value: '#ef4444' },
    { name: '黄', value: '#eab308' },
    { name: '橙', value: '#f97316' },
    { name: '紫', value: '#8b5cf6' },
    { name: '灰', value: '#6b7280' }
]

interface AddTaskFormProps {
    onAdd: (title: string, dueDate: number, tags: string[]) => void
    tags: Tag[]
    onCreateTag: (name: string, color: string) => void
    onDeleteTag: (tagId: string) => void
}

export function AddTaskForm({ onAdd, tags, onCreateTag, onDeleteTag }: AddTaskFormProps): JSX.Element {
    const [isOpen, setIsOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [showTagCreate, setShowTagCreate] = useState(false)
    const [newTagName, setNewTagName] = useState('')
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const [isDeleteMode, setIsDeleteMode] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        const dueDateTimestamp = dueDate
            ? new Date(dueDate).getTime()
            : Date.now() + 24 * 60 * 60 * 1000 // Default: tomorrow

        onAdd(title, dueDateTimestamp, selectedTags)
        setTitle('')
        setDueDate('')
        setSelectedTags([])
        setIsOpen(false)
    }

    const handleCreateTag = () => {
        if (!newTagName.trim()) return

        // Use selected color or auto-assign based on existing tags count
        const color = selectedColor || TAG_COLORS[tags.length % TAG_COLORS.length].value

        onCreateTag(newTagName, color)
        setNewTagName('')
        setSelectedColor(null)
        setShowTagCreate(false)
    }

    const toggleTag = (tagId: string) => {
        setSelectedTags((prev) =>
            prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
        )
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-accent text-white rounded-md transition-all shadow-sm"
            >
                <Plus size={16} />
                <span className="text-sm font-medium">タスクを追加</span>
            </button>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-purple-200 dark:border-purple-900/50 p-3 mb-3">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タスク名"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                autoFocus
            />
            <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                        <TagIcon size={12} />
                        タグ
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsDeleteMode(!isDeleteMode)
                                if (showTagCreate) setShowTagCreate(false)
                            }}
                            className="text-xs text-accent hover:opacity-80"
                        >
                            {isDeleteMode ? '戻る' : '削除'}
                        </button>
                        {!isDeleteMode && (
                            <button
                                type="button"
                                onClick={() => setShowTagCreate(!showTagCreate)}
                                className="text-xs text-accent hover:opacity-80"
                            >
                                + 新規作成
                            </button>
                        )}
                    </div>
                </div>
                {showTagCreate && (
                    <div className="mb-2 p-2 bg-gray-50 rounded border border-gray-200">
                        <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="タグ名"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent mb-2"
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                                {TAG_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setSelectedColor(color.value)}
                                        className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === color.value ? 'border-gray-800 scale-110' : 'border-gray-300'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={handleCreateTag}
                                className="px-3 py-1 text-xs bg-accent text-white rounded hover:opacity-90"
                            >
                                作成
                            </button>
                        </div>
                    </div>
                )}
                <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => isDeleteMode ? onDeleteTag(tag.id) : toggleTag(tag.id)}
                            className={`text-xs px-2 py-1 rounded-full transition-all flex items-center gap-1 ${isDeleteMode
                                ? 'opacity-100 ring-1 ring-red-400'
                                : selectedTags.includes(tag.id) ? 'opacity-100 font-medium' : 'opacity-50'
                                }`}
                            style={{ backgroundColor: tag.color + '30', color: tag.color }}
                        >
                            {tag.name}
                            {isDeleteMode && <X size={10} className="text-red-500" />}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    type="submit"
                    className="flex-1 py-1 px-3 bg-accent text-white text-sm rounded hover:opacity-90 transition-colors"
                >
                    追加
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setIsOpen(false)
                        setTitle('')
                        setDueDate('')
                        setSelectedTags([])
                    }}
                    className="flex-1 py-1 px-3 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                >
                    キャンセル
                </button>
            </div>
        </form>
    )
}

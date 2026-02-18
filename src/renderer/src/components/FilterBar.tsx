import { Filter, SortAsc, SortDesc } from 'lucide-react'
import { Tag, Status } from '../types'

interface FilterBarProps {
    tags: Tag[]
    statuses: Status[]
    selectedTags: string[]
    showArchived: boolean
    sortBy: 'dueDate' | 'createdAt' | 'status' | 'custom'
    sortOrder: 'asc' | 'desc'
    onTagToggle: (tagId: string) => void
    onShowArchivedToggle: () => void
    onSortChange: (sortBy: 'dueDate' | 'createdAt' | 'status' | 'custom') => void
    onSortOrderToggle: () => void
}

export function FilterBar({
    tags,
    selectedTags,
    showArchived,
    sortBy,
    sortOrder,
    onTagToggle,
    onShowArchivedToggle,
    onSortChange,
    onSortOrderToggle
}: FilterBarProps): JSX.Element {
    return (
        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
                <Filter size={14} className="text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">フィルター</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((tag) => (
                    <button
                        key={tag.id}
                        onClick={() => onTagToggle(tag.id)}
                        className={`text-xs px-2 py-1 rounded-full transition-all ${selectedTags.includes(tag.id)
                            ? 'opacity-100 font-medium'
                            : 'opacity-50 hover:opacity-75'
                            }`}
                        style={{ backgroundColor: tag.color + '30', color: tag.color }}
                    >
                        {tag.name}
                    </button>
                ))}
            </div>
            <div className="flex items-center justify-between">
                <button
                    onClick={onShowArchivedToggle}
                    className={`text-xs px-2 py-1 rounded transition-colors ${showArchived
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                >
                    アーカイブ表示
                </button>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onSortOrderToggle}
                        disabled={sortBy === 'custom'}
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${sortBy === 'custom' ? 'opacity-30' : 'text-gray-600 dark:text-gray-300'}`}
                        title={sortOrder === 'asc' ? '昇順' : '降順'}
                    >
                        {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                    </button>
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value as 'dueDate' | 'createdAt' | 'status' | 'custom')}
                        className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    >
                        <option value="dueDate">期限順</option>
                        <option value="createdAt">追加順</option>
                        <option value="status">ステータス順</option>
                        <option value="custom">カスタム（手動）</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

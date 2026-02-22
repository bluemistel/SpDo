import { useState, useMemo, useEffect } from 'react'
import { Header } from './components/Header'
import { TaskList } from './components/TaskList'
import { AddTaskForm } from './components/AddTaskForm'
import { FilterBar } from './components/FilterBar'
import { KanbanView } from './components/KanbanView'
import { Task, Tag, Status } from './types'
import { LayoutGrid, List } from 'lucide-react'
import { useSound } from './contexts/SoundContext'

// Default statuses
const DEFAULT_STATUSES: Status[] = [
    { id: 'todo', label: '未着手', color: '#94a3b8' },
    { id: 'in-progress', label: '進行中', color: '#3b82f6' },
    { id: 'done', label: '完了', color: '#10b981' }
]

function App(): JSX.Element {
    const [collapsed, setCollapsed] = useState(false)
    const [alwaysOnTop, setAlwaysOnTop] = useState(false)
    const [tasks, setTasks] = useState<Task[]>([])
    const [statuses, setStatuses] = useState<Status[]>(DEFAULT_STATUSES)
    const [tags, setTags] = useState<Tag[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [showArchived, setShowArchived] = useState(false)
    const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt' | 'status' | 'custom'>('dueDate')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [pomodoroSettings, setPomodoroSettings] = useState({
        workDuration: 25,
        breakDuration: 5,
        loops: 4
    })
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
    const [isLoaded, setIsLoaded] = useState(false)

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            const savedTasks = (await window.api.getTasks()) as Task[]
            const savedTags = (await window.api.getTags()) as Tag[]
            const savedStatuses = (await window.api.getStatuses()) as Status[]
            const savedAppSettings = await window.api.getAppSettings()
            console.log('[App] Loaded app settings:', savedAppSettings)

            if (savedTasks) setTasks(savedTasks)
            if (savedTags) setTags(savedTags)
            if (savedStatuses.length > 0) setStatuses(savedStatuses)

            if (savedAppSettings.sortBy) setSortBy(savedAppSettings.sortBy)
            if (savedAppSettings.sortOrder) setSortOrder(savedAppSettings.sortOrder)
            if (savedAppSettings.pomodoroSettings) setPomodoroSettings(savedAppSettings.pomodoroSettings)

            setIsLoaded(true)
        }
        loadData()
    }, [])

    // Save app settings whenever they change
    useEffect(() => {
        if (!isLoaded) return
        const appSettings = {
            sortBy,
            sortOrder,
            pomodoroSettings
        }
        console.log('[App] Saving app settings:', appSettings)
        window.api.saveAppSettings(appSettings)
    }, [sortBy, sortOrder, pomodoroSettings, isLoaded])

    // Save tasks whenever they change
    useEffect(() => {
        if (!isLoaded) return
        console.log('[App] Saving tasks:', tasks)
        window.api.saveTasks(tasks)
    }, [tasks, isLoaded])

    // Save tags whenever they change
    useEffect(() => {
        if (!isLoaded) return
        console.log('[App] Saving tags:', tags)
        window.api.saveTags(tags)
    }, [tags, isLoaded])

    // Save statuses whenever they change
    useEffect(() => {
        if (!isLoaded) return
        console.log('[App] Saving statuses:', statuses)
        window.api.saveStatuses(statuses)
    }, [statuses, isLoaded])

    // Auto-archive completed tasks after 24 hours
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now()
            setTasks((prevTasks) =>
                prevTasks.map((task) => {
                    if (
                        task.statusId === 'done' &&
                        task.completedAt &&
                        now - task.completedAt > 24 * 60 * 60 * 1000
                    ) {
                        return { ...task, archived: true }
                    }
                    return task
                })
            )
        }, 60 * 60 * 1000) // Check every hour
        return () => clearInterval(interval)
    }, [])

    const handleToggleCollapse = async () => {
        const newCollapsed = !collapsed
        setCollapsed(newCollapsed)
        await window.api.resizeWindow(newCollapsed)
    }

    const handleTogglePin = async () => {
        const newState = await window.api.toggleAlwaysOnTop()
        setAlwaysOnTop(newState)
    }

    const handleMinimize = async () => {
        await window.api.minimizeWindow()
    }

    const handleClose = async () => {
        await window.api.closeWindow()
    }

    const handleAddTask = (title: string, dueDate: number, taskTags: string[]) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            title,
            statusId: 'todo',
            tags: taskTags,
            dueDate,
            createdAt: Date.now(),
            archived: false
        }
        setTasks([...tasks, newTask])
    }

    const handleCreateTag = (name: string, color: string) => {
        const newTag: Tag = {
            id: crypto.randomUUID(),
            name,
            color
        }
        setTags([...tags, newTag])
    }

    const handleDeleteTask = (id: string) => {
        setTasks(tasks.filter((t) => t.id !== id))
    }

    const handleReorderTasks = (newTasks: Task[]) => {
        // Only allow manual reordering in custom mode or if we want to force custom mode
        setSortBy('custom')
        setTasks(newTasks)
    }

    const { playSound } = useSound()

    const handleStatusChange = (id: string, statusId: string) => {
        if (statusId === 'done') {
            playSound('taskCompleted')
        } else if (statusId === 'in-progress') {
            playSound('statusInProgress')
        }
        setTasks(
            tasks.map((t) =>
                t.id === id
                    ? {
                        ...t,
                        statusId,
                        completedAt: statusId === 'done' ? Date.now() : undefined,
                        archived: statusId !== 'done' && t.archived ? false : t.archived
                    }
                    : t
            )
        )
    }

    const handleEditTask = (id: string, updates: Partial<Task>) => {
        setTasks(
            tasks.map((t) =>
                t.id === id
                    ? { ...t, ...updates }
                    : t
            )
        )
    }

    const handleTagToggle = (tagId: string) => {
        setSelectedTags((prev) =>
            prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
        )
    }

    const handleShowArchivedToggle = () => {
        setShowArchived(!showArchived)
    }

    const handleSortChange = (newSortBy: 'dueDate' | 'createdAt' | 'status' | 'custom') => {
        if (newSortBy === 'custom' && sortBy !== 'custom') {
            // Keep current visual order as the new custom order
            setTasks(filteredAndSortedTasks)
        }
        setSortBy(newSortBy)
    }

    const handleToggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    }

    // Filter and sort tasks
    const filteredAndSortedTasks = useMemo(() => {
        let filtered = [...tasks].filter((task) => {
            // Filter by archived status
            if (!showArchived && task.archived) return false
            // Filter by selected tags (if any tags are selected)
            if (selectedTags.length > 0 && !task.tags.some((tag) => selectedTags.includes(tag))) {
                return false
            }
            return true
        })

        // Sort tasks (skip if mode is 'custom')
        if (sortBy !== 'custom') {
            filtered.sort((a, b) => {
                let result = 0
                if (sortBy === 'dueDate') {
                    result = a.dueDate - b.dueDate
                } else if (sortBy === 'createdAt') {
                    result = a.createdAt - b.createdAt
                } else if (sortBy === 'status') {
                    const statusOrder = { todo: 0, 'in-progress': 1, done: 2 }
                    result = (statusOrder[a.statusId as keyof typeof statusOrder] || 0) -
                        (statusOrder[b.statusId as keyof typeof statusOrder] || 0)
                }
                return sortOrder === 'asc' ? result : -result
            })
        }

        return filtered
    }, [tasks, showArchived, selectedTags, sortBy, sortOrder])

    return (
        <div className={`flex flex-col bg-transparent p-2 ${collapsed ? 'h-fit overflow-x-hidden' : 'h-screen'}`}>
            <div className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${collapsed ? 'h-fit overflow-x-hidden' : 'h-full'} ${viewMode === 'kanban' && !collapsed ? 'w-full max-w-full' : 'max-w-sm'
                }`}>
                <Header
                    collapsed={collapsed}
                    alwaysOnTop={alwaysOnTop}
                    onToggleCollapse={handleToggleCollapse}
                    onTogglePin={handleTogglePin}
                    onMinimize={handleMinimize}
                    onClose={handleClose}
                    pomodoroSettings={pomodoroSettings}
                    onUpdatePomodoroSettings={setPomodoroSettings}
                />
                {!collapsed && (
                    <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-gray-900 transition-colors">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
                            <div className="flex items-center justify-between mb-2">
                                <AddTaskForm onAdd={handleAddTask} tags={tags} onCreateTag={handleCreateTag} />
                                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 ml-2">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded transition-all ${viewMode === 'list'
                                            ? 'bg-white dark:bg-gray-600 shadow-sm text-purple-600 dark:text-purple-400'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                            }`}
                                        title="List View"
                                    >
                                        <List size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setViewMode('kanban')
                                            // Expand window when switching to Kanban if needed
                                            if (window.innerWidth < 800) {
                                                window.api.resizeWindow(false) // Reset to standard size but manual resize allows larger
                                            }
                                        }}
                                        className={`p-1.5 rounded transition-all ${viewMode === 'kanban'
                                            ? 'bg-white dark:bg-gray-600 shadow-sm text-purple-600 dark:text-purple-400'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                            }`}
                                        title="Kanban View"
                                    >
                                        <LayoutGrid size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                            {tags.length > 0 && (
                                <FilterBar
                                    tags={tags}
                                    statuses={statuses}
                                    selectedTags={selectedTags}
                                    showArchived={showArchived}
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                    onTagToggle={handleTagToggle}
                                    onShowArchivedToggle={handleShowArchivedToggle}
                                    onSortChange={handleSortChange}
                                    onSortOrderToggle={handleToggleSortOrder}
                                />
                            )}

                            {viewMode === 'list' ? (
                                <TaskList
                                    tasks={filteredAndSortedTasks}
                                    statuses={statuses}
                                    tags={tags}
                                    onReorder={handleReorderTasks}
                                    onDelete={handleDeleteTask}
                                    onStatusChange={handleStatusChange}
                                    onEditTask={handleEditTask}
                                />
                            ) : (
                                <KanbanView
                                    tasks={filteredAndSortedTasks}
                                    statuses={statuses}
                                    tags={tags}
                                    onDelete={handleDeleteTask}
                                    onStatusChange={handleStatusChange}
                                    onEditTask={handleEditTask}
                                    onReorder={handleReorderTasks}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App

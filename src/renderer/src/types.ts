export interface Tag {
    id: string
    name: string
    color: string
}

export interface Status {
    id: string
    label: string
    color: string
}

export interface Task {
    id: string
    title: string
    statusId: string
    tags: string[]
    dueDate: number // timestamp
    createdAt: number
    completedAt?: number
    archived: boolean
}

export interface AppState {
    tasks: Task[]
    tags: Tag[]
    statuses: Status[]
    collapsed: boolean
    alwaysOnTop: boolean
    filterTags: string[]
    showArchived: boolean
    sortBy: 'dueDate' | 'createdAt' | 'status'
}

// Type definitions for main process
export interface Task {
    id: string
    title: string
    statusId: string
    tags: string[]
    dueDate: number
    createdAt: number
    completedAt?: number
    archived: boolean
}

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

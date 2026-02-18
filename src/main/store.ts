import Store from 'electron-store'
import { Task, Tag, Status } from './types'

interface StoreSchema {
    tasks: Task[]
    tags: Tag[]
    statuses: Status[]
}

export const store = new Store<StoreSchema>({
    defaults: {
        tasks: [],
        tags: [],
        statuses: [
            { id: 'todo', label: '未着手', color: '#94a3b8' },
            { id: 'in-progress', label: '進行中', color: '#3b82f6' },
            { id: 'done', label: '完了', color: '#10b981' }
        ]
    }
})

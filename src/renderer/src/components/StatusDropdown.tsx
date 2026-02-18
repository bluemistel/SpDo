import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { Status } from '../types'

interface StatusDropdownProps {
    currentStatusId: string
    statuses: Status[]
    onStatusChange: (statusId: string) => void
}

export function StatusDropdown({ currentStatusId, statuses, onStatusChange }: StatusDropdownProps): JSX.Element {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const currentStatus = statuses.find((s) => s.id === currentStatusId) || statuses[0]

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleStatusClick = (statusId: string) => {
        onStatusChange(statusId)
        setIsOpen(false)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all hover:opacity-80"
                style={{ backgroundColor: currentStatus.color + '20', color: currentStatus.color }}
            >
                <span>{currentStatus.label}</span>
                <ChevronDown size={12} />
            </button>
            {isOpen && (
                <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[100px]">
                    {statuses.map((status) => (
                        <button
                            key={status.id}
                            onClick={() => handleStatusClick(status.id)}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            style={{ color: status.color }}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

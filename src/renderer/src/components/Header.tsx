import { Pin, Minimize2, X, ChevronDown, ChevronUp, Palette, Moon, Sun, Settings } from 'lucide-react'
import { useTheme, ThemeColor } from '../contexts/ThemeContext'
import { useState } from 'react'
import { Timer } from './Timer'
import { SettingsModal } from './SettingsModal'

interface HeaderProps {
    collapsed: boolean
    alwaysOnTop: boolean
    onToggleCollapse: () => void
    onTogglePin: () => void
    onMinimize: () => void
    onClose: () => void
    pomodoroSettings: {
        workDuration: number
        breakDuration: number
        loops: number
    }
    onUpdatePomodoroSettings: (settings: { workDuration: number; breakDuration: number; loops: number }) => void
    onMenuToggle?: (isOpen: boolean) => void
}

export function Header({
    collapsed,
    alwaysOnTop,
    onToggleCollapse,
    onTogglePin,
    onMinimize,
    onClose,
    pomodoroSettings,
    onUpdatePomodoroSettings,
    onMenuToggle
}: HeaderProps): JSX.Element {
    const { themeColor, setThemeColor, isDarkMode, setIsDarkMode, colors } = useTheme()
    const [showThemeMenu, setShowThemeMenu] = useState(false)
    const [showSettings, setShowSettings] = useState(false)


    const themes: { id: ThemeColor; label: string; color: string }[] = [
        { id: 'blue', label: 'Blue', color: '#3b82f6' },
        { id: 'green', label: 'Green', color: '#10b981' },
        { id: 'teal', label: 'Teal', color: '#14b8a6' },
        { id: 'red', label: 'Red', color: '#ef4444' },
        { id: 'yellow', label: 'Yellow', color: '#eab308' },
        { id: 'purple', label: 'Purple', color: '#8b5cf6' },
        { id: 'gray', label: 'Gray', color: '#6b7280' }
    ]

    return (
        <div
            className={`drag-region flex items-center justify-between px-3 py-2 rounded-t-lg transition-colors duration-300 ${collapsed ? 'rounded-b-lg' : ''}`}
            style={{
                background: `linear-gradient(to right, ${colors.from}, ${colors.to})`,
                WebkitAppRegion: 'drag'
            } as React.CSSProperties}
        >
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleCollapse}
                    className="no-drag p-1 hover:bg-white/20 rounded transition-colors"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    title={collapsed ? 'Expand' : 'Collapse'}
                >
                    {collapsed ? <ChevronDown size={16} color="white" /> : <ChevronUp size={16} color="white" />}
                </button>
                <span className="text-white text-sm font-semibold drop-shadow-sm">SpDo</span>

                <div className="ml-2 border-l border-white/30 pl-2">
                    <Timer settings={pomodoroSettings} onMenuToggle={onMenuToggle} />
                </div>
            </div>

            <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                {/* Settings Button */}
                {!collapsed && (
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        title="Settings"
                    >
                        <Settings size={14} color="white" />
                    </button>
                )}

                <SettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    pomodoroSettings={pomodoroSettings}
                    onUpdatePomodoroSettings={onUpdatePomodoroSettings}
                />

                {/* Theme Selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowThemeMenu(!showThemeMenu)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        title="Change Theme"
                    >
                        <Palette size={14} color="white" />
                    </button>

                    {showThemeMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowThemeMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-20 w-32 grid grid-cols-4 gap-1">
                                {themes.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => {
                                            setThemeColor(theme.id)
                                            setShowThemeMenu(false)
                                        }}
                                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${themeColor === theme.id ? 'border-gray-600 dark:border-gray-300 scale-110' : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: theme.color }}
                                        title={theme.label}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Dark Mode Toggle */}
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                >
                    {isDarkMode ? <Sun size={14} color="white" /> : <Moon size={14} color="white" />}
                </button>

                <div className="w-px h-3 bg-white/30 mx-1"></div>

                <button
                    onClick={onTogglePin}
                    className={`p-1 hover:bg-white/20 rounded transition-colors ${alwaysOnTop ? 'bg-white/30' : ''}`}
                    title={alwaysOnTop ? 'Unpin' : 'Pin on top'}
                >
                    <Pin size={14} color="white" />
                </button>
                <button
                    onClick={onMinimize}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    title="Minimize"
                >
                    <Minimize2 size={14} color="white" />
                </button>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-red-500/50 rounded transition-colors"
                    title="Close"
                >
                    <X size={14} color="white" />
                </button>
            </div>
        </div>
    )
}

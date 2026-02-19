import { X, Upload, Music, Volume2, VolumeX } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useSound, SoundEvent } from '../contexts/SoundContext'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    pomodoroSettings: {
        workDuration: number
        breakDuration: number
        loops: number
    }
    onUpdatePomodoroSettings: (settings: { workDuration: number; breakDuration: number; loops: number }) => void
}

const SOUND_EVENTS: { id: SoundEvent; label: string }[] = [
    { id: 'taskCompleted', label: 'タスクを完了させたとき' },
    { id: 'statusInProgress', label: 'タスクを「進行中」にしたとき' },
    { id: 'timerStart', label: 'タイマーをスタートさせたとき' },
    { id: 'countdownZero', label: 'タイマーが0になったとき' },
    { id: 'countupStop', label: 'ストップウォッチを止めたとき' },
    { id: 'pomodoroLoopStart', label: 'ポモドーロを開始時' },
    { id: 'pomodoroBreakStart', label: 'ポモドーロの休憩時' },
    { id: 'pomodoroAllloopsEnd', label: 'ポモドーロのループがすべて終了時' }
]

export function SettingsModal({ isOpen, onClose, pomodoroSettings, onUpdatePomodoroSettings }: SettingsModalProps) {
    const { soundSettings, volume, setSound, setVolume, playSound } = useSound()
    const [activeTab, setActiveTab] = useState<'general' | 'timer' | 'sound'>('general')
    const [tempPomodoro, setTempPomodoro] = useState(pomodoroSettings)
    const [autoLaunch, setAutoLaunch] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectingEvent, setSelectingEvent] = useState<SoundEvent | null>(null)

    // Load auto-launch status
    useEffect(() => {
        const checkAutoLaunch = async () => {
            try {
                const settings = await window.api.getLoginItemSettings()
                setAutoLaunch(settings.openAtLogin)
            } catch (error) {
                console.error('Failed to get login item settings:', error)
            }
        }
        checkAutoLaunch()
    }, [])

    const handleToggleAutoLaunch = async () => {
        const newValue = !autoLaunch
        console.log('Toggling auto-launch to:', newValue)
        try {
            await window.api.setLoginItemSettings({ openAtLogin: newValue })
            setAutoLaunch(newValue)
            console.log('Successfully set login item settings')
        } catch (error) {
            console.error('Failed to set login item settings:', error)
        }
    }

    // Sync temp state when prop changes
    useEffect(() => {
        setTempPomodoro(pomodoroSettings)
    }, [pomodoroSettings])

    if (!isOpen) return null

    const handleSaveTimer = () => {
        onUpdatePomodoroSettings(tempPomodoro)
        onClose()
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectingEvent) {
            const file = e.target.files[0]
            // @ts-ignore - 'path' exists in Electron File object but might be empty in web context
            const path = file.path

            if (path && path !== '') {
                setSound(selectingEvent, path)
            } else {
                // Fallback: Create Object URL for current session
                // Note: This URL will be invalid after app reload, but better than nothing for now.
                // For true persistence without 'path', we'd need to read file as Base64 (heavy) or use Main process IPC.
                const objectUrl = URL.createObjectURL(file)
                setSound(selectingEvent, objectUrl)
            }
        }
        setSelectingEvent(null)
    }

    const triggerFileSelect = (event: SoundEvent) => {
        setSelectingEvent(event)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
            fileInputRef.current.click()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">設定</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="flex border-b border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'general'
                            ? 'text-accent border-b-2 border-accent'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        全般
                    </button>
                    <button
                        onClick={() => setActiveTab('timer')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'timer'
                            ? 'text-accent border-b-2 border-accent'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        ポモドーロ
                    </button>
                    <button
                        onClick={() => setActiveTab('sound')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'sound'
                            ? 'text-accent border-b-2 border-accent'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        サウンド
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">システムの起動時に自動起動</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">パソコンの起動時にSpDoを自動的に開始します。</p>
                                </div>
                                <button
                                    onClick={handleToggleAutoLaunch}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${autoLaunch ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoLaunch ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'timer' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    ポモドーロの作業時間 (分)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={tempPomodoro.workDuration}
                                    onChange={(e) => setTempPomodoro({ ...tempPomodoro, workDuration: parseInt(e.target.value) || 25 })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    ポモドーロの休憩時間 (分)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={tempPomodoro.breakDuration}
                                    onChange={(e) => setTempPomodoro({ ...tempPomodoro, breakDuration: parseInt(e.target.value) || 5 })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    ポモドーロのループ回数
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={tempPomodoro.loops}
                                    onChange={(e) => setTempPomodoro({ ...tempPomodoro, loops: parseInt(e.target.value) || 4 })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">指定したループ回数が終わるとポモドーロタイマーは停止します。</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sound' && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600 mb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    {volume === 0 ? <VolumeX size={18} className="text-gray-500" /> : <Volume2 size={18} className="text-accent" />}
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        ボリューム: {isNaN(volume) ? 50 : Math.round(volume * 100)}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={isNaN(volume) ? 0.5 : volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-accent"
                                />
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept=".mp3,.wav,.aac"
                                className="hidden"
                            />
                            {SOUND_EVENTS.map((event) => (
                                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <div className="flex-1 min-w-0 mr-3">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{event.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {soundSettings[event.id] ? (
                                                soundSettings[event.id].startsWith('blob:') ? 'Selected File (Session only)' : soundSettings[event.id].split(/[/\\]/).pop()
                                            ) : 'No sound set'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {soundSettings[event.id] && (
                                            <button
                                                onClick={() => playSound(event.id)}
                                                className="p-1.5 text-accent hover:bg-accent/10 rounded transition-colors"
                                                title="Preview Sound"
                                            >
                                                <Music size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => triggerFileSelect(event.id)}
                                            className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <Upload size={14} />
                                            Set
                                        </button>
                                        {soundSettings[event.id] && (
                                            <button
                                                onClick={() => setSound(event.id, '')}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                                title="Clear Sound"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSaveTimer}
                        className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg shadow-sm transition-colors"
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
    )
}

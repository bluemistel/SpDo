import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Clock, Timer as TimerIcon, Hourglass } from 'lucide-react'
import { useSound } from '../contexts/SoundContext'

type TimerMode = 'countdown' | 'stopwatch' | 'pomodoro'

interface TimerProps {
    settings?: {
        workDuration: number
        breakDuration: number
        loops: number
    }
}

const DEFAULT_SETTINGS = {
    workDuration: 25,
    breakDuration: 5,
    loops: 4
}

export function Timer({ settings = DEFAULT_SETTINGS }: TimerProps): JSX.Element {
    const [mode, setMode] = useState<TimerMode>('pomodoro')
    const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60 * 1000)
    const [isActive, setIsActive] = useState(false)
    const [isWorkSession, setIsWorkSession] = useState(true)
    const [showMenu, setShowMenu] = useState(false)
    const [customMinutes, setCustomMinutes] = useState(5)
    const [completedLoops, setCompletedLoops] = useState(0)

    const { playSound } = useSound()
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const prevDurations = useRef({ work: settings.workDuration, break: settings.breakDuration })

    // Update time when settings change
    useEffect(() => {
        if (!isActive && mode === 'pomodoro') {
            const oldDuration = isWorkSession
                ? prevDurations.current.work * 60 * 1000
                : prevDurations.current.break * 60 * 1000;
            const newDuration = isWorkSession
                ? settings.workDuration * 60 * 1000
                : settings.breakDuration * 60 * 1000;

            // If the time left is still the "start" time of the previous setting, update it
            if (timeLeft === oldDuration) {
                setTimeLeft(newDuration)
            }
        }
        prevDurations.current = { work: settings.workDuration, break: settings.breakDuration }
    }, [settings, isWorkSession, mode, isActive])

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                if (mode === 'stopwatch') {
                    setTimeLeft((prev) => prev + 1000)
                } else {
                    setTimeLeft((prev) => Math.max(0, prev - 1000))
                }
            }, 1000)
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isActive, mode])

    // Handle timer completion side effects
    useEffect(() => {
        if (timeLeft === 0 && isActive && mode !== 'stopwatch') {
            handleTimerComplete()
        }
    }, [timeLeft, isActive, mode])

    const handleTimerComplete = () => {
        if (mode === 'countdown') {
            setIsActive(false)
            playSound('countdownZero')
            window.api.showNotification('SpDo', 'タイマーが終了しました！')
        } else if (mode === 'pomodoro') {
            if (isWorkSession) {
                const newCompletedLoops = completedLoops + 1
                setCompletedLoops(newCompletedLoops)

                if (newCompletedLoops >= settings.loops) {
                    setIsActive(false)
                    playSound('pomodoroAllloopsEnd')
                    window.api.showNotification('SpDo', 'すべてのセッションが完了しました！')
                    setIsWorkSession(true)
                    setCompletedLoops(0)
                    setTimeLeft(settings.workDuration * 60 * 1000)
                } else {
                    playSound('pomodoroBreakStart')
                    window.api.showNotification('SpDo', '休憩時間です！')
                    setIsWorkSession(false)
                    setTimeLeft(settings.breakDuration * 60 * 1000)
                }
            } else {
                playSound('pomodoroLoopStart')
                window.api.showNotification('SpDo', '作業に戻りましょう！')
                setIsWorkSession(true)
                setTimeLeft(settings.workDuration * 60 * 1000)
            }
        }
    }

    const toggleTimer = () => {
        if (!isActive) {
            if (mode === 'pomodoro' && isWorkSession && timeLeft === settings.workDuration * 60 * 1000) {
                playSound('pomodoroLoopStart')
            } else if (mode === 'countdown' || mode === 'stopwatch') {
                playSound('timerStart')
            }
        } else {
            if (mode === 'stopwatch') {
                playSound('countupStop')
            }
        }
        setIsActive(!isActive)
    }

    const resetTimer = () => {
        setIsActive(false)
        if (mode === 'pomodoro') {
            setIsWorkSession(true)
            setCompletedLoops(0)
            setTimeLeft(settings.workDuration * 60 * 1000)
        } else if (mode === 'countdown') {
            setTimeLeft(customMinutes * 60 * 1000)
        } else {
            setTimeLeft(0)
        }
    }

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    const switchMode = (newMode: TimerMode) => {
        setMode(newMode)
        setIsActive(false)
        // setShowMenu(false) // Keep menu open as requested
        if (newMode === 'pomodoro') {
            setIsWorkSession(true)
            setCompletedLoops(0)
            setTimeLeft(settings.workDuration * 60 * 1000)
        } else if (newMode === 'countdown') {
            setTimeLeft(customMinutes * 60 * 1000)
        } else {
            setTimeLeft(0)
        }
    }

    const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value) || 0
        setCustomMinutes(val)
        if (mode === 'countdown' && !isActive) {
            setTimeLeft(val * 60 * 1000)
        }
    }

    return (
        <div className="relative font-mono text-white text-sm no-drag" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <div
                className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded cursor-pointer hover:bg-black/30 transition-colors"
                onClick={() => setShowMenu(!showMenu)}
            >
                {mode === 'pomodoro' && <TimerIcon size={14} />}
                {mode === 'countdown' && <Hourglass size={14} />}
                {mode === 'stopwatch' && <Clock size={14} />}
                <span>{formatTime(timeLeft)}</span>
            </div>

            {showMenu && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-20 text-gray-800 dark:text-gray-200">
                        <div className="flex justify-around mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => switchMode('pomodoro')}
                                className={`p-1.5 rounded ${mode === 'pomodoro' ? 'bg-accent/10 text-accent' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                title="Pomodoro"
                            >
                                <TimerIcon size={16} />
                            </button>
                            <button
                                onClick={() => switchMode('countdown')}
                                className={`p-1.5 rounded ${mode === 'countdown' ? 'bg-accent/10 text-accent' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                title="Countdown"
                            >
                                <Hourglass size={16} />
                            </button>
                            <button
                                onClick={() => switchMode('stopwatch')}
                                className={`p-1.5 rounded ${mode === 'stopwatch' ? 'bg-accent/10 text-accent' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                title="Stopwatch"
                            >
                                <Clock size={16} />
                            </button>
                        </div>

                        <div className="text-center mb-3">
                            <div className="text-2xl font-bold font-mono tracking-wider mb-1">
                                {formatTime(timeLeft)}
                            </div>
                            {mode === 'pomodoro' && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {isWorkSession ? 'Focus Time' : 'Break Time'}
                                    <div className="text-[10px] mt-0.5 opacity-75">
                                        Loop: {completedLoops + 1} / {settings.loops}
                                    </div>
                                </div>
                            )}
                            {mode === 'countdown' && !isActive && (
                                <div className="flex items-center justify-center gap-1 mt-1">
                                    <input
                                        type="number"
                                        min="1"
                                        max="999"
                                        value={customMinutes}
                                        onChange={handleCustomTimeChange}
                                        className="w-12 px-1 py-0.5 text-center border border-gray-300 dark:border-gray-600 rounded bg-transparent text-xs"
                                    />
                                    <span className="text-xs text-gray-500">min</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center gap-2">
                            <button
                                onClick={toggleTimer}
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-accent hover:opacity-90 text-white transition-colors"
                            >
                                {isActive ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                            </button>
                            <button
                                onClick={resetTimer}
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                            >
                                <RotateCcw size={14} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

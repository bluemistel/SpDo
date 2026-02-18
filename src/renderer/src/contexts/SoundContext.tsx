import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type SoundEvent =
    | 'taskCompleted'
    | 'countdownZero'
    | 'countupStop'
    | 'pomodoroLoopStart'
    | 'pomodoroBreakStart'
    | 'pomodoroAllloopsEnd'
    | 'statusInProgress'
    | 'timerStart'

interface SoundSettings {
    [key: string]: string // event name -> file path
}

interface SoundContextType {
    soundSettings: SoundSettings
    volume: number
    setSound: (event: SoundEvent, filePath: string) => void
    setVolume: (volume: number) => void
    playSound: (event: SoundEvent) => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

export function SoundProvider({ children }: { children: ReactNode }) {
    const [soundSettings, setSoundSettings] = useState<SoundSettings>({})
    const [volume, setVolumeState] = useState(0.5)

    // Load settings from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('soundSettings')
        const savedVolume = localStorage.getItem('soundVolume')

        if (saved) {
            try {
                setSoundSettings(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to parse sound settings', e)
            }
        }

        if (savedVolume) {
            const parsed = parseFloat(savedVolume)
            if (!isNaN(parsed) && isFinite(parsed)) {
                setVolumeState(parsed)
            }
        }
    }, [])

    const setSound = (event: SoundEvent, filePath: string) => {
        const newSettings = { ...soundSettings, [event]: filePath }
        setSoundSettings(newSettings)
        localStorage.setItem('soundSettings', JSON.stringify(newSettings))
    }

    const setVolume = (vol: number) => {
        // Ensure vol is a valid number between 0 and 1
        const safeVol = isNaN(vol) ? 0.5 : Math.max(0, Math.min(1, vol))
        setVolumeState(safeVol)
        localStorage.setItem('soundVolume', String(safeVol))
    }

    const playSound = (event: SoundEvent) => {
        const filePath = soundSettings[event]
        if (filePath) {
            let src = filePath

            // Check if it's a local file path (not http, not blob, not file://) likely Windows path
            if (!src.startsWith('http') && !src.startsWith('file://') && !src.startsWith('blob:')) {
                // Verify if it looks like a path (has backslashes or starts with drive letter)
                // Simplified check: just replace backslashes if any
                src = `file://${src.replace(/\\/g, '/')}`
            }

            console.log(`[SoundContext] Playing sound for ${event}: ${src} (Volume: ${volume})`)

            try {
                const audio = new Audio(src)

                // Final safety check for volume
                const safeVolume = isNaN(volume) ? 0.5 : Math.max(0, Math.min(1, volume))
                audio.volume = safeVolume

                const playPromise = audio.play()

                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.error(`[SoundContext] Failed to play sound: ${src}`, err)
                        // This often happens if the user hasn't interacted with the document yet, 
                        // or if the path is blocked by security policies/invalid.
                    })
                }
            } catch (e) {
                console.error('[SoundContext] Error initializing Audio:', e)
            }
        } else {
            console.log(`[SoundContext] No sound set for event: ${event}`)
        }
    }

    return (
        <SoundContext.Provider value={{ soundSettings, volume, setSound, setVolume, playSound }}>
            {children}
        </SoundContext.Provider>
    )
}

export function useSound() {
    const context = useContext(SoundContext)
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider')
    }
    return context
}

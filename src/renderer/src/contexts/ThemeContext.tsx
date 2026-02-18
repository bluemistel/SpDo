import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type ThemeColor = 'blue' | 'green' | 'teal' | 'red' | 'yellow' | 'purple' | 'gray'

export interface ThemeColors {
    from: string
    to: string
    accent: string
}

const THEME_COLORS: Record<ThemeColor, ThemeColors> = {
    blue: { from: '#3b82f6', to: '#60a5fa', accent: '#3b82f6' },
    green: { from: '#10b981', to: '#34d399', accent: '#10b981' },
    teal: { from: '#14b8a6', to: '#2dd4bf', accent: '#14b8a6' },
    red: { from: '#ef4444', to: '#f87171', accent: '#ef4444' },
    yellow: { from: '#eab308', to: '#fbbf24', accent: '#eab308' },
    purple: { from: '#8b5cf6', to: '#a78bfa', accent: '#8b5cf6' },
    gray: { from: '#6b7280', to: '#9ca3af', accent: '#6b7280' }
}

interface ThemeContextType {
    themeColor: ThemeColor
    setThemeColor: (color: ThemeColor) => void
    isDarkMode: boolean
    setIsDarkMode: (dark: boolean) => void
    colors: ThemeColors
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeColor, setThemeColorState] = useState<ThemeColor>('purple')
    const [isDarkMode, setIsDarkModeState] = useState(false)

    // Apply theme colors to CSS variables
    const applyThemeColors = (color: ThemeColor) => {
        const theme = THEME_COLORS[color]
        const root = document.documentElement
        root.style.setProperty('--accent-primary', theme.accent)
        root.style.setProperty('--accent-from', theme.from)
        root.style.setProperty('--accent-to', theme.to)
    }

    // Load theme and apply dark mode class
    useEffect(() => {
        const savedTheme = localStorage.getItem('themeColor') as ThemeColor
        const savedDarkMode = localStorage.getItem('isDarkMode') === 'true'
        if (savedTheme && THEME_COLORS[savedTheme]) {
            setThemeColorState(savedTheme)
            applyThemeColors(savedTheme)
        } else {
            applyThemeColors(themeColor)
        }
        setIsDarkModeState(savedDarkMode)

        if (savedDarkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [])

    const setThemeColor = (color: ThemeColor) => {
        setThemeColorState(color)
        applyThemeColors(color)
        localStorage.setItem('themeColor', color)
    }

    const setIsDarkMode = (dark: boolean) => {
        setIsDarkModeState(dark)
        localStorage.setItem('isDarkMode', String(dark))
        if (dark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    const colors = THEME_COLORS[themeColor]

    return (
        <ThemeContext.Provider value={{ themeColor, setThemeColor, isDarkMode, setIsDarkMode, colors }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('md-editor-theme') as Theme) || 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (): void => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  // Apply theme to DOM
  useEffect(() => {
    const resolved = theme === 'system' ? getSystemTheme() : theme
    setResolvedTheme(resolved)
    document.documentElement.setAttribute('data-theme', resolved)
    localStorage.setItem('md-editor-theme', theme)
  }, [theme, getSystemTheme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'light'
      return resolvedTheme === 'light' ? 'dark' : 'light'
    })
  }, [resolvedTheme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}

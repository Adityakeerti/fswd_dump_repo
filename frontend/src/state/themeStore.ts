import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

function getInitialMode(): ThemeMode {
  try {
    const saved = localStorage.getItem('pt_theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // ignore
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return 'light'
}

export const useThemeStore = create<{
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}>((set) => ({
  mode: getInitialMode(),
  setMode: (mode) => {
    set({ mode })
    try {
      localStorage.setItem('pt_theme', mode)
    } catch {
      // ignore (private mode, blocked storage, etc.)
    }
  },
  toggle: () => {
    set((s) => {
      const next: ThemeMode = s.mode === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('pt_theme', next)
      } catch {
        // ignore
      }
      return { mode: next }
    })
  },
}))

// Stable selectors to prevent infinite re-renders
export const selectMode = (state: { mode: ThemeMode; setMode: (mode: ThemeMode) => void; toggle: () => void }) => state.mode
export const selectToggle = (state: { mode: ThemeMode; setMode: (mode: ThemeMode) => void; toggle: () => void }) => state.toggle
export const selectSetMode = (state: { mode: ThemeMode; setMode: (mode: ThemeMode) => void; toggle: () => void }) => state.setMode


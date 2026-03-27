import { create } from 'zustand'

export type AuthUser = {
  id: number
  name: string
  email: string
  role: string
}

type AuthState = {
  accessToken: string | null
  user: AuthUser | null
  loading: boolean
  error: string | null

  login: (params: { email: string; password: string }) => Promise<void>
  logout: () => void
}

const safeReadToken = (): string | null => {
  try {
    const v = localStorage.getItem('pt_access_token')
    return typeof v === 'string' && v.length ? v : null
  } catch {
    return null
  }
}

const safeReadUser = (): AuthUser | null => {
  try {
    const v = localStorage.getItem('pt_user')
    if (!v) return null
    const parsed = JSON.parse(v) as AuthUser
    return parsed?.id ? parsed : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: typeof window !== 'undefined' ? safeReadToken() : null,
  user: typeof window !== 'undefined' ? safeReadUser() : null,
  loading: false,
  error: null,

  login: async ({ email, password }) => {
    set({ loading: true, error: null })
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'
      console.log('[AuthStore] Backend URL:', backend)
      console.log('[AuthStore] Attempting login to:', `${backend}/api/auth/login`)

      const res = await fetch(`${backend}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      console.log('[AuthStore] Response status:', res.status)

      const data: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        const err = typeof data === 'object' && data && 'error' in data ? (data as { error?: unknown }).error : undefined
        throw new Error(typeof err === 'string' ? err : 'Login failed')
      }

      const token =
        typeof data === 'object' && data && 'access_token' in data ? (data as { access_token?: unknown }).access_token : undefined
      const user =
        typeof data === 'object' && data && 'user' in data ? (data as { user?: unknown }).user : undefined

      const isUser =
        typeof user === 'object' &&
        user !== null &&
        'id' in user &&
        'name' in user &&
        'email' in user &&
        'role' in user

      if (!token || typeof token !== 'string' || !isUser) throw new Error('Malformed login response from backend')

      try {
        localStorage.setItem('pt_access_token', token)
        localStorage.setItem('pt_user', JSON.stringify(user))
        console.log('[AuthStore] Token and user saved to localStorage')
      } catch {
        // Ignore storage failures (private mode, blocked storage, etc.)
        console.warn('[AuthStore] Failed to save to localStorage')
      }

      set({ accessToken: token, user: user as AuthUser, loading: false, error: null })
      console.log('[AuthStore] Login successful, token set in state')
    } catch (e) {
      console.error('[AuthStore] Login error:', e)
      let msg = 'Network error - cannot reach backend'
      if (e instanceof Error) {
        msg = e.message
        if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
          msg = 'Cannot connect to backend. Check if backend is running and accessible.'
        }
      }
      set({ loading: false, error: msg, accessToken: null, user: null })
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('pt_access_token')
      localStorage.removeItem('pt_user')
    } catch {
      // ignore
    }
    set({ accessToken: null, user: null, error: null, loading: false })
  },
}))

// Stable selectors to prevent infinite re-renders
export const selectAccessToken = (state: AuthState) => state.accessToken
export const selectUser = (state: AuthState) => state.user
export const selectLoading = (state: AuthState) => state.loading
export const selectError = (state: AuthState) => state.error
export const selectLogin = (state: AuthState) => state.login
export const selectLogout = (state: AuthState) => state.logout


import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { useThemeStore, selectMode } from './state/themeStore'

import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Books from './pages/Books'
import Users from './pages/Users'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import Overdue from './pages/Overdue'
import Scanner from './pages/Scanner'

import GlobalShell from './components/layout/GlobalShell'
import MobileOnlyShell from './components/layout/MobileOnlyShell'
import RequireAuth from './components/auth/RequireAuth'

function ThemeInitializer() {
  const mode = useThemeStore(selectMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
    try {
      localStorage.setItem('pt_theme', mode)
    } catch {
      // ignore storage failures (private mode, etc.)
    }
  }, [mode])

  return null
}

export default function App() {
  // Detect if device is mobile
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth < 768
  }, [])

  return (
    <>
      <ThemeInitializer />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <GlobalShell>
                <Dashboard />
              </GlobalShell>
            </RequireAuth>
          }
        />
        <Route
          path="/books"
          element={
            <RequireAuth>
              <GlobalShell>
                <Books />
              </GlobalShell>
            </RequireAuth>
          }
        />
        <Route
          path="/users"
          element={
            <RequireAuth>
              <GlobalShell>
                <Users />
              </GlobalShell>
            </RequireAuth>
          }
        />
        <Route
          path="/transactions"
          element={
            <RequireAuth>
              <GlobalShell>
                <Transactions />
              </GlobalShell>
            </RequireAuth>
          }
        />
        <Route
          path="/categories"
          element={
            <RequireAuth>
              <GlobalShell>
                <Categories />
              </GlobalShell>
            </RequireAuth>
          }
        />
        <Route
          path="/overdue"
          element={
            <RequireAuth>
              <GlobalShell>
                <Overdue />
              </GlobalShell>
            </RequireAuth>
          }
        />

        <Route
          path="/scanner"
          element={
            <RequireAuth>
              {isMobile ? (
                <MobileOnlyShell>
                  <Scanner />
                </MobileOnlyShell>
              ) : (
                <GlobalShell>
                  <Scanner />
                </GlobalShell>
              )}
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

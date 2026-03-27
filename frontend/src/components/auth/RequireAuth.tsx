import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore, selectAccessToken } from '../../state/authStore'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore(selectAccessToken)
  if (!accessToken) return <Navigate to="/login" replace />
  return <>{children}</>
}


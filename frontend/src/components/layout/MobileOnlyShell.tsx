import type { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import { useAuthStore, selectUser, selectLogout } from '../../state/authStore'
import { useMemo, useState } from 'react'

export default function MobileOnlyShell({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const user = useAuthStore(selectUser)
  const logout = useAuthStore(selectLogout)
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = useMemo(() => {
    const parts = (user?.name ?? '').split(' ').filter(Boolean)
    const a = parts[0]?.[0] ?? 'P'
    const b = parts[1]?.[0] ?? 'T'
    return `${a}${b}`.toUpperCase()
  }, [user?.name])

  return (
    <div className="min-h-screen bg-charcoal text-slate-100">
      {/* Minimal Header */}
      <header className="sticky top-0 z-30 border-b backdrop-blur-xl bg-navy/40 border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/src/assets/pustak_logo.png" 
              alt="Pustak Tracker" 
              className="h-10 w-10 rounded-2xl shadow-lg shadow-teal-500/50" 
            />
            <div>
              <div className="text-base font-display font-semibold text-white">Pustak Tracker</div>
              <div className="text-xs text-slate-400">Mobile Scanner</div>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="glass-panel w-10 h-10 rounded-xl flex items-center justify-center hover:shadow-glow-indigo/50 transition text-slate-200"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Dropdown Menu */}
      {menuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMenuOpen(false)}
          />
          
          <div className="fixed top-16 right-4 z-50 w-72 rounded-2xl border border-white/15 shadow-2xl bg-gradient-to-br from-navy to-charcoal overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-brandTeal/10 to-brandIndigo/10">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brandTeal to-brandCyan flex items-center justify-center font-bold text-white shadow-lg">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{user?.name ?? 'Librarian'}</div>
                  <div className="text-xs text-slate-300 truncate">{user?.email ?? ''}</div>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/dashboard')
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition flex items-center gap-3 text-sm text-slate-200 font-medium"
              >
                <Menu size={18} />
                Go to Dashboard
              </button>
              
              <button
                onClick={() => {
                  setMenuOpen(false)
                  logout()
                  navigate('/login')
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 hover:from-rose-100 hover:to-red-100 dark:from-rose-500/10 dark:to-red-500/10 dark:hover:from-rose-500/20 dark:hover:to-red-500/20 border border-rose-200 dark:border-rose-500/30 transition flex items-center justify-center gap-2 text-sm text-rose-700 dark:text-rose-300 font-semibold mt-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="px-4 py-6">{children}</main>
    </div>
  )
}

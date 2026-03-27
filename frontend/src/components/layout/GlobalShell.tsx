import type { PropsWithChildren } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Users, Activity, Tags, AlertTriangle, Search, Sun, Moon, Menu, X } from 'lucide-react'
import { useThemeStore, selectMode, selectToggle } from '../../state/themeStore'
import { useAuthStore, selectAccessToken, selectUser, selectLogout } from '../../state/authStore'
import { useMemo, useEffect, useState } from 'react'
import { useAppStore } from '../../state/store'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/books', label: 'Books', icon: BookOpen },
  { to: '/users', label: 'Patrons', icon: Users },
  { to: '/transactions', label: 'Transactions', icon: Activity },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/overdue', label: 'Overdue', icon: AlertTriangle, badge: 3 },
]

function Breadcrumbs() {
  const location = useLocation()
  const path = location.pathname

  const map: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/books': 'Books',
    '/users': 'Patrons',
    '/transactions': 'Transactions',
    '/categories': 'Categories',
    '/overdue': 'Overdue & Fines',
    '/scanner': 'Scanner',
  }

  const label = map[path] ?? 'Pustak Tracker'
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-orange-400 dark:text-slate-500">Home</span>
      <span className="text-orange-300 dark:text-slate-600">/</span>
      <span className="text-slate-700 font-medium dark:text-slate-200">{label}</span>
    </div>
  )
}

export default function GlobalShell({ children }: PropsWithChildren) {
  const mode = useThemeStore(selectMode)
  const toggle = useThemeStore(selectToggle)
  const location = useLocation()
  const navigate = useNavigate()

  const user = useAuthStore(selectUser)
  const logout = useAuthStore(selectLogout)
  const accessToken = useAuthStore(selectAccessToken)

  const hydrateAll = useAppStore((s) => s.hydrateAll)
  const loaded = useAppStore((s) => s.loaded)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const initials = useMemo(() => {
    const parts = (user?.name ?? '').split(' ').filter(Boolean)
    const a = parts[0]?.[0] ?? 'P'
    const b = parts[1]?.[0] ?? 'T'
    return `${a}${b}`.toUpperCase()
  }, [user?.name])

  useEffect(() => {
    if (!accessToken) return
    if (loaded) return
    void hydrateAll()
  }, [accessToken, loaded, hydrateAll])

  return (
    <div className="min-h-screen text-slate-800 dark:bg-charcoal dark:text-slate-100">
      <div className="hidden lg:block">
        {/* Light mode: Gradient sidebar with warm colors */}
        <div className="fixed inset-y-0 left-0 w-72 border-r backdrop-blur-xl bg-gradient-to-b from-orange-50/95 via-rose-50/95 to-purple-50/95 border-orange-200/60 dark:bg-navy/60 dark:border-white/10 dark:bg-none">
          <div className="h-full flex flex-col p-5">
            <div className="flex items-center gap-3 px-2 py-2">
              <img src="/src/assets/pustak_logo.png" alt="Pustak Tracker" className="h-10 w-10 rounded-2xl shadow-lg shadow-teal-500/50" />
              <div>
                <div className="text-base font-display font-semibold leading-tight text-slate-800 dark:text-white">Pustak Tracker</div>
                <div className="text-xs text-orange-600 dark:text-slate-400">Library Management System</div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = location.pathname === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={[
                      'group flex items-center justify-between px-3 py-2 rounded-xl border transition-all',
                      active 
                        ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 shadow-md shadow-teal-100/50 dark:bg-white/10 dark:border-white/15 dark:shadow-glow-indigo/30 dark:from-transparent dark:to-transparent' 
                        : 'bg-white/40 border-orange-100/40 hover:bg-gradient-to-r hover:from-orange-50 hover:to-rose-50 hover:border-orange-200 hover:shadow-sm dark:bg-transparent dark:border-transparent dark:hover:bg-white/5 dark:hover:border-white/10 dark:hover:from-transparent dark:hover:to-transparent',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={active ? 'text-teal-600 dark:text-brandCyan' : 'text-slate-600 group-hover:text-teal-600 dark:text-slate-400 dark:group-hover:text-brandCyan'} aria-hidden="true">
                        <Icon size={18} />
                      </div>
                      <span className={active ? 'text-slate-800 font-medium dark:text-slate-100' : 'text-slate-700 group-hover:text-slate-800 dark:text-slate-300 dark:group-hover:text-slate-100'}>{item.label}</span>
                    </div>

                    {typeof item.badge === 'number' && item.badge > 0 ? (
                      <div className="ml-3 inline-flex items-center justify-center rounded-full bg-rose-100 text-rose-700 px-2 h-6 text-xs border border-rose-200 font-medium dark:bg-rose-500/15 dark:text-rose-200 dark:border-rose-500/30">
                        {item.badge}
                      </div>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-72">
        {/* Light mode: Gradient header with warm tint */}
        <header className="sticky top-0 z-30 border-b backdrop-blur-xl bg-white/80 border-orange-200/60 dark:border-white/10 dark:bg-navy/40">
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            {/* Hamburger Menu Button - visible on mobile/small screens */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden glass-panel w-10 h-10 rounded-xl flex items-center justify-center hover:shadow-md hover:shadow-orange-200/50 dark:hover:shadow-glow-indigo/50 transition text-orange-600 dark:text-slate-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex-1">
              <Breadcrumbs />
            </div>

            <div className="hidden md:flex items-center gap-2">
              <div className="glass-panel flex items-center gap-2 px-3 py-2 w-72">
                <Search size={16} className="text-orange-400 dark:text-slate-400" />
                <input
                  className="bg-transparent outline-none text-sm w-full placeholder:text-orange-400/60 text-slate-800 dark:placeholder:text-slate-500 dark:text-slate-100"
                  placeholder="Search books, patrons, transactions..."
                />
              </div>
              <button
                onClick={toggle}
                className="glass-panel w-10 h-10 rounded-xl flex items-center justify-center hover:shadow-md hover:shadow-orange-200/50 dark:hover:shadow-glow-indigo/50 transition text-orange-600 dark:text-slate-200"
                aria-label="Toggle theme"
              >
                {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAvatarOpen((v) => !v)}
                  className="relative h-9 w-9 rounded-xl glass-panel flex items-center justify-center font-semibold text-teal-600 dark:text-brandCyan border border-orange-200 hover:bg-orange-50 hover:shadow-md hover:shadow-orange-200/50 dark:border-white/10 dark:hover:bg-white/5 transition"
                  aria-label="User menu"
                >
                  {initials}
                  {avatarOpen ? (
                    <div
                      className="absolute right-0 top-12 w-72 rounded-2xl border border-orange-200/80 shadow-2xl bg-white dark:bg-gradient-to-br dark:from-navy dark:to-charcoal dark:border-white/15 overflow-hidden"
                      role="menu"
                    >
                      <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-rose-50 dark:from-brandTeal/10 dark:to-brandIndigo/10">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brandTeal to-brandCyan flex items-center justify-center font-bold text-white shadow-lg">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name ?? 'Librarian'}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-300 truncate">{user?.email ?? ''}</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarOpen(false)
                            logout()
                            navigate('/login')
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 hover:from-rose-100 hover:to-red-100 dark:from-rose-500/10 dark:to-red-500/10 dark:hover:from-rose-500/20 dark:hover:to-red-500/20 border border-rose-200 dark:border-rose-500/30 transition flex items-center justify-center gap-2 text-sm text-rose-700 dark:text-rose-300 font-semibold"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : null}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden bg-gradient-to-b from-orange-50/98 via-rose-50/98 to-purple-50/98 dark:bg-navy/98 border-r border-orange-200/60 dark:border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="h-full flex flex-col p-5">
                {/* Header */}
                <div className="flex items-center justify-between px-2 py-2">
                  <div className="flex items-center gap-3">
                    <img src="/src/assets/pustak_logo.png" alt="Pustak Tracker" className="h-10 w-10 rounded-2xl shadow-lg shadow-teal-500/50" />
                    <div>
                      <div className="text-base font-display font-semibold leading-tight text-slate-800 dark:text-white">Pustak Tracker</div>
                      <div className="text-xs text-orange-600 dark:text-slate-400">Library Management</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl hover:bg-orange-100 dark:hover:bg-white/10 transition text-slate-600 dark:text-slate-300"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Navigation */}
                <div className="mt-6 flex flex-col gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const active = location.pathname === item.to
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={[
                          'group flex items-center justify-between px-3 py-2 rounded-xl border transition-all',
                          active 
                            ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 shadow-md shadow-teal-100/50 dark:bg-white/10 dark:border-white/15 dark:shadow-glow-indigo/30 dark:from-transparent dark:to-transparent' 
                            : 'bg-white/40 border-orange-100/40 hover:bg-gradient-to-r hover:from-orange-50 hover:to-rose-50 hover:border-orange-200 hover:shadow-sm dark:bg-transparent dark:border-transparent dark:hover:bg-white/5 dark:hover:border-white/10 dark:hover:from-transparent dark:hover:to-transparent',
                        ].join(' ')}
                      >
                        <div className="flex items-center gap-3">
                          <div className={active ? 'text-teal-600 dark:text-brandCyan' : 'text-slate-600 group-hover:text-teal-600 dark:text-slate-400 dark:group-hover:text-brandCyan'} aria-hidden="true">
                            <Icon size={18} />
                          </div>
                          <span className={active ? 'text-slate-800 font-medium dark:text-slate-100' : 'text-slate-700 group-hover:text-slate-800 dark:text-slate-300 dark:group-hover:text-slate-100'}>{item.label}</span>
                        </div>

                        {typeof item.badge === 'number' && item.badge > 0 ? (
                          <div className="ml-3 inline-flex items-center justify-center rounded-full bg-rose-100 text-rose-700 px-2 h-6 text-xs border border-rose-200 font-medium dark:bg-rose-500/15 dark:text-rose-200 dark:border-rose-500/30">
                            {item.badge}
                          </div>
                        ) : null}
                      </Link>
                    )
                  })}
                </div>

                {/* User Info at Bottom */}
                <div className="mt-auto pt-4 border-t border-orange-200 dark:border-white/10">
                  <div className="glass-panel rounded-2xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl glass-panel flex items-center justify-center font-semibold text-teal-600 dark:text-brandCyan border border-orange-200 dark:border-white/10">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.name ?? 'Librarian'}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 truncate">{user?.email ?? ''}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        logout()
                        navigate('/login')
                      }}
                      className="mt-3 w-full px-3 py-2 rounded-xl bg-gradient-to-r from-orange-100 to-rose-100 hover:from-orange-200 hover:to-rose-200 dark:from-white/15 dark:to-white/15 dark:hover:from-white/20 dark:hover:to-white/20 border border-orange-300 dark:border-white/20 transition text-sm text-slate-800 dark:text-slate-100 font-semibold"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <main className="px-4 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  )
}


import { Eye, EyeOff, Mail, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, selectLogin, selectLoading, selectError } from '../state/authStore'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore(selectLogin)
  const loading = useAuthStore(selectLoading)
  const error = useAuthStore(selectError)

  const [email, setEmail] = useState('librarian@pustak.com')
  const [password, setPassword] = useState('admin123')
  const [reveal, setReveal] = useState(false)

  const demoText = useMemo(
    () => ({ label: 'Demo credentials', value: 'librarian@pustak.com / admin123' }),
    [],
  )

  // Detect if device is mobile
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth < 768
  }, [])

  return (
    <div className="min-h-screen flex items-stretch">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-charcoal to-brandIndigo/30" />
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              'radial-gradient(900px circle at 50% 50%, rgba(34,211,238,.25), transparent 55%), radial-gradient(800px circle at 80% 30%, rgba(99,102,241,.20), transparent 50%)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-10">
          <img 
            src="/src/assets/pustak_logo.png" 
            alt="Pustak Tracker" 
            className="h-32 w-32 rounded-3xl shadow-2xl shadow-teal-500/50 mb-8" 
          />
          
          <h1 className="text-4xl font-display font-bold text-white mb-3">Pustak Tracker</h1>
          <p className="text-lg text-gradient font-semibold mb-12">Library Management System</p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { k: '1,200+', v: 'Books' },
              { k: '98%', v: 'Availability' },
              { k: '200+', v: 'Patrons' },
              { k: 'Live', v: 'Tracking' },
            ].map((s) => (
              <div key={s.k} className="glass-panel rounded-2xl p-4">
                <div className="text-2xl font-bold text-white">{s.k}</div>
                <div className="text-sm text-slate-300 mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-charcoal">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center lg:text-left">
            <div className="text-sm text-slate-500 dark:text-slate-300">Welcome back</div>
            <div className="text-3xl font-display font-semibold text-slate-950 dark:text-slate-100 mt-1">
              Sign in
            </div>
            {isMobile && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-brandCyan/20 border border-brandCyan/50 px-3 py-1 text-xs text-brandCyan">
                <span className="h-2 w-2 rounded-full bg-brandCyan animate-pulse" />
                Mobile Scanner Mode
              </div>
            )}
          </div>

          <div className="glass-panel-strong rounded-3xl p-5 sm:p-6 shadow-glow-indigo/20">
            <div className="space-y-4">
              <label className="block">
                <div className="text-sm text-slate-300 mb-2">Email</div>
                <div className="flex items-center gap-3 glass-panel rounded-2xl px-3 py-2 border border-white/10">
                  <Mail size={16} className="text-slate-400" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500"
                    placeholder="you@school.edu"
                  />
                </div>
              </label>

              <label className="block">
                <div className="text-sm text-slate-300 mb-2">Password</div>
                <div className="flex items-center gap-3 glass-panel rounded-2xl px-3 py-2 border border-white/10">
                  <User size={16} className="text-slate-400" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={reveal ? 'text' : 'password'}
                    className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setReveal((v) => !v)}
                    className="text-slate-300 hover:text-white transition"
                    aria-label={reveal ? 'Hide password' : 'Show password'}
                  >
                    {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <button
                type="button"
                className="w-full rounded-2xl bg-gradient-to-r from-brandTeal via-brandCyan to-brandIndigo px-5 py-3 text-sm font-semibold text-slate-950 shadow-glow-teal transition hover:brightness-110 active:scale-[0.99] focus-ring"
                disabled={loading}
                onClick={async () => {
                  try {
                    await login({ email, password })
                    await new Promise(resolve => setTimeout(resolve, 100))
                    // Redirect to scanner if mobile, dashboard if desktop
                    navigate(isMobile ? '/scanner' : '/dashboard')
                  } catch (err) {
                    // Error is already set in auth store
                  }
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</div> : null}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-slate-300">{demoText.label}</div>
                <div className="mt-1 text-xs text-slate-100 font-semibold">{demoText.value}</div>
              </div>

              <div className="text-center text-sm text-slate-300">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="text-brandCyan hover:text-brandTeal transition font-semibold"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500 text-center lg:text-left">
            By continuing, you accept library policy and usage guidelines.
          </div>
        </div>
      </div>
    </div>
  )
}


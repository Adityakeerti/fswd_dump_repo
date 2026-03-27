import { Eye, EyeOff, Mail, User, UserCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SignUp() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [reveal, setReveal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignUp = async () => {
    setError(null)

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'
      const res = await fetch(`${backend}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

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
            <div className="text-sm text-slate-500 dark:text-slate-300">Join the library</div>
            <div className="text-3xl font-display font-semibold text-slate-950 dark:text-slate-100 mt-1">
              Create Account
            </div>
          </div>

          <div className="glass-panel-strong rounded-3xl p-5 sm:p-6 shadow-glow-indigo/20">
            {success ? (
              <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm text-teal-200 text-center">
                Account created! Redirecting to login...
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block">
                  <div className="text-sm text-slate-300 mb-2">Full Name</div>
                  <div className="flex items-center gap-3 glass-panel rounded-2xl px-3 py-2 border border-white/10">
                    <UserCircle size={16} className="text-slate-400" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500"
                      placeholder="John Doe"
                    />
                  </div>
                </label>

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

                <label className="block">
                  <div className="text-sm text-slate-300 mb-2">Confirm Password</div>
                  <div className="flex items-center gap-3 glass-panel rounded-2xl px-3 py-2 border border-white/10">
                    <User size={16} className="text-slate-400" />
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={reveal ? 'text' : 'password'}
                      className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500"
                      placeholder="••••••••"
                    />
                  </div>
                </label>

                <button
                  type="button"
                  className="w-full rounded-2xl bg-gradient-to-r from-brandTeal via-brandCyan to-brandIndigo px-5 py-3 text-sm font-semibold text-slate-950 shadow-glow-teal transition hover:brightness-110 active:scale-[0.99] focus-ring"
                  disabled={loading}
                  onClick={handleSignUp}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                {error && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                    {error}
                  </div>
                )}

                <div className="text-center text-sm text-slate-300">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-brandCyan hover:text-brandTeal transition font-semibold"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-slate-500 text-center lg:text-left">
            By creating an account, you accept library policy and usage guidelines.
          </div>
        </div>
      </div>
    </div>
  )
}

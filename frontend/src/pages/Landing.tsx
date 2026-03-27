import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Users, TrendingUp, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, selectBooks, selectPatrons, selectKpis } from '../state/store'

export default function Landing() {
  const navigate = useNavigate()
  const books = useAppStore(selectBooks)
  const patrons = useAppStore(selectPatrons)
  const kpis = useAppStore(selectKpis)

  // Calculate real statistics
  const totalBooks = books.length
  const totalCopies = books.reduce((sum, book) => sum + book.totalCopies, 0)
  const availableCopies = books.reduce((sum, book) => sum + book.availableCopies, 0)
  const availabilityRate = totalCopies > 0 ? Math.round((availableCopies / totalCopies) * 100) : 0
  const totalPatrons = patrons.length
  const activePatrons = kpis.activePatrons

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center justify-center">
      {/* Background gradients */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(800px circle at 50% 30%, rgba(34,211,238,.25), transparent 50%), radial-gradient(700px circle at 80% 60%, rgba(99,102,241,.20), transparent 45%), radial-gradient(600px circle at 20% 80%, rgba(20,184,166,.18), transparent 45%)',
        }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center"
        >
          {/* Logo and Title */}
          <div className="text-center mb-12">
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              src="/src/assets/pustak_logo.png" 
              alt="Pustak Tracker" 
              className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl shadow-2xl shadow-teal-500/50 mb-6 mx-auto" 
            />

            <h1 className="text-4xl sm:text-6xl font-display font-bold text-white mb-3">
              Pustak Tracker
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-2">
              Professional Library Management System
            </p>
            
            <p className="text-sm sm:text-base text-slate-400">
              Streamline your library operations with powerful tools
            </p>
          </div>

          {/* Authentication Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mb-16 w-full max-w-md"
          >
            <button
              onClick={() => navigate('/login')}
              className="group flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brandTeal via-brandCyan to-brandIndigo px-8 py-4 text-base font-semibold text-slate-950 shadow-glow-teal transition hover:brightness-110 hover:scale-105 active:scale-[0.99] focus-ring"
            >
              Sign In
              <ArrowRight className="group-hover:translate-x-1 transition" size={18} />
            </button>

            <button
              onClick={() => navigate('/signup')}
              className="flex-1 inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-xl transition hover:bg-white/15 hover:scale-105 active:scale-[0.99] focus-ring"
            >
              Sign Up
            </button>
          </motion.div>

          {/* Real Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-4xl mb-12"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel-strong p-6 rounded-2xl shadow-lg hover:shadow-glow-teal/20 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <div className="h-12 w-12 rounded-xl bg-brandCyan/20 border border-brandCyan/30 flex items-center justify-center">
                    <BookOpen className="text-brandCyan" size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white text-center">{totalBooks}</div>
                <div className="text-sm text-slate-300 mt-1 text-center">Books in Catalog</div>
              </div>

              <div className="glass-panel-strong p-6 rounded-2xl shadow-lg hover:shadow-glow-indigo/20 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <div className="h-12 w-12 rounded-xl bg-brandIndigo/20 border border-brandIndigo/30 flex items-center justify-center">
                    <TrendingUp className="text-brandIndigo" size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white text-center">{availabilityRate}%</div>
                <div className="text-sm text-slate-300 mt-1 text-center">Availability Rate</div>
              </div>

              <div className="glass-panel-strong p-6 rounded-2xl shadow-lg hover:shadow-glow-teal/20 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <div className="h-12 w-12 rounded-xl bg-brandTeal/20 border border-brandTeal/30 flex items-center justify-center">
                    <Users className="text-brandTeal" size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white text-center">{totalPatrons}</div>
                <div className="text-sm text-slate-300 mt-1 text-center">Total Patrons</div>
              </div>

              <div className="glass-panel-strong p-6 rounded-2xl shadow-lg hover:shadow-glow-indigo/20 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Shield className="text-purple-300" size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white text-center">{activePatrons}</div>
                <div className="text-sm text-slate-300 mt-1 text-center">Active Users</div>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-full max-w-4xl"
          >
            <div className="glass-panel-strong rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white text-center mb-6">Why Choose Pustak Tracker?</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brandCyan/20 border border-brandCyan/30 mb-3">
                    <BookOpen className="text-brandCyan" size={20} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Smart Cataloging</h3>
                  <p className="text-sm text-slate-400">Organize and manage your entire book collection efficiently</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brandTeal/20 border border-brandTeal/30 mb-3">
                    <Users className="text-brandTeal" size={20} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">User Management</h3>
                  <p className="text-sm text-slate-400">Track patrons, memberships, and borrowing history</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brandIndigo/20 border border-brandIndigo/30 mb-3">
                    <TrendingUp className="text-brandIndigo" size={20} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Real-time Analytics</h3>
                  <p className="text-sm text-slate-400">Monitor circulation, trends, and library performance</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-purple-500/20 border border-purple-500/30 mb-3">
                    <Shield className="text-purple-300" size={20} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Secure Access</h3>
                  <p className="text-sm text-slate-400">Role-based permissions and data protection</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brandCyan/20 border border-brandCyan/30 mb-3">
                    <svg className="text-brandCyan" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Barcode Scanning</h3>
                  <p className="text-sm text-slate-400">Quick issue and return with mobile scanner</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brandTeal/20 border border-brandTeal/30 mb-3">
                    <svg className="text-brandTeal" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M2 12h20" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Fine Management</h3>
                  <p className="text-sm text-slate-400">Automated fine calculation and tracking</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 text-center text-sm text-slate-400"
          >
            <p>© 2024 Pustak Tracker. Professional Library Management.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}


import { motion } from 'framer-motion'
import { TrendingUp, AlertTriangle, Boxes, UsersRound } from 'lucide-react'
import type { ComponentType } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import IssueReturnButtons from '../components/ui/IssueReturnButtons'
import { formatINR } from '../lib/format'
import {
  selectDueSoon,
  selectKpis,
  selectMonthlyCirculationTrend,
  selectRecentTransactions,
  selectTopCategoriesChart,
  useAppStore,
} from '../state/store'

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
  glowClass,
  badgeText,
}: {
  icon: ComponentType<{ size?: number; className?: string }>
  label: string
  value: string
  tone: 'teal' | 'rose' | 'indigo' | 'cyan'
  glowClass: string
  badgeText?: string
}) {
  const toneClass =
    tone === 'teal'
      ? 'text-brandCyan'
      : tone === 'rose'
        ? 'text-rose-200'
        : tone === 'indigo'
          ? 'text-brandIndigo'
          : 'text-brandTeal'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel-strong rounded-3xl p-4 relative overflow-hidden"
    >
      <div className={`absolute inset-0 pointer-events-none ${glowClass} opacity-60`} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <Icon className={toneClass} size={16} />
            {label}
          </div>
          <div className="mt-2 text-3xl font-display font-semibold text-slate-800 dark:text-white">{value}</div>
        </div>
        {badgeText ? (
          <div className="relative">
            <div className="absolute -top-2 -right-2 h-3 w-3 bg-rose-500 rounded-full shadow-[0_0_0_6px_rgba(251,113,133,0.18)]" />
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-rose-100 border border-rose-200 dark:bg-rose-500/15 dark:border-rose-500/30 px-3 py-1 text-xs text-rose-700 dark:text-rose-200 font-medium animate-[subtlePulse_2.2s_ease-in-out_infinite]">
              {badgeText}
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const kpis = useAppStore(selectKpis)
  const dueSoon = useAppStore(selectDueSoon)
  const recentTx = useAppStore(selectRecentTransactions)
  const monthlyTrend = useAppStore(selectMonthlyCirculationTrend)
  const topCategories = useAppStore(selectTopCategoriesChart)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs text-orange-500 dark:text-slate-400">Operations Overview</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-display font-semibold text-slate-800 dark:text-white">Dashboard</h2>
          </div>
          <IssueReturnButtons />
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon={Boxes}
          label="Books Checked Out"
          value={String(kpis.booksCheckedOut)}
          tone="teal"
          glowClass="shadow-glow-teal"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Overdue"
          value={String(kpis.overdueCount)}
          tone="rose"
          glowClass="shadow-glow-indigo"
          badgeText={formatINR(kpis.totalFines)}
        />
        <KpiCard
          icon={UsersRound}
          label="Active Patrons"
          value={String(kpis.activePatrons)}
          tone="cyan"
          glowClass="shadow-glow-teal"
        />
        <KpiCard
          icon={TrendingUp}
          label="Inventory %"
          value={`${kpis.inventoryPct}%`}
          tone="indigo"
          glowClass="shadow-glow-indigo"
        />
      </div>

      <div className="grid xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 glass-panel-strong rounded-3xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-orange-500 dark:text-slate-400">Monthly Circulation</div>
              <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Line trend</div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Last 12 months</div>
          </div>

          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                <YAxis stroke="rgba(255,255,255,0.45)" />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#22d3ee', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-2 glass-panel-strong rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-orange-500 dark:text-slate-400">Top Categories</div>
              <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Bar chart</div>
            </div>
          </div>

          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategories}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                <YAxis stroke="rgba(255,255,255,0.45)" />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 glass-panel-strong rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-orange-500 dark:text-slate-400">Due Soon</div>
              <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Priority list</div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Next 3 days</div>
          </div>

          <div className="mt-4 space-y-3">
            {dueSoon.map((d, idx) => (
              <motion.div
                key={d.transactionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="glass-panel rounded-2xl p-3 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-white">{d.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{d.patronName}</div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 dark:bg-brandCyan/10 dark:border-brandCyan/25 px-3 py-1 text-xs text-teal-700 dark:text-brandCyan font-medium">
                  <span className="h-2 w-2 rounded-full bg-teal-500 dark:bg-brandCyan" />
                  {d.daysLeft} days left
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 glass-panel-strong rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-orange-500 dark:text-slate-400">Recent Transactions</div>
              <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Live activity</div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Last 3 records</div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-orange-100 dark:border-white/10">
            <div className="grid grid-cols-12 px-4 py-2 text-xs bg-orange-50/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-medium">
              <div className="col-span-3">When</div>
              <div className="col-span-3">Action</div>
              <div className="col-span-3">Book</div>
              <div className="col-span-3">Patron</div>
            </div>
            <div className="divide-y divide-orange-100 dark:divide-white/10">
              {recentTx.map((t, idx) => (
                <motion.div
                  key={t.what}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="grid grid-cols-12 px-4 py-3 text-sm text-slate-800 dark:text-slate-100"
                >
                  <div className="col-span-3 text-slate-600 dark:text-slate-300">{t.when}</div>
                  <div className="col-span-3">
                    <span
                      className={[
                        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
                        t.action === 'Overdue'
                          ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-200'
                          : t.action === 'Returned'
                            ? 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-brandCyan/10 dark:border-brandCyan/25 dark:text-brandCyan'
                            : 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-brandIndigo/10 dark:border-brandIndigo/25 dark:text-brandIndigo',
                      ].join(' ')}
                    >
                      {t.action}
                    </span>
                  </div>
                  <div className="col-span-3 font-semibold">{t.what}</div>
                  <div className="col-span-3 text-slate-600 dark:text-slate-300">{t.who}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


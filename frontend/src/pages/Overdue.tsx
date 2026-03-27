import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Mail, Download, RefreshCcw } from 'lucide-react'

import IssueReturnButtons from '../components/ui/IssueReturnButtons'
import { useAppStore, selectKpis, selectOverdueRows, selectRecalculateFines } from '../state/store'
import { formatDate, formatINR } from '../lib/format'

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return (
    <div className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 dark:bg-white/5 dark:border-white/10 dark:text-slate-100 flex items-center justify-center font-semibold">
      {initials}
    </div>
  )
}

function downloadCsv(rows: Record<string, string | number | null | undefined>[], filename: string) {
  const headers = Object.keys(rows[0] ?? { header: '' })
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function Overdue() {
  const kpis = useAppStore(selectKpis)
  const overdueRows = useAppStore(selectOverdueRows)

  const recalculateFines = useAppStore(selectRecalculateFines)

  const exportRows = useMemo(() => {
    return overdueRows.map((r) => ({
      patron: r.patron?.name ?? '',
      book: r.book?.title ?? '',
      issueDate: r.issueDate,
      dueDate: r.dueDate,
      daysOverdue: r.daysOverdue,
      fineAmount: r.fineAmount,
    }))
  }, [overdueRows])

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-rose-500/25 bg-rose-500/10 dark:border-rose-500/25 dark:bg-rose-500/10 border-rose-300 bg-rose-50"
      >
        <div className="absolute -top-16 -right-28 h-56 w-56 rounded-full bg-rose-500/20 blur-2xl dark:bg-rose-500/20 bg-rose-200/30" />
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 dark:bg-rose-500/15 dark:border-rose-500/30 bg-rose-100 border-rose-300 flex items-center justify-center">
                <AlertTriangle className="text-rose-600 dark:text-rose-200" size={20} />
              </div>
              <div>
                <div className="text-xs text-rose-700 dark:text-rose-200/90">Urgent Overdue Banner</div>
                <div className="mt-1 text-rose-900 dark:text-white font-semibold text-lg">
                  Total fines across overdue items: {formatINR(kpis.totalFines)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <IssueReturnButtons />
              <button
                onClick={recalculateFines}
                className="glass-panel rounded-2xl px-4 py-2 inline-flex items-center gap-2 hover:bg-rose-100 dark:hover:bg-white/10 transition text-rose-800 dark:text-white"
              >
                <RefreshCcw size={16} />
                Recalculate Fines
              </button>
              <button
                onClick={() => alert('Mock: reminders queued for overdue patrons.')}
                className="glass-panel rounded-2xl px-4 py-2 inline-flex items-center gap-2 hover:bg-rose-100 dark:hover:bg-white/10 transition text-rose-800 dark:text-white"
              >
                <Mail size={16} />
                Send Reminders
              </button>
              <button
                onClick={() => downloadCsv(exportRows, 'pustak-tracker-overdue.csv')}
                className="glass-panel rounded-2xl px-4 py-2 inline-flex items-center gap-2 hover:bg-rose-100 dark:hover:bg-white/10 transition text-rose-800 dark:text-white"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="glass-panel-strong rounded-3xl p-4">
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-14 px-4 py-2 text-xs bg-slate-50 text-slate-600 dark:bg-white/5 dark:text-slate-300">
            <div className="col-span-2">Patron</div>
            <div className="col-span-4">Book Details</div>
            <div className="col-span-2">Issue</div>
            <div className="col-span-2">Due</div>
            <div className="col-span-1 text-right">Days</div>
            <div className="col-span-2 text-right">Fine</div>
            <div className="col-span-1 text-right">Email</div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {overdueRows.map((r) => (
              <div
                key={r.transactionId}
                className="grid grid-cols-14 px-4 py-3 items-center text-sm text-slate-700 dark:text-slate-100"
              >
                <div className="col-span-2 flex items-center gap-3">
                  {r.patron ? <Avatar name={r.patron.name} /> : null}
                </div>

                <div className="col-span-4">
                  <div className="font-semibold">{r.book?.title ?? '—'}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{r.patron?.name ?? '—'}</div>
                </div>

                <div className="col-span-2 text-slate-600 dark:text-slate-300 text-xs">{formatDate(r.issueDate)}</div>
                <div className="col-span-2 text-slate-600 dark:text-slate-300 text-xs">{formatDate(r.dueDate)}</div>

                <div className="col-span-1 text-right">
                  <span className="inline-flex items-center justify-center rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-1 text-xs text-rose-200">
                    {r.daysOverdue}
                  </span>
                </div>

                <div className="col-span-2 text-right text-slate-800 dark:text-slate-200 font-semibold">{formatINR(r.fineAmount)}</div>

                <div className="col-span-1 text-right">
                  <button
                    onClick={() => alert(`Mock: email reminder sent to ${r.patron?.email ?? 'patron'}.`)}
                    className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition"
                    aria-label="Email reminder"
                  >
                    <Mail size={16} className="inline text-rose-200" />
                  </button>
                </div>
              </div>
            ))}

            {overdueRows.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No overdue fines right now.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}


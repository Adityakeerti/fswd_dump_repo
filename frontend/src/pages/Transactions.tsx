import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Shield } from 'lucide-react'

import IssueReturnButtons from '../components/ui/IssueReturnButtons'
import { formatDate, formatINR } from '../lib/format'
import { useAppStore, selectPatrons, selectBooks, selectTransactions } from '../state/store'

type SegId = 'all' | 'issued' | 'returned' | 'overdue'
type TxStatus = 'Issued' | 'Returned' | 'Overdue'

const tabs: { id: SegId; label: string; status?: TxStatus }[] = [
  { id: 'all', label: 'All' },
  { id: 'issued', label: 'Issued', status: 'Issued' },
  { id: 'returned', label: 'Returned', status: 'Returned' },
  { id: 'overdue', label: 'Overdue', status: 'Overdue' },
]

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <div className="h-10 w-10 rounded-2xl bg-purple-50 border border-purple-200 dark:bg-white/5 dark:border-white/10 flex items-center justify-center text-purple-700 dark:text-slate-100 font-semibold">
      {initials}
    </div>
  )
}

export default function Transactions() {
  const patrons = useAppStore(selectPatrons)
  const books = useAppStore(selectBooks)
  const transactions = useAppStore(selectTransactions)

  const [tab, setTab] = useState<SegId>('all')

  const patronsById = useMemo(() => new Map(patrons.map((p) => [p.id, p])), [patrons])
  const booksById = useMemo(() => new Map(books.map((b) => [b.id, b])), [books])

  const filtered = useMemo(() => {
    const t = tabs.find((x) => x.id === tab)
    if (!t?.status) return transactions
    return transactions.filter((x) => x.status === t.status)
  }, [tab, transactions])

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-orange-500 dark:text-slate-400">Library Activity</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-display font-semibold text-slate-800 dark:text-white">Transactions</h2>
          </div>

          <IssueReturnButtons />
        </div>
      </motion.div>

      <div className="glass-panel-strong rounded-3xl p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const active = t.id === tab
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  'px-4 py-2 rounded-2xl border text-sm transition font-medium',
                  active
                    ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 text-teal-700 shadow-md dark:bg-white/10 dark:border-white/15 dark:text-white dark:shadow-glow-indigo/30 dark:from-transparent dark:to-transparent'
                    : 'bg-white/60 border-orange-100 text-slate-700 hover:bg-orange-50 hover:border-orange-200 dark:bg-white/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10',
                ].join(' ')}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-orange-100 dark:border-white/10">
          <div className="grid grid-cols-12 px-4 py-2 text-xs bg-orange-50/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-medium">
            <div className="col-span-3">Patron</div>
            <div className="col-span-3">Book</div>
            <div className="col-span-3">Dates</div>
            <div className="col-span-1 text-right">Fine</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          <div className="divide-y divide-orange-100 dark:divide-white/10">
            {filtered.map((t) => {
              const patron = patronsById.get(t.patronId)
              const book = booksById.get(t.bookId)

              const badgeClass =
                t.status === 'Overdue'
                  ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-200'
                  : t.status === 'Returned'
                    ? 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-brandCyan/10 dark:border-brandCyan/25 dark:text-brandCyan'
                    : 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-brandIndigo/10 dark:border-brandIndigo/25 dark:text-brandIndigo'

              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-12 px-4 py-3 items-center text-sm text-slate-800 dark:text-slate-100"
                >
                  <div className="col-span-3 flex items-center gap-3">
                    {patron ? <Avatar name={patron.name} /> : null}
                    <div>
                      <div className="font-semibold">{patron?.name ?? '—'}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{patron?.email ?? ''}</div>
                    </div>
                  </div>

                  <div className="col-span-3 text-slate-600 dark:text-slate-300">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{book?.title ?? '—'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{book?.author ?? ''}</div>
                  </div>

                  <div className="col-span-3 text-slate-600 dark:text-slate-300">
                    <div className="text-xs flex items-center gap-2">
                      <span className="inline-flex items-center gap-2">
                        <Clock size={14} className="text-orange-400 dark:text-slate-400" />
                        <span>
                          {formatDate(t.issueDate)} → <span className="text-slate-800 dark:text-slate-100 font-medium">{formatDate(t.dueDate)}</span>
                        </span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Return: {t.returnDate ? formatDate(t.returnDate) : '—'}</div>
                  </div>

                  <div className="col-span-1 text-right text-slate-700 dark:text-slate-300 font-medium">{formatINR(t.fineAmount)}</div>

                  <div className="col-span-2 text-right">
                    <span className={['inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium', badgeClass].join(' ')}>
                      <Shield size={14} />
                      {t.status}
                    </span>
                  </div>
                </motion.div>
              )
            })}

            {filtered.length === 0 ? <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No transactions in this filter.</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}


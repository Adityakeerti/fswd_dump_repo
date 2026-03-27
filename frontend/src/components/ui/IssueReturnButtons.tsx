import { useState, useMemo } from 'react'
import { ArrowLeftRight, RotateCcw } from 'lucide-react'
import ScanModal from './ScanModal'
import ReturnScanModal from './ReturnScanModal'
import { toISODate } from '../../lib/format'
import { useAppStore, selectPatrons, selectBooks, selectTransactions, selectIssueBook, selectReturnBook } from '../../state/store'

export default function IssueReturnButtons() {
  const patrons = useAppStore(selectPatrons)
  const books = useAppStore(selectBooks)
  const transactions = useAppStore(selectTransactions)
  const issueBook = useAppStore(selectIssueBook)
  const returnBook = useAppStore(selectReturnBook)

  const [issueOpen, setIssueOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)

  const patronsById = useMemo(() => new Map(patrons.map((p) => [p.id, p])), [patrons])
  const booksById = useMemo(() => new Map(books.map((b) => [b.id, b])), [books])

  const openReturnTxIds = useMemo(() => {
    return transactions.filter((t) => t.status === 'Issued' || t.status === 'Overdue')
  }, [transactions])

  const [issueForm, setIssueForm] = useState(() => ({
    patronId: '',
    bookId: '',
    dueDate: toISODate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
  }))

  const [returnForm, setReturnForm] = useState(() => ({
    transactionId: '' as string,
    returnDate: toISODate(new Date()),
  }))

  function openIssue() {
    setIssueForm({
      patronId: patrons[0]?.id ?? '',
      bookId: books.find((b) => b.availableCopies > 0)?.id ?? books[0]?.id ?? '',
      dueDate: toISODate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
    })
    setIssueOpen(true)
  }

  function handleScanReceived(bookId: string) {
    setIssueForm((f) => ({ ...f, bookId }))
  }

  function submitIssue() {
    if (!issueForm.patronId || !issueForm.bookId || !issueForm.dueDate) return
    issueBook({ patronId: issueForm.patronId, bookId: issueForm.bookId, dueDate: issueForm.dueDate })
    setIssueOpen(false)
  }

  function openReturn() {
    const first = openReturnTxIds[0]?.id ?? ''
    setReturnForm({ transactionId: first, returnDate: toISODate(new Date()) })
    setReturnOpen(true)
  }

  function handleReturnScanReceived(transactionId: string) {
    setReturnForm((f) => ({ ...f, transactionId }))
  }

  function submitReturn() {
    if (!returnForm.transactionId) return
    returnBook({ transactionId: returnForm.transactionId, returnDate: returnForm.returnDate })
    setReturnOpen(false)
  }

  return (
    <>
      <div className="flex gap-3 flex-wrap justify-end">
        <button
          onClick={openIssue}
          className="glass-panel-strong rounded-2xl px-4 py-2 hover:shadow-lg hover:shadow-teal-200/50 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:shadow-glow-teal transition inline-flex items-center gap-2 text-slate-800 dark:text-white"
        >
          <ArrowLeftRight size={16} />
          Issue Book
        </button>
        <button
          onClick={openReturn}
          className="glass-panel-strong rounded-2xl px-4 py-2 hover:shadow-lg hover:shadow-purple-200/50 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:shadow-glow-indigo transition inline-flex items-center gap-2 text-slate-800 dark:text-white"
        >
          <RotateCcw size={16} />
          Return Book
        </button>
      </div>

      <ScanModal
        open={issueOpen}
        title="Issue Book"
        onClose={() => setIssueOpen(false)}
        onScanReceived={handleScanReceived}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button className="bg-transparent border border-white/10 hover:bg-white/5 transition rounded-2xl px-4 py-2 text-sm text-slate-200" onClick={() => setIssueOpen(false)}>
              Cancel
            </button>
            <button className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-gradient-to-r from-brandTeal via-brandCyan to-brandIndigo text-sm font-semibold text-slate-950 shadow-glow-teal focus-ring hover:brightness-110 active:scale-[0.99] transition" onClick={submitIssue}>
              Issue
            </button>
          </div>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <div className="text-xs text-slate-300 mb-2">Patron</div>
            <select
              value={issueForm.patronId}
              onChange={(e) => setIssueForm((f) => ({ ...f, patronId: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-brandCyan/60 focus:border-brandCyan/30"
            >
              {patrons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="text-xs text-slate-300 mb-2">Book</div>
            <select
              value={issueForm.bookId}
              onChange={(e) => setIssueForm((f) => ({ ...f, bookId: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-brandCyan/60 focus:border-brandCyan/30"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                  {b.title} ({b.availableCopies} available)
                </option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <div className="text-xs text-slate-300 mb-2">Due Date</div>
            <input
              type="date"
              value={issueForm.dueDate}
              onChange={(e) => setIssueForm((f) => ({ ...f, dueDate: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-brandCyan/60 focus:border-brandCyan/30"
            />
          </label>
        </div>
      </ScanModal>

      <ReturnScanModal
        open={returnOpen}
        title="Return Book"
        onClose={() => setReturnOpen(false)}
        onScanReceived={handleReturnScanReceived}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button className="bg-transparent border border-white/10 hover:bg-white/5 transition rounded-2xl px-4 py-2 text-sm text-slate-200" onClick={() => setReturnOpen(false)}>
              Cancel
            </button>
            <button className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-gradient-to-r from-brandTeal via-brandCyan to-brandIndigo text-sm font-semibold text-slate-950 shadow-glow-teal focus-ring hover:brightness-110 active:scale-[0.99] transition" onClick={submitReturn}>
              Return
            </button>
          </div>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block sm:col-span-2">
            <div className="text-xs text-slate-300 mb-2">Transaction Lookup</div>
            <select
              value={returnForm.transactionId}
              onChange={(e) => setReturnForm((f) => ({ ...f, transactionId: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-brandCyan/60 focus:border-brandCyan/30"
            >
              {openReturnTxIds.map((t) => {
                const patron = patronsById.get(t.patronId)
                const book = booksById.get(t.bookId)
                return (
                  <option key={t.id} value={t.id}>
                    {t.id} — {book?.title ?? 'Book'} / {patron?.name ?? 'Patron'}
                  </option>
                )
              })}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <div className="text-xs text-slate-300 mb-2">Return Date</div>
            <input
              type="date"
              value={returnForm.returnDate}
              onChange={(e) => setReturnForm((f) => ({ ...f, returnDate: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-brandCyan/60 focus:border-brandCyan/30"
            />
          </label>
        </div>
      </ReturnScanModal>
    </>
  )
}

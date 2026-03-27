import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, UserRound, ShieldCheck, Ban, Search, UserPlus } from 'lucide-react'

import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import IssueReturnButtons from '../components/ui/IssueReturnButtons'
import { formatDate } from '../lib/format'
import { useAppStore, selectPatrons, selectAddPatron, selectSetPatronStatus, selectDeletePatron } from '../state/store'

function InitialAvatar({ name }: { name: string }) {
  const parts = name.split(' ').filter(Boolean)
  const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
  return (
    <div className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-200 dark:bg-white/5 dark:border-white/10 glass-panel flex items-center justify-center text-teal-700 dark:text-slate-100 font-semibold">
      {initials.toUpperCase()}
    </div>
  )
}

type PatronForm = { name: string; email: string; password: string; role: 'Librarian' | 'Patron' }

export default function Users() {
  const patrons = useAppStore(selectPatrons)
  const addPatron = useAppStore(selectAddPatron)
  const setPatronStatus = useAppStore(selectSetPatronStatus)
  const deletePatron = useAppStore(selectDeletePatron)

  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return patrons
    return patrons.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
  }, [patrons, query])

  const [addOpen, setAddOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [form, setForm] = useState<PatronForm>({ name: '', email: '', password: '', role: 'Patron' })

  function openAdd() {
    setForm({ name: '', email: '', password: '', role: 'Patron' })
    setAddOpen(true)
  }

  function submitAdd() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return
    addPatron({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
      role: form.role,
    })
    setAddOpen(false)
  }

  function confirmDelete(id: string) {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  function doDelete() {
    if (!deleteId) return
    deletePatron(deleteId)
    setDeleteOpen(false)
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="text-xs text-orange-500 dark:text-slate-400">People</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-display font-semibold text-slate-800 dark:text-white">Patrons / Users</h2>
          </div>

          <div className="flex gap-3 flex-wrap justify-end">
            <button
              onClick={openAdd}
              className="glass-panel-strong rounded-2xl px-4 py-2 hover:shadow-lg hover:shadow-purple-200/50 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:shadow-none transition flex items-center gap-2 text-slate-800 dark:text-white"
            >
              <UserPlus size={16} />
              Add Patron
            </button>
            <IssueReturnButtons />
          </div>
        </div>
      </motion.div>

      <div className="glass-panel-strong rounded-3xl p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="glass-panel flex items-center gap-2 px-3 py-2 w-full max-w-xl">
            <Search size={16} className="text-orange-400 dark:text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-orange-400/60 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="Search by name or email..."
            />
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-orange-100 dark:border-white/10">
          <div className="grid grid-cols-12 px-4 py-2 text-xs bg-orange-50/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-medium">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Joined</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          <div className="divide-y divide-orange-100 dark:divide-white/10">
            {filtered.map((r) => (
              <div key={r.id} className="grid grid-cols-12 px-4 py-3 items-center text-sm text-slate-800 dark:text-slate-100">
                <div className="col-span-3 flex items-center gap-3">
                  <InitialAvatar name={r.name} />
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400"> </div>
                  </div>
                </div>
                <div className="col-span-3 text-slate-600 dark:text-slate-300">{r.email}</div>
                <div className="col-span-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 text-teal-700 dark:bg-brandCyan/10 dark:border-brandCyan/25 dark:text-brandCyan px-3 py-1 text-xs font-medium">
                    <ShieldCheck size={14} />
                    {r.role}
                  </span>
                </div>
                <div className="col-span-2">
                  <span
                    className={[
                      'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border font-medium',
                      r.status === 'Active'
                        ? 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-brandTeal/15 dark:border-brandTeal/30 dark:text-brandCyan'
                        : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-200',
                    ].join(' ')}
                  >
                    {r.status === 'Active' ? <UserRound size={14} /> : <Ban size={14} />}
                    {r.status}
                  </span>
                </div>
                <div className="col-span-1 text-slate-500 dark:text-slate-300 text-xs">{formatDate(r.joinedAt)}</div>
                <div className="col-span-1 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setPatronStatus(r.id, r.status === 'Active' ? 'Suspended' : 'Active')}
                      className="p-2 rounded-xl border border-orange-200 bg-white/60 hover:bg-orange-50 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition"
                      aria-label="Toggle suspend"
                      title={r.status === 'Active' ? 'Suspend' : 'Activate'}
                    >
                      {r.status === 'Active' ? <Ban size={16} className="text-rose-600 dark:text-rose-200 inline" /> : <UserRound size={16} className="text-teal-600 dark:text-brandCyan inline" />}
                    </button>

                    <button
                      onClick={() => confirmDelete(r.id)}
                      className="p-2 rounded-xl border border-orange-200 bg-white/60 hover:bg-rose-50 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:bg-rose-500/10 transition"
                      aria-label="Delete user"
                      title="Delete"
                    >
                      <Trash2 size={16} className="inline text-rose-600 dark:text-rose-200" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 ? <div className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">No patrons found.</div> : null}
          </div>
        </div>
      </div>

      <Modal
        open={addOpen}
        title="Add Patron"
        onClose={() => setAddOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              className="bg-transparent border border-white/10 hover:bg-white/5 transition rounded-2xl px-4 py-2 text-sm text-slate-200"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-gradient-to-r from-brandTeal via-brandCyan to-brandIndigo text-sm font-semibold text-slate-950 shadow-glow-teal focus-ring hover:brightness-110 active:scale-[0.99] transition"
              onClick={submitAdd}
            >
              Add Patron
            </button>
          </div>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />

          <label className="block sm:col-span-2">
            <div className="text-xs text-slate-300 mb-2">Role</div>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as PatronForm['role'] }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-brandCyan/60 focus:border-brandCyan/30"
            >
              <option value="Librarian">Librarian</option>
              <option value="Patron">Patron</option>
            </select>
          </label>
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        title="Delete Patron"
        onClose={() => setDeleteOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              className="bg-transparent border border-white/10 hover:bg-white/5 transition rounded-2xl px-4 py-2 text-sm text-slate-200"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-rose-500/15 border border-rose-500/30 text-sm font-semibold text-rose-200 hover:bg-rose-500/20 transition focus-ring"
              onClick={doDelete}
            >
              Confirm Delete
            </button>
          </div>
        }
      >
        <div className="text-sm text-slate-300">This will remove the patron from the mock system.</div>
      </Modal>
    </div>
  )
}


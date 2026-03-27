import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'

import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { formatDate } from '../lib/format'
import { useAppStore, selectCategories, selectBooks, selectAddCategory, selectDeleteCategory } from '../state/store'

type CategoryForm = { name: string; description: string }

export default function Categories() {
  const categories = useAppStore(selectCategories)
  const books = useAppStore(selectBooks)

  const addCategory = useAppStore(selectAddCategory)
  const deleteCategory = useAppStore(selectDeleteCategory)

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [form, setForm] = useState<CategoryForm>({ name: '', description: '' })

  const bookCountByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const b of books) map.set(b.categoryId, (map.get(b.categoryId) ?? 0) + 1)
    return map
  }, [books])

  function submit() {
    if (!form.name.trim()) return
    addCategory({ name: form.name.trim(), description: form.description.trim() })
    setModalOpen(false)
  }

  function confirmDelete(id: string) {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  function doDelete() {
    if (!deleteId) return
    deleteCategory(deleteId)
    setDeleteOpen(false)
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-orange-500 dark:text-slate-400">Organization</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-display font-semibold text-slate-800 dark:text-white">Categories</h2>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="glass-panel-strong rounded-2xl px-4 py-2 hover:shadow-lg hover:shadow-purple-200/50 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:shadow-none transition inline-flex items-center gap-2 text-slate-800 dark:text-white"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </motion.div>

      <div className="glass-panel-strong rounded-3xl p-4">
        <div className="overflow-hidden rounded-2xl border border-orange-100 dark:border-white/10">
          <div className="grid grid-cols-12 px-4 py-2 text-xs bg-orange-50/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-medium">
            <div className="col-span-3">Name</div>
            <div className="col-span-5">Description</div>
            <div className="col-span-2 text-right">Books</div>
            <div className="col-span-1 text-right">Created</div>
            <div className="col-span-1 text-right">Delete</div>
          </div>

          <div className="divide-y divide-orange-100 dark:divide-white/10">
            {categories.map((c) => (
              <div key={c.id} className="grid grid-cols-12 px-4 py-3 items-center text-sm text-slate-800 dark:text-slate-100">
                <div className="col-span-3 font-semibold">{c.name}</div>
                <div className="col-span-5 text-slate-600 dark:text-slate-300">{c.description}</div>
                <div className="col-span-2 text-right">
                  <span className="inline-flex items-center justify-center rounded-full bg-teal-50 border border-teal-200 text-teal-700 dark:bg-brandCyan/10 dark:border-brandCyan/25 dark:text-brandCyan px-3 py-1 text-xs font-medium">
                    {bookCountByCategory.get(c.id) ?? 0}
                  </span>
                </div>
                <div className="col-span-1 text-right text-slate-500 dark:text-slate-300 text-xs">{formatDate(c.createdAt)}</div>
                <div className="col-span-1 text-right">
                  <button
                    onClick={() => confirmDelete(c.id)}
                    className="p-2 rounded-xl border border-orange-200 bg-white/60 hover:bg-rose-50 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:bg-rose-500/10 transition"
                    aria-label={`Delete ${c.name}`}
                  >
                    <Trash2 size={16} className="inline text-rose-600 dark:text-rose-200" />
                  </button>
                </div>
              </div>
            ))}

            {categories.length === 0 ? (
              <div className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">No categories yet.</div>
            ) : null}
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title="Add Category"
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button className="bg-transparent border border-white/10 hover:bg-white/5 transition rounded-2xl px-4 py-2 text-sm text-slate-200" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-gradient-to-r from-brandTeal via-brandCyan to-brandIndigo text-sm font-semibold text-slate-950 shadow-glow-teal focus-ring hover:brightness-110 active:scale-[0.99] transition" onClick={submit}>
              Add Category
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <label className="block">
            <div className="text-xs text-slate-300 mb-2">Description</div>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-brandCyan/60 focus:border-brandCyan/30"
              rows={3}
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        title="Delete Category"
        onClose={() => setDeleteOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button className="bg-transparent border border-white/10 hover:bg-white/5 transition rounded-2xl px-4 py-2 text-sm text-slate-200" onClick={() => setDeleteOpen(false)}>
              Cancel
            </button>
            <button className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-rose-500/15 border border-rose-500/30 text-sm font-semibold text-rose-200 hover:bg-rose-500/20 transition focus-ring" onClick={doDelete}>
              Confirm Delete
            </button>
          </div>
        }
      >
        <div className="text-sm text-slate-300">This will remove the category from the catalog (mock).</div>
      </Modal>
    </div>
  )
}


import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import IssueReturnButtons from '../components/ui/IssueReturnButtons'
import { useAppStore, selectBooks, selectCategories, selectAddBook, selectUpdateBook, selectDeleteBook } from '../state/store'

type BookForm = {
  title: string
  author: string
  publisher: string
  isbn: string
  barcodeId: string
  categoryId: string
  copies: string
}

export default function Books() {
  const books = useAppStore(selectBooks)
  const categories = useAppStore(selectCategories)

  const addBook = useAppStore(selectAddBook)
  const updateBook = useAppStore(selectUpdateBook)
  const deleteBook = useAppStore(selectDeleteBook)

  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [form, setForm] = useState<BookForm>({
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    barcodeId: '',
    categoryId: categories[0]?.id ?? '',
    copies: '1',
  })

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return books
    return books.filter((b) => {
      const cat = categoryById.get(b.categoryId)?.name ?? ''
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q)
      )
    })
  }, [books, query, categoryById])

  function openAdd() {
    setMode('add')
    setEditingId(null)
    setForm({
      title: '',
      author: '',
      publisher: '',
      isbn: '',
      barcodeId: '',
      categoryId: categories[0]?.id ?? '',
      copies: '1',
    })
    setModalOpen(true)
  }

  function openEdit(id: string) {
    const book = books.find((b) => b.id === id)
    if (!book) return
    setMode('edit')
    setEditingId(id)
    setForm({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      isbn: book.isbn,
      barcodeId: book.barcodeId,
      categoryId: book.categoryId,
      copies: String(book.totalCopies),
    })
    setModalOpen(true)
  }

  function submit() {
    const copies = Math.max(0, Number.parseInt(form.copies || '0', 10) || 0)
    if (!form.title.trim() || !form.author.trim() || !form.isbn.trim() || !form.categoryId) return

    if (mode === 'add') {
      addBook({
        title: form.title.trim(),
        author: form.author.trim(),
        publisher: form.publisher.trim(),
        isbn: form.isbn.trim(),
        barcodeId: form.barcodeId.trim(),
        categoryId: form.categoryId,
        totalCopies: copies,
        availableCopies: copies,
      })
    } else if (mode === 'edit' && editingId) {
      const existing = books.find((b) => b.id === editingId)
      const nextAvailable = existing ? Math.min(existing.availableCopies, copies) : copies
      updateBook(editingId, {
        title: form.title.trim(),
        author: form.author.trim(),
        publisher: form.publisher.trim(),
        isbn: form.isbn.trim(),
        barcodeId: form.barcodeId.trim(),
        categoryId: form.categoryId,
        totalCopies: copies,
        availableCopies: nextAvailable,
      })
    }

    setModalOpen(false)
  }

  function confirmDelete(id: string) {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  function doDelete() {
    if (!deleteId) return
    deleteBook(deleteId)
    setDeleteOpen(false)
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-orange-500 dark:text-slate-400">Catalog</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-display font-semibold text-slate-800 dark:text-white">Books</h2>
          </div>

          <div className="flex gap-3 flex-wrap justify-end">
            <button
              onClick={openAdd}
              className="glass-panel-strong rounded-2xl px-4 py-2 hover:shadow-lg hover:shadow-teal-200/50 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:shadow-none transition flex items-center gap-2 text-slate-800 dark:text-white"
            >
              <Plus size={16} />
              Add Book
            </button>
            <IssueReturnButtons />
          </div>
        </div>
      </motion.div>

      <div className="glass-panel-strong rounded-3xl p-4">
        <div className="flex items-center gap-3">
          <div className="glass-panel flex items-center gap-2 px-3 py-2 w-full max-w-xl">
            <Search size={16} className="text-orange-400 dark:text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-orange-400/60 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="Search by title, author, ISBN..."
            />
          </div>

          <button className="hidden sm:inline-flex px-4 py-2 rounded-2xl border border-orange-200 bg-white/60 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition text-sm text-slate-700 dark:text-slate-100">
            Export
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs bg-orange-50/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-medium">
            <div className="col-span-3">Title</div>
            <div className="col-span-2">Author</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">ISBN</div>
            <div className="col-span-1 text-center">Total</div>
            <div className="col-span-1 text-center">Available</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          <div className="divide-y divide-orange-100 dark:divide-white/10">
            {filteredBooks.map((r) => {
              const cat = categoryById.get(r.categoryId)
              const availableTone =
                r.availableCopies > 0
                  ? 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-brandTeal/15 dark:border-brandTeal/30 dark:text-brandCyan'
                  : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-200'

              return (
                <div key={r.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm text-slate-800 dark:text-slate-100">
                  <div className="col-span-3 font-semibold">{r.title}</div>
                  <div className="col-span-2 text-slate-600 dark:text-slate-300">{r.author}</div>
                  <div className="col-span-2 text-slate-600 dark:text-slate-300">
                    {cat?.name ?? '—'}
                  </div>
                  <div className="col-span-2 text-slate-600 dark:text-slate-300 font-mono text-xs">{r.isbn}</div>
                  <div className="col-span-1 text-center text-slate-600 dark:text-slate-300">{r.totalCopies}</div>
                  <div className="col-span-1 flex justify-center">
                    <span className={['inline-flex items-center rounded-full px-3 py-1 text-xs border font-medium', availableTone].join(' ')}>
                      {r.availableCopies}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(r.id)}
                      className="p-2 rounded-xl border border-orange-200 bg-white/60 hover:bg-orange-50 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition"
                      aria-label={`Edit ${r.title}`}
                    >
                      <Pencil size={16} className="text-teal-600 dark:text-slate-200" />
                    </button>
                    <button
                      onClick={() => confirmDelete(r.id)}
                      className="p-2 rounded-xl border border-orange-200 bg-white/60 hover:bg-rose-50 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:bg-rose-500/10 transition"
                      aria-label={`Delete ${r.title}`}
                    >
                      <Trash2 size={16} className="text-rose-600 dark:text-rose-200" />
                    </button>
                  </div>
                </div>
              )
            })}

            {filteredBooks.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No books match your search.</div>
            ) : null}
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={mode === 'add' ? 'Add Book' : 'Edit Book'}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex items-center justify-between gap-3">
            <button className="bg-transparent border border-white/10 hover:bg-white/5 transition rounded-2xl px-4 py-2 text-sm text-slate-200" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-gradient-to-r from-brandTeal via-brandCyan to-brandIndigo text-sm font-semibold text-slate-950 shadow-glow-teal focus-ring hover:brightness-110 active:scale-[0.99] transition" onClick={submit}>
              {mode === 'add' ? 'Add Book' : 'Save Changes'}
            </button>
          </div>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Input label="Author" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
          <Input label="Publisher" value={form.publisher} onChange={(e) => setForm((f) => ({ ...f, publisher: e.target.value }))} />
          <Input label="ISBN" value={form.isbn} onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))} />
          <Input label="Barcode ID" value={form.barcodeId} onChange={(e) => setForm((f) => ({ ...f, barcodeId: e.target.value }))} />

          <label className="block">
            <div className="text-xs text-slate-300 mb-2">Category</div>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-brandCyan/60 focus:border-brandCyan/30"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <Input
            label="Copies count"
            type="number"
            min={0}
            value={form.copies}
            onChange={(e) => setForm((f) => ({ ...f, copies: e.target.value }))}
          />
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        title="Delete Book"
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
        <div className="text-sm text-slate-300">
          This action will remove the book from the catalog (mock). If you want to keep history in transactions, we can switch to a “soft delete” later.
        </div>
      </Modal>
    </div>
  )
}


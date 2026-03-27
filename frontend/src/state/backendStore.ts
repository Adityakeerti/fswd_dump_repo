import { create } from 'zustand'
import { daysBetween, toISODate } from '../lib/format'
import { useAuthStore } from './authStore'

type BackendBook = {
  id: number
  title: string
  author: string
  publisher?: string | null
  isbn?: string | null
  category_id?: number | null
  category_name?: string | null
  description?: string | null
  total_copies?: number
  available_copies?: number
  created_at?: string | null
}

type BackendCategory = {
  id: number
  name: string
  description?: string | null
  created_at?: string | null
}

type BackendUser = {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
  created_at?: string | null
}

type BackendTransaction = {
  id: number
  user_id: number
  user_name: string
  book_id: number
  book_title: string
  issue_date: string
  due_date: string
  return_date: string | null
  fine_amount: number
  status: string // issued/returned/overdue
  created_at?: string | null
}

type DashboardStats = {
  total_books: number
  total_copies: number
  available_copies: number
  availability_percentage: number
  total_users: number
  new_users_this_week: number
  total_issued: number
  overdue_count: number
  total_fines: number
  circulation_data: { month: string; issued: number; returned: number }[]
  category_stats: { name: string; count: number }[]
}

export type Book = {
  id: string
  title: string
  author: string
  publisher: string
  isbn: string
  barcodeId: string
  categoryId: string
  categoryName?: string
  totalCopies: number
  availableCopies: number
}

export type Category = {
  id: string
  name: string
  description: string
  createdAt: string
}

export type Patron = {
  id: string
  name: string
  email: string
  role: 'Librarian' | 'Patron'
  status: 'Active' | 'Suspended'
  joinedAt: string
}

export type Transaction = {
  id: string
  patronId: string
  bookId: string
  issueDate: string
  dueDate: string
  returnDate: string | null
  fineAmount: number
  status: 'Issued' | 'Returned' | 'Overdue'
}

const backend = () => import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'

async function apiFetch<T>(
  path: string,
  opts?: {
    method?: string
    body?: unknown
    auth?: boolean
  },
): Promise<T> {
  const token = useAuthStore.getState().accessToken
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (opts?.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`
    console.log('[apiFetch] Sending request with token:', token.substring(0, 20) + '...')
  } else if (opts?.auth !== false) {
    console.warn('[apiFetch] No token available for authenticated request to:', path)
  }

  const res = await fetch(`${backend()}${path}`, {
    method: opts?.method ?? 'GET',
    headers,
    body: opts?.body === undefined ? undefined : JSON.stringify(opts.body),
  })

  const text = await res.text()
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const parsed = JSON.parse(text) as { error?: string; message?: string }
      message = parsed.error ?? parsed.message ?? message
    } catch {
      // ignore
    }
    console.error('[apiFetch] Request failed:', path, res.status, message)
    throw new Error(message)
  }

  return text ? (JSON.parse(text) as T) : (undefined as unknown as T)
}

type AppState = {
  loading: boolean
  error: string | null
  loaded: boolean

  dashboardStats: DashboardStats | null
  books: Book[]
  patrons: Patron[]
  categories: Category[]
  transactions: Transaction[]

  // UI-ish state
  scanContext: 'issue' | 'return' | null
  scannedBarcodeId: string | null

  hydrateAll: () => Promise<void>

  addBook: (input: {
    title: string
    author: string
    publisher: string
    isbn: string
    barcodeId: string
    categoryId: string
    totalCopies: number
    availableCopies?: number
  }) => Promise<void>
  updateBook: (id: string, patch: Partial<Omit<Book, 'id'>>) => Promise<void>
  deleteBook: (id: string) => Promise<void>

  addPatron: (input: { name: string; email: string; password: string; role: Patron['role'] }) => Promise<void>
  setPatronStatus: (id: string, status: Patron['status']) => Promise<void>
  deletePatron: (id: string) => Promise<void>

  addCategory: (input: { name: string; description: string }) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  issueBook: (input: { patronId: string; bookId: string; dueDate: string }) => Promise<void>
  returnBook: (input: { transactionId: string; returnDate?: string | null }) => Promise<void>
  recalculateFines: () => Promise<void>

  setScanContext: (ctx: 'issue' | 'return' | null) => void
  setScannedBarcode: (barcodeId: string | null) => void
}

function toTitleStatus(s: string): Transaction['status'] {
  const v = s.toLowerCase()
  if (v === 'issued') return 'Issued'
  if (v === 'returned') return 'Returned'
  if (v === 'overdue') return 'Overdue'
  return 'Issued'
}

function normalizeBook(b: BackendBook): Book {
  return {
    id: String(b.id),
    title: b.title ?? '',
    author: b.author ?? '',
    publisher: b.publisher ?? '',
    isbn: b.isbn ?? '',
    barcodeId: '',
    categoryId: b.category_id == null ? '' : String(b.category_id),
    categoryName: b.category_name ?? undefined,
    totalCopies: Number(b.total_copies ?? 0),
    availableCopies: Number(b.available_copies ?? 0),
  }
}

function normalizeCategory(c: BackendCategory): Category {
  return {
    id: String(c.id),
    name: c.name,
    description: c.description ?? '',
    createdAt: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
  }
}

function normalizeUser(u: BackendUser): Patron {
  const role: Patron['role'] = u.role === 'librarian' ? 'Librarian' : 'Patron'
  return {
    id: String(u.id),
    name: u.name ?? '',
    email: u.email ?? '',
    role,
    status: u.is_active ? 'Active' : 'Suspended',
    joinedAt: u.created_at ? new Date(u.created_at).toISOString().slice(0, 10) : toISODate(new Date()),
  }
}

function normalizeTx(t: BackendTransaction): Transaction {
  return {
    id: String(t.id),
    patronId: String(t.user_id),
    bookId: String(t.book_id),
    issueDate: t.issue_date,
    dueDate: t.due_date,
    returnDate: t.return_date,
    fineAmount: Number(t.fine_amount ?? 0),
    status: toTitleStatus(t.status),
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  loading: false,
  error: null,
  loaded: false,

  dashboardStats: null,
  books: [],
  patrons: [],
  categories: [],
  transactions: [],

  scanContext: null,
  scannedBarcodeId: null,

  hydrateAll: async () => {
    set({ loading: true, error: null })
    try {
      const [
        stats,
        booksRes,
        categoriesRes,
        usersRes,
        transactionsRes,
      ] = await Promise.all([
        apiFetch<DashboardStats>('/api/dashboard/stats', { auth: true }),
        apiFetch<{ books: BackendBook[] }>('/api/books?per_page=100&page=1', { auth: true }),
        apiFetch<BackendCategory[]>('/api/categories', { auth: true }),
        apiFetch<{ users: BackendUser[] }>('/api/users?per_page=100&page=1', { auth: true }),
        apiFetch<{ transactions: BackendTransaction[] }>('/api/transactions?per_page=100&page=1', { auth: true }),
      ])

      set({
        dashboardStats: stats,
        books: booksRes.books.map(normalizeBook),
        categories: (Array.isArray(categoriesRes) ? categoriesRes : []).map(normalizeCategory),
        patrons: (usersRes.users ?? []).map(normalizeUser),
        transactions: (transactionsRes.transactions ?? []).map(normalizeTx),
        loaded: true,
        loading: false,
        error: null,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, loading: false, loaded: false })
    }
  },

  addBook: async (input) => {
    const category_id = input.categoryId ? Number(input.categoryId) : undefined
    await apiFetch('/api/books', {
      method: 'POST',
      auth: true,
      body: {
        title: input.title,
        author: input.author,
        publisher: input.publisher,
        isbn: input.isbn,
        category_id,
        // backend create_book ignores barcode_id unless we wire it; keep for future
        barcode_id: input.barcodeId,
        total_copies: input.totalCopies,
        description: '',
      },
    }).catch((e: unknown) => {
      throw e
    })

    await get().hydrateAll()
  },

  updateBook: async (id, patch) => {
    const bookId = Number(id)
    const payload: Record<string, unknown> = {}
    if (patch.title) payload.title = patch.title
    if (patch.author) payload.author = patch.author
    if (patch.publisher) payload.publisher = patch.publisher
    if (patch.isbn) payload.isbn = patch.isbn
    if (patch.categoryId !== undefined) payload.category_id = patch.categoryId ? Number(patch.categoryId) : null
    if (patch.totalCopies !== undefined) payload.total_copies = patch.totalCopies

    // barcode_id + available_copies aren't supported in update_book; pass for future compatibility
    if (typeof patch.barcodeId === 'string') payload.barcode_id = patch.barcodeId

    await apiFetch(`/api/books/${bookId}`, { method: 'PUT', auth: true, body: payload }).catch((e: unknown) => {
      throw e
    })
    await get().hydrateAll()
  },

  deleteBook: async (id) => {
    const bookId = Number(id)
    await apiFetch(`/api/books/${bookId}`, { method: 'DELETE', auth: true }).catch(() => undefined)
    await get().hydrateAll()
  },

  addPatron: async (input) => {
    const role = input.role === 'Librarian' ? 'librarian' : 'user'
    await apiFetch('/api/users', {
      method: 'POST',
      auth: true,
      body: { name: input.name, email: input.email, password: input.password, role },
    }).catch((e: unknown) => {
      throw e
    })
    await get().hydrateAll()
  },

  setPatronStatus: async (id, status) => {
    const userId = Number(id)
    const is_active = status === 'Active'
    await apiFetch(`/api/users/${userId}`, { method: 'PUT', auth: true, body: { is_active } })
    await get().hydrateAll()
  },

  deletePatron: async (id) => {
    const userId = Number(id)
    await apiFetch(`/api/users/${userId}`, { method: 'DELETE', auth: true }).catch(() => undefined)
    await get().hydrateAll()
  },

  addCategory: async (input) => {
    await apiFetch('/api/categories', {
      method: 'POST',
      auth: true,
      body: {
        name: input.name,
        description: input.description,
      },
    })
    await get().hydrateAll()
  },

  deleteCategory: async (id) => {
    const categoryId = Number(id)
    await apiFetch(`/api/categories/${categoryId}`, { method: 'DELETE', auth: true }).catch(() => undefined)
    await get().hydrateAll()
  },

  issueBook: async ({ patronId, bookId, dueDate }) => {
    await apiFetch('/api/transactions/issue', {
      method: 'POST',
      auth: true,
      body: {
        user_id: Number(patronId),
        book_id: Number(bookId),
        due_date: dueDate,
      },
    })
    await get().hydrateAll()
  },

  returnBook: async ({ transactionId }) => {
    // backend return_book ignores return_date; it uses server-side return time
    await apiFetch('/api/transactions/return', {
      method: 'POST',
      auth: true,
      body: { transaction_id: Number(transactionId) },
    })
    await get().hydrateAll()
  },

  recalculateFines: async () => {
    await apiFetch('/api/fines/update', { method: 'POST', auth: true })
    await get().hydrateAll()
  },

  setScanContext: (ctx) => set({ scanContext: ctx }),
  setScannedBarcode: (barcodeId) => set({ scannedBarcodeId: barcodeId }),
}))

type KpiValue = ReturnType<typeof computeKpis>
function computeKpis(state: AppState) {
  const stats = state.dashboardStats
  if (stats) {
    return {
      booksCheckedOut: stats.total_issued,
      overdueCount: stats.overdue_count,
      inventoryPct: Math.round(stats.availability_percentage),
      activePatrons: stats.total_users,
      totalFines: stats.total_fines,
    }
  }

  const totalCopies = state.books.reduce((a, b) => a + b.totalCopies, 0)
  const availableCopies = state.books.reduce((a, b) => a + b.availableCopies, 0)
  const inventoryPct = totalCopies === 0 ? 0 : Math.round((availableCopies / totalCopies) * 100)

  const overdueTx = state.transactions.filter((t) => t.status === 'Overdue')
  const overdueCount = overdueTx.length
  const totalFines = overdueTx.reduce((a, t) => a + t.fineAmount, 0)

  const issuedCount = state.transactions.filter((t) => t.status === 'Issued').length
  const activePatrons = state.patrons.filter((p) => p.status === 'Active').length

  return {
    booksCheckedOut: issuedCount,
    overdueCount,
    inventoryPct,
    activePatrons,
    totalFines,
  }
}

let kpisCache:
  | {
      statsRef: DashboardStats | null
      booksRef: Book[]
      patronsRef: Patron[]
      txRef: Transaction[]
      value: KpiValue
    }
  | null = null

export const selectKpis = (state: AppState): KpiValue => {
  const statsRef = state.dashboardStats
  if (
    kpisCache &&
    kpisCache.statsRef === statsRef &&
    kpisCache.booksRef === state.books &&
    kpisCache.patronsRef === state.patrons &&
    kpisCache.txRef === state.transactions
  ) {
    return kpisCache.value
  }

  const value = computeKpis(state)
  kpisCache = { statsRef, booksRef: state.books, patronsRef: state.patrons, txRef: state.transactions, value }
  return value
}

// ---------------------------------------------------------------------------
// Convenience selectors (keeps existing pages unchanged)
// ---------------------------------------------------------------------------
export const selectBooks = (state: AppState) => state.books
export const selectCategories = (state: AppState) => state.categories
export const selectPatrons = (state: AppState) => state.patrons
export const selectTransactions = (state: AppState) => state.transactions

export const selectAddBook = (state: AppState) => state.addBook
export const selectUpdateBook = (state: AppState) => state.updateBook
export const selectDeleteBook = (state: AppState) => state.deleteBook

export const selectAddPatron = (state: AppState) => state.addPatron
export const selectSetPatronStatus = (state: AppState) => state.setPatronStatus
export const selectDeletePatron = (state: AppState) => state.deletePatron

export const selectAddCategory = (state: AppState) => state.addCategory
export const selectDeleteCategory = (state: AppState) => state.deleteCategory

export const selectIssueBook = (state: AppState) => state.issueBook
export const selectReturnBook = (state: AppState) => state.returnBook

export const selectRecalculateFines = (state: AppState) => state.recalculateFines

type DueSoonRow = ReturnType<typeof computeDueSoon>[number]
function computeDueSoon(state: AppState) {
  const patronsById = new Map(state.patrons.map((p) => [p.id, p]))
  const booksById = new Map(state.books.map((b) => [b.id, b]))
  const todayKey = toISODate(new Date())
  const horizonDays = 3

  return state.transactions
    .filter((t) => t.status === 'Issued')
    .map((t) => {
      const patron = patronsById.get(t.patronId)
      const book = booksById.get(t.bookId)
      const daysLeft = daysBetween(todayKey, t.dueDate)
      return { transactionId: t.id, title: book?.title, patronName: patron?.name, daysLeft }
    })
    .filter((x) => x.title && x.patronName && x.daysLeft >= 0 && x.daysLeft <= horizonDays)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 6)
}

let dueSoonCache:
  | {
      txRef: Transaction[]
      booksRef: Book[]
      patronsRef: Patron[]
      todayKey: string
      value: DueSoonRow[]
    }
  | null = null

export const selectDueSoon = (state: AppState): DueSoonRow[] => {
  const todayKey = toISODate(new Date())
  if (
    dueSoonCache &&
    dueSoonCache.txRef === state.transactions &&
    dueSoonCache.booksRef === state.books &&
    dueSoonCache.patronsRef === state.patrons &&
    dueSoonCache.todayKey === todayKey
  ) {
    return dueSoonCache.value
  }

  const value = computeDueSoon(state)
  dueSoonCache = { txRef: state.transactions, booksRef: state.books, patronsRef: state.patrons, todayKey, value }
  return value
}

type RecentTxRow = ReturnType<typeof computeRecentTransactions>[number]
function computeRecentTransactions(state: AppState) {
  const patronsById = new Map(state.patrons.map((p) => [p.id, p]))
  const booksById = new Map(state.books.map((b) => [b.id, b]))

  const sorted = [...state.transactions].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())

  return sorted.slice(0, 3).map((t) => ({
    transactionId: t.id,
    when: new Date(t.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    action: t.status,
    what: booksById.get(t.bookId)?.title ?? 'Unknown',
    who: patronsById.get(t.patronId)?.name ?? 'Unknown',
  }))
}

let recentTxCache:
  | {
      txRef: Transaction[]
      booksRef: Book[]
      patronsRef: Patron[]
      value: RecentTxRow[]
    }
  | null = null

export const selectRecentTransactions = (state: AppState): RecentTxRow[] => {
  if (
    recentTxCache &&
    recentTxCache.txRef === state.transactions &&
    recentTxCache.booksRef === state.books &&
    recentTxCache.patronsRef === state.patrons
  ) {
    return recentTxCache.value
  }
  const value = computeRecentTransactions(state)
  recentTxCache = { txRef: state.transactions, booksRef: state.books, patronsRef: state.patrons, value }
  return value
}

type OverdueRow = ReturnType<typeof computeOverdueRows>[number]
function computeOverdueRows(state: AppState) {
  const patronsById = new Map(state.patrons.map((p) => [p.id, p]))
  const booksById = new Map(state.books.map((b) => [b.id, b]))
  const todayKey = toISODate(new Date())

  return state.transactions
    .filter((t) => t.status === 'Overdue')
    .map((t) => {
      const patron = patronsById.get(t.patronId)
      const book = booksById.get(t.bookId)
      const daysOverdue = Math.max(0, daysBetween(t.dueDate, todayKey))
      return {
        transactionId: t.id,
        patron,
        book,
        issueDate: t.issueDate,
        dueDate: t.dueDate,
        daysOverdue,
        fineAmount: t.fineAmount,
      }
    })
    .filter((r) => r.patron && r.book)
}

let overdueRowsCache:
  | {
      txRef: Transaction[]
      booksRef: Book[]
      patronsRef: Patron[]
      todayKey: string
      value: OverdueRow[]
    }
  | null = null

export const selectOverdueRows = (state: AppState): OverdueRow[] => {
  const todayKey = toISODate(new Date())
  if (
    overdueRowsCache &&
    overdueRowsCache.txRef === state.transactions &&
    overdueRowsCache.booksRef === state.books &&
    overdueRowsCache.patronsRef === state.patrons &&
    overdueRowsCache.todayKey === todayKey
  ) {
    return overdueRowsCache.value
  }
  const value = computeOverdueRows(state)
  overdueRowsCache = { txRef: state.transactions, booksRef: state.books, patronsRef: state.patrons, todayKey, value }
  return value
}

export const selectDashboardStats = (state: AppState) => state.dashboardStats

type MonthlyTrendRow = ReturnType<typeof computeMonthlyCirculationTrend>[number]
function computeMonthlyCirculationTrend(state: AppState) {
  const stats = state.dashboardStats
  if (!stats) return []
  return stats.circulation_data.map((d) => ({ name: d.month, value: d.issued }))
}

let monthlyCache: { statsRef: DashboardStats | null; value: MonthlyTrendRow[] } | null = null
export const selectMonthlyCirculationTrend = (state: AppState): MonthlyTrendRow[] => {
  if (monthlyCache && monthlyCache.statsRef === state.dashboardStats) return monthlyCache.value
  const value = computeMonthlyCirculationTrend(state)
  monthlyCache = { statsRef: state.dashboardStats, value }
  return value
}

type TopCategoryRow = ReturnType<typeof computeTopCategoriesChart>[number]
function computeTopCategoriesChart(state: AppState) {
  const stats = state.dashboardStats
  if (!stats) return []
  return stats.category_stats.map((c) => ({ name: c.name, count: c.count }))
}

let topCatsCache: { statsRef: DashboardStats | null; value: TopCategoryRow[] } | null = null
export const selectTopCategoriesChart = (state: AppState): TopCategoryRow[] => {
  if (topCatsCache && topCatsCache.statsRef === state.dashboardStats) return topCatsCache.value
  const value = computeTopCategoriesChart(state)
  topCatsCache = { statsRef: state.dashboardStats, value }
  return value
}


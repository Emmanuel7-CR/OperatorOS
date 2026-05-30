import { create } from 'zustand'
import { transactionService, categoryService, budgetService, savingsService } from '../services/financeApi'
import { supabase } from '../services/supabase'

const DEFAULT_CATEGORIES = [
  { id: 'food',          name: 'Food & Dining',     icon: '🍔', color: '#ff9f43', is_default: true },
  { id: 'transport',     name: 'Transport',          icon: '🚗', color: '#4db8ff', is_default: true },
  { id: 'bills',         name: 'Bills & Utilities',  icon: '💡', color: '#ffb547', is_default: true },
  { id: 'rent',          name: 'Rent & Housing',     icon: '🏠', color: '#a29bfe', is_default: true },
  { id: 'health',        name: 'Health',             icon: '❤️', color: '#ff5f7e', is_default: true },
  { id: 'entertainment', name: 'Entertainment',      icon: '🎬', color: '#fd79a8', is_default: true },
  { id: 'business',      name: 'Business',           icon: '💼', color: '#00cec9', is_default: true },
  { id: 'savings',       name: 'Savings',            icon: '💰', color: '#00b894', is_default: true },
  { id: 'shopping',      name: 'Shopping',           icon: '🛍️', color: '#e17055', is_default: true },
  { id: 'education',     name: 'Education',          icon: '📚', color: '#74b9ff', is_default: true },
  { id: 'travel',        name: 'Travel',             icon: '✈️', color: '#55efc4', is_default: true },
  { id: 'other',         name: 'Other',              icon: '📦', color: '#b2bec3', is_default: true },
]

export const useFinanceStore = create((set, get) => ({
  // ── State ─────────────────────────────────────────────────
  transactions:  [],
  categories:    DEFAULT_CATEGORIES,
  budgets:       [],
  savingsGoals:  [],
  currentMonth:  new Date().getMonth() + 1,
  currentYear:   new Date().getFullYear(),
  filters: { type: '', category: '', dateFrom: '', dateTo: '', search: '' },
  loading: { transactions: false, categories: false, budgets: false, savings: false },

  // ── Setters ───────────────────────────────────────────────
  setFilters:   (f)         => set(s => ({ filters: { ...s.filters, ...f } })),
  clearFilters: ()          => set({ filters: { type: '', category: '', dateFrom: '', dateTo: '', search: '' } }),
  setMonth:     (m, y)      => set({ currentMonth: m, currentYear: y }),
  setLoading:   (key, val)  => set(s => ({ loading: { ...s.loading, [key]: val } })),

  // ── Transactions ──────────────────────────────────────────
  fetchTransactions: async (userId, filters = {}) => {
    get().setLoading('transactions', true)
    try {
      const data = await transactionService.getAll(userId, filters)
      set({ transactions: data })
    } finally {
      get().setLoading('transactions', false)
    }
  },

  fetchMonthly: async (userId) => {
    const { currentMonth, currentYear } = get()
    get().setLoading('transactions', true)
    try {
      const data = await transactionService.getMonthly(userId, currentYear, currentMonth)
      set({ transactions: data })
    } finally {
      get().setLoading('transactions', false)
    }
  },

  addTransaction: async (tx) => {
    const data = await transactionService.create(tx)
    set(s => ({ transactions: [data, ...s.transactions] }))
    return data
  },

  updateTransaction: async (id, updates) => {
    const data = await transactionService.update(id, updates)
    set(s => ({ transactions: s.transactions.map(t => t.id === id ? data : t) }))
    return data
  },

  deleteTransaction: async (id) => {
    await transactionService.delete(id)
    set(s => ({ transactions: s.transactions.filter(t => t.id !== id) }))
  },

  // ── Categories ────────────────────────────────────────────
  fetchCategories: async (userId) => {
    get().setLoading('categories', true)
    try {
      const data = await categoryService.getAll(userId)
      set({ categories: data.length > 0 ? data : DEFAULT_CATEGORIES })
    } catch {
      set({ categories: DEFAULT_CATEGORIES })
    } finally {
      get().setLoading('categories', false)
    }
  },

  addCategory: async (cat) => {
    const data = await categoryService.create(cat)
    set(s => ({ categories: [...s.categories, data] }))
    return data
  },

  deleteCategory: async (id) => {
    await categoryService.delete(id)
    set(s => ({ categories: s.categories.filter(c => c.id !== id) }))
  },

  // ── Budgets ───────────────────────────────────────────────
  fetchBudgets: async (userId) => {
    const { currentMonth, currentYear } = get()
    get().setLoading('budgets', true)
    try {
      const data = await budgetService.getAll(userId, currentMonth, currentYear)
      set({ budgets: data })
    } finally {
      get().setLoading('budgets', false)
    }
  },

  upsertBudget: async (budget) => {
    const data = await budgetService.upsert(budget)
    set(s => {
      const exists = s.budgets.find(b => b.id === data.id)
      return { budgets: exists ? s.budgets.map(b => b.id === data.id ? data : b) : [...s.budgets, data] }
    })
    return data
  },

  deleteBudget: async (id) => {
    await budgetService.delete(id)
    set(s => ({ budgets: s.budgets.filter(b => b.id !== id) }))
  },

  // ── Savings Goals ─────────────────────────────────────────
  fetchSavingsGoals: async (userId) => {
    get().setLoading('savings', true)
    try {
      const data = await savingsService.getAll(userId)
      set({ savingsGoals: data })
    } finally {
      get().setLoading('savings', false)
    }
  },

  addSavingsGoal: async (goal) => {
    const data = await savingsService.create(goal)
    set(s => ({ savingsGoals: [data, ...s.savingsGoals] }))
    return data
  },

  updateSavingsGoal: async (id, updates) => {
    const data = await savingsService.update(id, updates)
    set(s => ({ savingsGoals: s.savingsGoals.map(g => g.id === id ? data : g) }))
    return data
  },

  deleteSavingsGoal: async (id) => {
    await savingsService.delete(id)
    set(s => ({ savingsGoals: s.savingsGoals.filter(g => g.id !== id) }))
  },

  addContribution: async (contribution) => {
    const data = await savingsService.addContribution(contribution)
    return data
  },

  // ── Computed stats ────────────────────────────────────────
  getStats: () => {
    const { transactions } = get()
    const income   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const byCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc }, {})
    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || null
    return { income, expenses, balance: income - expenses, byCategory, topCategory }
  },

}));

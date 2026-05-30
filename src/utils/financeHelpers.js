import { format, parseISO } from 'date-fns'

export function formatCurrency(amount, currency = 'NGN') {
  const symbol = currency === 'USD' ? '$' : '₦'
  const formatted = Number(amount).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${symbol}${formatted}`
}

export function formatDate(date) {
  return format(typeof date === 'string' ? parseISO(date) : date, 'dd MMM yyyy')
}

export function formatDateShort(date) {
  return format(typeof date === 'string' ? parseISO(date) : date, 'dd MMM')
}

export function formatMonthYear(month, year) {
  return format(new Date(year, month - 1, 1), 'MMMM yyyy')
}

export function calcPct(value, total) {
  if (!total) return 0
  return Math.min(Math.round((value / total) * 100), 100)
}

export function groupByDay(transactions) {
  const groups = {}
  transactions.forEach(t => {
    const day = t.date.split('T')[0]
    if (!groups[day]) groups[day] = []
    groups[day].push(t)
  })
  return Object.entries(groups)
    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
    .map(([date, items]) => ({ date, items }))
}

export function getCategoryInfo(categories, name) {
  return categories.find(c => c.name === name || c.id === name)
    || { name, icon: '📦', color: '#b2bec3' }
}

export function getMonthlyTrend(transactions, months = 6) {
  const result = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d    = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const m    = d.getMonth() + 1
    const y    = d.getFullYear()
    const txns = transactions.filter(t => {
      const td = parseISO(t.date)
      return td.getMonth() + 1 === m && td.getFullYear() === y
    })
    const income  = txns.filter(t => t.type === 'income').reduce((s, t)  => s + t.amount, 0)
    const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    result.push({ label: format(d, 'MMM'), income, expense, net: income - expense })
  }
  return result
}

export function getCategoryBreakdown(transactions) {
  const map = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount
  })
  const total = Object.values(map).reduce((s, v) => s + v, 0)
  return Object.entries(map)
    .map(([category, value]) => ({ category, value, percentage: calcPct(value, total) }))
    .sort((a, b) => b.value - a.value)
}

export function getWeeklyData(transactions) {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const data = days.map(day => ({ day, income: 0, expense: 0 }))
  transactions.forEach(t => {
    const d    = parseISO(t.date)
    const idx  = (d.getDay() + 6) % 7
    if (t.type === 'income')  data[idx].income  += t.amount
    else                      data[idx].expense += t.amount
  })
  return data
}

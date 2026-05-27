import { useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useFinanceStore } from '../../../context/financeStore'
import {
  formatCurrency, getCategoryBreakdown, getMonthlyTrend,
  getWeeklyData, getCategoryInfo,
} from '../../../utils/financeHelpers'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import './FinancePages.css'

const COLORS = ['#6c5ce7','#00b894','#e17055','#fdcb6e','#4db8ff','#fd79a8','#00cec9','#a29bfe','#55efc4','#ff9f43']

export default function ReportsPage() {
  const { user, profile } = useAuth()
  const { transactions, categories, loading, fetchTransactions } = useFinanceStore()
  const currency = profile?.currency || 'NGN'

  useEffect(() => {
    if (user) fetchTransactions(user.id)
  }, [user?.id])

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const savingsRate  = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0

  const trendData    = getMonthlyTrend(transactions, 6)
  const weeklyData   = getWeeklyData(transactions)
  const categoryData = getCategoryBreakdown(transactions)

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="chart-tooltip">
        <span className="chart-tooltip__label">{label}</span>
        {payload.map((entry, i) => (
          <div key={i} className="chart-tooltip__row">
            <span className="chart-tooltip__dot" style={{ background: entry.color }} />
            <span>{entry.name}: {formatCurrency(entry.value, currency)}</span>
          </div>
        ))}
      </div>
    )
  }

  const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const item = payload[0]
    return (
      <div className="chart-tooltip">
        <span>{item.name}: {formatCurrency(item.value, currency)} ({item.payload.percentage}%)</span>
      </div>
    )
  }

  return (
    <div className="finance-page">
      <div className="finance-page__header">
        <h3>Reports</h3>
      </div>

      {/* Summary stats */}
      <div className="reports-stats">
        <div className="report-stat card">
          <span className="report-stat__label">Income</span>
          <span className="report-stat__value amount-income">{formatCurrency(totalIncome, currency)}</span>
        </div>
        <div className="report-stat card">
          <span className="report-stat__label">Expenses</span>
          <span className="report-stat__value amount-expense">{formatCurrency(totalExpense, currency)}</span>
        </div>
        <div className="report-stat card">
          <span className="report-stat__label">Savings Rate</span>
          <span className={`report-stat__value ${savingsRate >= 0 ? 'amount-income' : 'amount-expense'}`}>
            {savingsRate}%
          </span>
        </div>
      </div>

      {loading.transactions ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: '200px' }} />)}
        </div>
      ) : transactions.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">📈</div>
          <h4>No data yet</h4>
          <p>Add transactions to see your financial reports</p>
        </div>
      ) : (
        <>
          {/* 6-month bar chart */}
          <div className="chart-card card">
            <h4 className="chart-title">Income vs Expenses — 6 months</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} barSize={12} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-display)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} width={36} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="income"  name="Income"  fill="var(--income)"  radius={[3,3,0,0]} />
                <Bar dataKey="expense" name="Expense" fill="var(--expense)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Net savings trend */}
          <div className="chart-card card">
            <h4 className="chart-title">Net Savings Trend</h4>
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-display)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="net" name="Net" stroke="var(--accent)" strokeWidth={2.5}
                  dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown pie */}
          {categoryData.length > 0 && (
            <div className="chart-card card">
              <h4 className="chart-title">Spending by Category</h4>
              <div className="pie-layout">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={categoryData.slice(0, 8)}
                      cx="50%" cy="50%"
                      innerRadius={48} outerRadius={78}
                      paddingAngle={3}
                      dataKey="value" nameKey="category"
                    >
                      {categoryData.slice(0, 8).map((entry, i) => {
                        const cat = getCategoryInfo(categories, entry.category)
                        return <Cell key={i} fill={cat.color || COLORS[i % COLORS.length]} />
                      })}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {categoryData.slice(0, 8).map((entry, i) => {
                    const cat = getCategoryInfo(categories, entry.category)
                    return (
                      <div key={i} className="pie-legend-item">
                        <span className="pie-legend-dot" style={{ background: cat.color || COLORS[i] }} />
                        <span className="pie-legend-name">{cat.icon} {entry.category.split(' ')[0]}</span>
                        <span className="pie-legend-pct">{entry.percentage}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Weekly spending pattern */}
          <div className="chart-card card">
            <h4 className="chart-title">Weekly Spending Pattern</h4>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={weeklyData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-display)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="expense" name="Expense" fill="var(--expense)" radius={[3,3,0,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

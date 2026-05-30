import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useFinanceStore } from '../../context/financeStore'
import { formatMonthYear } from '../../utils/financeHelpers'
import './MonthPicker.css'

export function MonthPicker() {
  const { currentMonth, currentYear, setMonth } = useFinanceStore()

  function prev() {
    if (currentMonth === 1) setMonth(12, currentYear - 1)
    else setMonth(currentMonth - 1, currentYear)
  }

  function next() {
    const now = new Date()
    const isCurrent = currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1
    if (isCurrent) return
    if (currentMonth === 12) setMonth(1, currentYear + 1)
    else setMonth(currentMonth + 1, currentYear)
  }

  const now = new Date()
  const isCurrent = currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1

  return (
    <div className="month-picker">
      <button className="month-picker__btn" onClick={prev}><ChevronLeft size={15} /></button>
      <span className="month-picker__label">{formatMonthYear(currentMonth, currentYear)}</span>
      <button className="month-picker__btn" onClick={next} disabled={isCurrent}><ChevronRight size={15} /></button>
    </div>
  )
}

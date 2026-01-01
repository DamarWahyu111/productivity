"use client"

import { useState, useEffect } from "react"
import FinanceForm from "./FinanceForm"
import FinanceTransaction from "./FinanceTransaction"

export default function FinanceTab({ type }) {
  const [transactions, setTransactions] = useState([])
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [displayDate, setDisplayDate] = useState("")
  const [weekDays, setWeekDays] = useState([])

  useEffect(() => {
    loadData()
    updateDisplayDate()
    if (type === "weekly") {
      updateWeekCalendar()
    }
  }, [type])

  useEffect(() => {
    const checkMidnight = setInterval(() => {
      if (type === "weekly") {
        updateWeekCalendar()
        updateDisplayDate()
      }
    }, 60000)

    return () => clearInterval(checkMidnight)
  }, [type])

  const updateWeekCalendar = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - dayOfWeek)

    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      days.push({
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("id-ID", { weekday: "short" }),
        dayNum: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
      })
    }
    setWeekDays(days)
  }

  const getFinanceKey = () => {
    const date = new Date()
    let key = `finance_${type}`

    if (type === "daily") {
      key += `_${date.toISOString().split("T")[0]}`
    } else if (type === "weekly") {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      key += `_${weekStart.toISOString().split("T")[0]}`
    } else if (type === "monthly") {
      key += `_${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, "0")}`
    }

    return key
  }

  const updateDisplayDate = () => {
    const date = new Date()
    let display = ""

    if (type === "daily") {
      display = date.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    } else if (type === "weekly") {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      display = `${weekStart.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${weekEnd.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`
    }

    setDisplayDate(display)
  }

  const loadData = () => {
    const key = getFinanceKey()

    if (type === "monthly") {
      const monthlyTransactions = JSON.parse(localStorage.getItem(key) || "[]")
      setTransactions(monthlyTransactions)

      const date = new Date()
      const monthKey = `monthlyIncome_${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, "0")}`
      const income = localStorage.getItem(monthKey)
      setMonthlyIncome(income ? JSON.parse(income) : 1000)
    } else {
      const saved = localStorage.getItem(key)
      setTransactions(saved ? JSON.parse(saved) : [])
    }
  }

  const saveTransactions = (newTransactions) => {
    const key = getFinanceKey()
    localStorage.setItem(key, JSON.stringify(newTransactions))
  }

  const addTransaction = (data) => {
    const newTransaction = {
      id: Date.now(),
      type: data.type,
      amount: Number.parseFloat(data.amount),
      category: data.category,
      description: data.description,
      date: new Date().toISOString(),
      source: type,
    }

    const newTransactions = [...transactions, newTransaction]
    setTransactions(newTransactions)
    saveTransactions(newTransactions)

    if (type === "daily") {
      syncToWeekly(newTransaction)
      syncToMonthly(newTransaction)
    } else if (type === "weekly") {
      syncToMonthly(newTransaction)
    }
  }

  const addMonthlyIncome = (amount) => {
    const income = amount && amount.trim() !== "" ? Number.parseFloat(amount) : 1000
    const date = new Date()
    const monthKey = `monthlyIncome_${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, "0")}`
    localStorage.setItem(monthKey, JSON.stringify(income))
    setMonthlyIncome(income)
  }

  const syncToWeekly = (transaction) => {
    const date = new Date(transaction.date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = `finance_weekly_${weekStart.toISOString().split("T")[0]}`

    const weekTransactions = JSON.parse(localStorage.getItem(weekKey) || "[]")
    weekTransactions.push(transaction)
    localStorage.setItem(weekKey, JSON.stringify(weekTransactions))
  }

  const syncToMonthly = (transaction) => {
    const date = new Date(transaction.date)
    const monthKey = `finance_monthly_${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, "0")}`

    const monthTransactions = JSON.parse(localStorage.getItem(monthKey) || "[]")
    monthTransactions.push(transaction)
    localStorage.setItem(monthKey, JSON.stringify(monthTransactions))
  }

  const deleteTransaction = (id) => {
    const newTransactions = transactions.filter((t) => t.id !== id)
    setTransactions(newTransactions)
    saveTransactions(newTransactions)
  }

  const totalIncome = transactions.reduce((sum, t) => (t.type === "income" ? sum + t.amount : sum), 0)
  const totalExpense = transactions.reduce((sum, t) => (t.type === "expense" ? sum + t.amount : sum), 0)
  const balance = totalIncome - totalExpense
  const remainingBalance = type === "monthly" && monthlyIncome > 0 ? monthlyIncome - totalExpense : null

  return (
    <div className="space-y-6">
      {displayDate && <p className="text-sm font-semibold text-neutral-600">{displayDate}</p>}

      {type === "weekly" && weekDays.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {weekDays.map((day) => (
            <div
              key={day.date}
              className={`flex flex-col items-center justify-center px-2 sm:px-3 py-2 rounded-lg border-2 transition-all flex-shrink-0 transform hover:scale-105 hover:shadow-lg ${
                day.isToday
                  ? "border-neutral-900 bg-neutral-900 text-white font-bold shadow-xl"
                  : "border-neutral-300 text-neutral-700 hover:border-neutral-600"
              }`}
            >
              <p className="text-xs font-medium">{day.day}</p>
              <p className="text-lg font-bold">{day.dayNum}</p>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards with 3D Effects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-default">
          <p className="text-sm text-green-700 font-medium">Total Pemasukan</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 mt-2">Rp {totalIncome.toLocaleString("id-ID")}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-default">
          <p className="text-sm text-red-700 font-medium">Total Pengeluaran</p>
          <p className="text-xl sm:text-2xl font-bold text-red-600 mt-2">Rp {totalExpense.toLocaleString("id-ID")}</p>
        </div>

        <div
          className={`bg-gradient-to-br rounded-lg p-4 border shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-default ${
            (remainingBalance !== null ? remainingBalance : balance) >= 0
              ? "from-neutral-50 to-neutral-100 border-neutral-300"
              : "from-orange-50 to-orange-100 border-orange-200"
          }`}
        >
          <p className="text-sm font-medium text-neutral-700">
            {remainingBalance !== null ? "Sisa Saldo Gaji" : "Saldo"}
          </p>
          <p
            className={`text-xl sm:text-2xl font-bold mt-2 ${
              (remainingBalance !== null ? remainingBalance : balance) >= 0 ? "text-neutral-900" : "text-orange-600"
            }`}
          >
            Rp {(remainingBalance !== null ? remainingBalance : balance).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Monthly Income Input */}
      {type === "monthly" && (
        <div className="bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg p-4 border border-neutral-300 shadow-md hover:shadow-lg transition-all">
          <label className="block text-sm font-medium text-neutral-900 mb-2">Gaji Bulanan (opsional)</label>
          <div className="flex gap-2">
            <input
              type="number"
              defaultValue={monthlyIncome === 0 ? "" : monthlyIncome}
              onBlur={(e) => addMonthlyIncome(e.target.value)}
              placeholder="Kosongkan untuk reset ke 0"
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm sm:text-base transition-all shadow-sm hover:shadow-md"
            />
          </div>
        </div>
      )}

      {/* Form */}
      <FinanceForm onAdd={addTransaction} />

      {/* Transaction History */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Riwayat Transaksi</h3>
        <FinanceTransaction transactions={transactions} onDelete={deleteTransaction} />
      </div>
    </div>
  )
}

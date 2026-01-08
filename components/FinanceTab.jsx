"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/app/auth-context"
import FinanceForm from "./FinanceForm"
import FinanceTransaction from "./FinanceTransaction"
import FinanceChart from "./FinanceChart"

export default function FinanceTab({ type }) {
  const { user } = useAuth()

  const [transactions, setTransactions] = useState([])
  const [salaryInput, setSalaryInput] = useState("")
  const [globalBalance, setGlobalBalance] = useState(0)
  const [displayDate, setDisplayDate] = useState("")
  const [weekDays, setWeekDays] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [animatedBalance, setAnimatedBalance] = useState(0)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [weekOffset, setWeekOffset] = useState(0)
  
  const [showWeekPicker, setShowWeekPicker] = useState(false)
  const [customWeekStart, setCustomWeekStart] = useState("")
  const [customWeekEnd, setCustomWeekEnd] = useState("")

// HELPER: GET JAKARTA TIME (FIXED VERSION)
// ============================

// FUNGSI 1: Untuk menyimpan ke database (returns ISO string in UTC)
  const getJakartaTime = () => {
    const jakartaString = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    
    return new Date(jakartaString)
  }

  // Untuk menyimpan ke database (returns ISO string)
  const getJakartaTimeISO = () => {
    const now = new Date()
    
    const jakartaString = now.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    
    const [datePart, timePart] = jakartaString.split(', ')
    const [month, day, year] = datePart.split('/')
    
    // Format: YYYY-MM-DDTHH:mm:ss.000Z
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}.000Z`
  }

  // Untuk mendapatkan tanggal Jakarta saja (YYYY-MM-DD)
  const getJakartaDate = () => {
    const jakartaTime = new Date().toLocaleString("en-US", { 
      timeZone: "Asia/Jakarta",
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: false
    })
    const [month, day, year] = jakartaTime.split(', ')[0].split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const getWeekRange = () => {
    const today = new Date()
    today.setDate(today.getDate() + weekOffset * 7)

    const start = new Date(today)
    start.setDate(today.getDate() - today.getDay())

    const end = new Date(start)
    end.setDate(start.getDate() + 6)

    return { start, end }
  }

  const generateWeekOptions = () => {
    const options = []
    for (let i = 0; i >= -52; i--) {
      options.push(i)
    }
    return options
  }

  const weekOptions = generateWeekOptions()

  const getWeekLabel = (offset) => {
    if (offset === 0) return "Minggu ini"
    if (offset > 0) return `Minggu +${offset}`
    return `Minggu ${offset}`
  }

  useEffect(() => {
    let start = 0
    const end = globalBalance
    if (end === 0) return setAnimatedBalance(0)

    const duration = 2000 // ms
    const increment = end / (duration / 26) 

    const animate = () => {
      start += increment
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setAnimatedBalance(end)
        return
      }
      setAnimatedBalance(Math.floor(start))
      requestAnimationFrame(animate)
    }

    animate()
  }, [globalBalance])

  const categoryList = [
    "all",
    ...new Set(transactions.map(t => t.category).filter(Boolean))
  ]

  const autoResetSalary = async () => {
    if (!user) return;

    const now = getJakartaTime(); 
    const todayIsFirst = now.getDate() === 28;
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 28}`;

    if (!todayIsFirst) return;

    const { data: already } = await supabase
      .from("user_month_reset")
      .select("*")
      .eq("user_id", user.id)
      .eq("month_year", monthKey)
      .maybeSingle();

    if (already) return; 

    const { data: all } = await supabase
      .from("finance_transactions")
      .select("*")
      .eq("user_id", user.id);

    const totalIncome = all
      .filter(t => t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);

    const totalExpense = all
      .filter(t => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);

    const currentBalance = totalIncome - totalExpense;

    if (currentBalance !== 0) {
      await supabase.from("finance_transactions").insert({
        user_id: user.id,
        scope: "monthly",
        type: currentBalance > 0 ? "expense" : "income",
        amount: Math.abs(currentBalance),
        category: "auto-reset",
        note: "Reset otomatis tanggal 28",
        date: getJakartaTime().toISOString(), 
      });
    }

    await supabase.from("user_month_reset").insert({
      user_id: user.id,
      month_year: monthKey,
    });
  }

  // ============================
  // LOAD & HITUNG SALDO GLOBAL
  // ============================
  const loadData = async () => {
    if (!user) return

    autoResetSalary()

    const { data: all } = await supabase
      .from("finance_transactions")
      .select("*")
      .eq("user_id", user.id)

    if (all) {
      const income = all
        .filter(t => t.type === "income")
        .reduce((s, t) => s + Number(t.amount), 0)

      const expense = all
        .filter(t => t.type === "expense")
        .reduce((s, t) => s + Number(t.amount), 0)

      setGlobalBalance(income - expense)
    }

    let query = supabase
      .from("finance_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    // daily
    if (type === "daily") {
      query = query
        .eq("scope", "daily")
        .gte("date", `${selectedDate}T00:00:00`)
        .lte("date", `${selectedDate}T23:59:59`)
    }

    // weekly
    if (type === "weekly") {
      const { start, end } = getWeekRange()

      query = query
        .eq("scope", "weekly")
        .gte("date", start.toISOString())
        .lte("date", end.toISOString())
    }

    const { data: scoped } = await query
    if (scoped) setTransactions(scoped)
  }

  // ========================= CHART DATA =========================
  const buildChartData = () => {
    // DAILY → per jam (grouping per jam)
    if (type === "daily") {
      const hourlyData = {}

      transactions.forEach(t => {
        const jakartaDate = new Date(t.date).toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
        const hour = new Date(jakartaDate).getHours()
        const hourLabel = `${hour.toString().padStart(2, '0')}:00`
        
        if (!hourlyData[hourLabel]) {
          hourlyData[hourLabel] = { income: 0, expense: 0 }
        }

        if (t.type === "income") {
          hourlyData[hourLabel].income += Number(t.amount)
        } else {
          hourlyData[hourLabel].expense += Number(t.amount)
        }
      })

      return Object.keys(hourlyData)
        .sort()
        .map(hour => ({
          label: hour,
          income: hourlyData[hour].income,
          expense: hourlyData[hour].expense,
        }))
    }

    if (type === "weekly") {
      return weekDays.map(day => {
        const list = transactions.filter(t => t.date.startsWith(day.iso))

        return {
          label: day.day,
          income: list.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
          expense: list.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
        }
      })
    }

    // MONTHLY → per tanggal dalam sebulan
    const now = getJakartaTime()
    const year = now.getFullYear()
    const month = now.getMonth()
    const days = new Date(year, month + 1, 0).getDate()

    return Array.from({ length: days }, (_, i) => {
      const iso = new Date(year, month, i + 1).toISOString().split("T")[0]
      const list = transactions.filter(t => t.date.startsWith(iso))

      return {
        label: i + 1,
        income: list.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
        expense: list.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
      }
    })
  }

  const chartData = buildChartData()

  useEffect(() => {
    loadData()
    updateHeaderDate()
    if (type === "weekly") buildWeek()
  }, [type, weekOffset, selectedDate])

  // ==========================
  // TAMBAH TRANSAKSI BIASA
  // ==========================
  const addTransaction = async data => {
    const jakartaDate = getJakartaTime() 

    await supabase.from("finance_transactions").insert({
      user_id: user.id,
      scope: type, 
      type: data.type,
      amount: Number(data.amount),
      category: data.category,
      note: data.description,
      date: jakartaDate.toISOString(),
    })

    await loadData()
  }

  // ==========================
  // TAMBAH GAJI BULANAN
  // ==========================
  const addSalary = async () => {
    if (!salaryInput || Number(salaryInput) <= 0) return

    const jakartaDate = getJakartaTime() 

    await supabase.from("finance_transactions").insert({
      user_id: user.id,
      scope: "monthly",
      type: "income",
      amount: Number(salaryInput),
      category: "salary",
      note: "Gaji Bulanan",
      date: jakartaDate.toISOString(), 
    })

    setSalaryInput("")
    await loadData()
  }

  // ==========================
  // HAPUS
  // ==========================
  const deleteTransaction = async id => {
    await supabase.from("finance_transactions").delete().eq("id", id)
    await loadData()
  }

  // ==========================
  // HEADER TANGGAL UI
  // ==========================
  const updateHeaderDate = () => {
    const d = getJakartaTime() 

    if (type === "daily") {
      setDisplayDate(
        d.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      )
    } else if (type === "weekly") {
      const { start, end } = getWeekRange()

      setDisplayDate(
        `${start.toLocaleDateString("id-ID", { day:"numeric", month:"short"})} - ${end.toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric"})}`
      )
    } else {
      setDisplayDate(
        d.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        }),
      )
    }
  }

  const buildWeek = () => {
    const { start } = getWeekRange()

    const days = []

    for (let i = 0; i < 7; i++) {
      const x = new Date(start)
      x.setDate(start.getDate() + i)

      days.push({
        day: x.toLocaleDateString("id-ID", { weekday: "short" }),
        iso: x.toISOString().split("T")[0],
      })
    }
    setWeekDays(days)
  }

  // ==========================
  // CUSTOM WEEK RANGE PICKER
  // ==========================
  const applyCustomWeekRange = () => {
    if (!customWeekStart || !customWeekEnd) return

    const start = new Date(customWeekStart)
    const end = new Date(customWeekEnd)
    
    const today = new Date()
    const diffTime = start - today
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
    
    setWeekOffset(diffWeeks)
    setShowWeekPicker(false)
  }

  // ==========================
  // FILTER CHART DATA BY CATEGORY
  // ==========================
  const getFilteredChartData = () => {
    if (selectedCategory === "all") return chartData

    const filteredTransactions = transactions.filter(t => t.category === selectedCategory)

    // DAILY
    if (type === "daily") {
      const hourlyData = {}

      filteredTransactions.forEach(t => {
        const jakartaDate = new Date(t.date).toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
        const hour = new Date(jakartaDate).getHours()
        const hourLabel = `${hour.toString().padStart(2, '0')}:00`
        
        if (!hourlyData[hourLabel]) {
          hourlyData[hourLabel] = { income: 0, expense: 0 }
        }

        if (t.type === "income") {
          hourlyData[hourLabel].income += Number(t.amount)
        } else {
          hourlyData[hourLabel].expense += Number(t.amount)
        }
      })

      return Object.keys(hourlyData)
        .sort()
        .map(hour => ({
          label: hour,
          income: hourlyData[hour].income,
          expense: hourlyData[hour].expense,
        }))
    }

    // WEEKLY
    if (type === "weekly") {
      return weekDays.map(day => {
        const list = filteredTransactions.filter(t => t.date.startsWith(day.iso))

        return {
          label: day.day,
          income: list.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
          expense: list.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
        }
      })
    }

    // MONTHLY
    const now = getJakartaTime()
    const year = now.getFullYear()
    const month = now.getMonth()
    const days = new Date(year, month + 1, 0).getDate()

    return Array.from({ length: days }, (_, i) => {
      const iso = new Date(year, month, i + 1).toISOString().split("T")[0]
      const list = filteredTransactions.filter(t => t.date.startsWith(iso))

      return {
        label: i + 1,
        income: list.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
        expense: list.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
      }
    })
  }

  // ==========================
  // SUMMARY
  // ==========================
  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div className="space-y-6">

      <p className="text-sm font-semibold text-neutral-600">{displayDate}</p>

      {type === "weekly" && (
        <div className="space-y-3">
          <div className="flex gap-3 items-center flex-wrap">

            <button
              disabled={weekOffset >= 0}
              onClick={() => setWeekOffset(prev => prev + 1)}
              className={`px-3 py-2 border rounded-lg transition-all ${
                weekOffset >= 0 
                  ? "opacity-40 cursor-not-allowed bg-neutral-100" 
                  : "hover:bg-neutral-50"
              }`}
            >
              Minggu depan →
            </button>

            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-2 border rounded-lg hover:bg-neutral-50"
            >
              Minggu ini
            </button>

            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="px-3 py-2 border rounded-lg hover:bg-neutral-50"
            >
              ← Minggu lalu
            </button>

            <select
              value={weekOffset}
              onChange={e => setWeekOffset(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 bg-white hover:bg-neutral-50 cursor-pointer"
            >
              {weekOptions.map(i => (
                <option key={i} value={i}>
                  {getWeekLabel(i)}
                </option>
              ))}
            </select>

            {/* Tombol buka Week Range Picker */}
            <button
              onClick={() => setShowWeekPicker(!showWeekPicker)}
              className="px-3 py-2 border rounded-lg hover:bg-neutral-50 bg-blue-50 border-blue-200"
            >
              📅 Pilih Range Minggu
            </button>

          </div>

          {/* WEEK RANGE PICKER */}
          {showWeekPicker && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-3">
              <p className="font-semibold text-sm text-blue-900">Pilih Range Minggu Custom</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-600 block mb-1">
                    Tanggal Mulai (Minggu)
                  </label>
                  <input
                    type="date"
                    value={customWeekStart}
                    onChange={e => setCustomWeekStart(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-600 block mb-1">
                    Tanggal Akhir (Sabtu)
                  </label>
                  <input
                    type="date"
                    value={customWeekEnd}
                    onChange={e => setCustomWeekEnd(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={applyCustomWeekRange}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Terapkan
                </button>
                <button
                  onClick={() => setShowWeekPicker(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-neutral-50"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Display info minggu yang dipilih */}
          <div className="text-xs text-neutral-500 bg-neutral-50 px-3 py-2 rounded-lg inline-block">
            {weekOffset === 0 && "📍 Menampilkan minggu ini"}
            {weekOffset > 0 && `📍 Menampilkan ${weekOffset} minggu ke depan`}
            {weekOffset < 0 && `📍 Menampilkan ${Math.abs(weekOffset)} minggu yang lalu`}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-green-100 p-4 rounded-xl">
          <p>Total Pemasukan</p>
          <p className="text-2xl font-bold text-green-600">
            Rp {totalIncome.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-red-100 p-4 rounded-xl">
          <p>Total Pengeluaran</p>
          <p className="text-2xl font-bold text-red-600">
            Rp {totalExpense.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-neutral-100 p-4 rounded-xl">
          <p>Saldo</p>
          <p className="text-2xl font-bold">
            Rp {animatedBalance.toLocaleString("id-ID")}
          </p>
        </div>

      </div>

      {type === "monthly" && (
        <div className="bg-neutral-50 p-4 rounded-xl border">
          <p>Gaji Bulanan</p>

          <div className="mt-2 relative w-full">
            <input
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              type="number"
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 pr-16 focus:outline-none"
              placeholder="contoh: 5000000"
            />

            <button
              onClick={addSalary}
              className="absolute right-1 top-1 bottom-1 px-4 bg-black text-white rounded-lg hover:bg-neutral-800"
            >
              Set
            </button>
          </div>
        </div>
      )}

      {type === "daily" && (
        <div className="bg-neutral-50 p-3 rounded-xl border">
          <label className="text-sm font-medium text-neutral-600">
            Pilih tanggal
          </label>

          <input
            type="date"
            value={selectedDate}
            onChange={e => {
              setSelectedDate(e.target.value)
            }}
            className="mt-1 px-3 py-2 border rounded-lg w-full sm:w-auto"
          />
        </div>
      )}

      {/* FILTER KATEGORI */}
      <div className="flex gap-2 items-center">
        <p className="text-sm font-medium">Filter kategori:</p>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          {categoryList.map(c => (
            <option key={c} value={c}>
              {c === "all" ? "Semua" : c}
            </option>
          ))}
        </select>
      </div>

      <FinanceForm onAdd={addTransaction} />
      
      <FinanceChart
        data={selectedCategory === "all" ? chartData : getFilteredChartData()}
        type={type}
      />

      <FinanceTransaction
        transactions={
          selectedCategory === "all"
            ? transactions
            : transactions.filter(t => t.category === selectedCategory)
        }
        onDelete={deleteTransaction}
      />
    </div>
  )
}
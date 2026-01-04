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

  const now = new Date();
  const todayIsFirst = now.getDate() === 28;
  const monthKey = `${now.getFullYear()}-${now.getMonth() + 28}`;

  if (!todayIsFirst) return;

  // cek apakah sudah reset bulan ini
  const { data: already } = await supabase
    .from("user_month_reset")
    .select("*")
    .eq("user_id", user.id)
    .eq("month_year", monthKey)
    .maybeSingle();

  if (already) return; // sudah reset → stop

  // ambil semua transaksi user
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
      date: new Date().toISOString(),
    });
  }

  await supabase.from("user_month_reset").insert({
    user_id: user.id,
    month_year: monthKey,
  });
};

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

    // FILTER SESUAI TAB

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
    if (type === "weekly") query = query.eq("scope", "weekly")

    const { data: scoped } = await query
    if (scoped) setTransactions(scoped)
  }


  // ========================= CHART DATA =========================
  const buildChartData = () => {

    // DAILY → per jam
    if (type === "daily") {
      const today = new Date().toDateString()

      return transactions
        .filter(t => new Date(t.date).toDateString() === today)
        .map(t => ({
          label: new Date(t.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          income: t.type === "income" ? Number(t.amount) : 0,
          expense: t.type === "expense" ? Number(t.amount) : 0,
        }))
    }

    // WEEKLY
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

    // MONTHLY
    const now = new Date()
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
  }, [type])

  // ==========================
  // TAMBAH TRANSAKSI BIASA
  // ==========================
  const addTransaction = async data => {
    await supabase.from("finance_transactions").insert({
      user_id: user.id,
      scope: type, 
      type: data.type,
      amount: Number(data.amount),
      category: data.category,
      note: data.description,
      date: new Date().toISOString(),
    })

    await loadData()
  }

  // ==========================
  // TAMBAH GAJI BULANAN
  // ==========================
  const addSalary = async () => {
    if (!salaryInput || Number(salaryInput) <= 0) return

    await supabase.from("finance_transactions").insert({
      user_id: user.id,
      scope: "monthly",
      type: "income",
      amount: Number(salaryInput),
      category: "salary",
      note: "Gaji Bulanan",
      date: new Date().toISOString(),
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
    const d = new Date()

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
      const start = new Date(d)
      start.setDate(d.getDate() - d.getDay())
      const end = new Date(start)
      end.setDate(start.getDate() + 6)

      setDisplayDate(
        `${start.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`,
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
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())

    const days = []
    for (let i = 0; i < 7; i++) {
      const x = new Date(weekStart)
      x.setDate(weekStart.getDate() + i)
      days.push({
        label: x.toLocaleDateString("id-ID", { weekday: "short" }),
        num: x.getDate(),
      })
    }
    setWeekDays(days)
  }

  // ==========================
  // SUMMARY
  // ==========================
  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div className="space-y-6">

      <p className="text-sm font-semibold text-neutral-600">{displayDate}</p>

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
              loadData()
            }}
            className="mt-1 px-3 py-2 border rounded-lg"
          />
        </div>
      )}


      <FinanceForm onAdd={addTransaction} />
      <FinanceChart
        data={chartData.filter(
          d =>
            selectedCategory === "all" ||
            transactions.some(
              t =>
                t.category === selectedCategory &&
                ('' + new Date(t.date).getDate()) === ('' + d.label)
            )
        )}
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

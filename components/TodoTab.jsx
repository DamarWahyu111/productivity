"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/app/auth-context"
import TodoForm from "./TodoForm"
import TodoList from "./TodoList"

export default function TodoTab({ type }) {
  const { user } = useAuth()

  const [tasks, setTasks] = useState([])
  const [displayDate, setDisplayDate] = useState("")
  
  const [selectedDate, setSelectedDate] = useState("")
  const [weekOffset, setWeekOffset] = useState(0) 
  const [monthOffset, setMonthOffset] = useState(0) 

  const getJakartaTime = () => {
    const jakartaTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    return new Date(jakartaTime)
  }

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(getJakartaTime().toISOString().split("T")[0])
    }
  }, [])

  useEffect(() => {
    if (user && selectedDate) {
      loadTasks()
      updateDisplayDate()
    }
  }, [type, user, selectedDate, weekOffset, monthOffset])

  // ================================
  // GET DATE KEY FOR SCOPE
  // ================================
  const getDateForScope = () => {
    if (type === "daily") {
      return selectedDate
    }

    if (type === "weekly") {
      const today = getJakartaTime()
      today.setDate(today.getDate() + weekOffset * 7)
      
      const start = new Date(today)
      start.setDate(today.getDate() - today.getDay())
      
      return start.toISOString().split("T")[0]
    }

    if (type === "monthly") {
      const today = getJakartaTime()
      const targetMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
      
      return `${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, "0")}-01`
    }
  }

  // ================================
  // LOAD TASKS FROM SUPABASE
  // ================================
  const loadTasks = async () => {
    const scopeDate = getDateForScope()

    const { data, error } = await supabase
      .from("todo_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("scope", type)
      .eq("date", scopeDate)
      .order("created_at", { ascending: false })

    if (!error) setTasks(data || [])
  }

  // ================================
  // ADD TASK
  // ================================
  const addTask = async (taskText) => {
    const scopeDate = getDateForScope()
    const jakartaDate = getJakartaTime()

    await supabase.from("todo_items").insert({
      user_id: user.id,
      scope: type,
      date: scopeDate,
      task: taskText,
      completed: false,
      created_at: jakartaDate.toISOString(),
    })

    loadTasks()
  }

  // ================================
  // TOGGLE COMPLETE
  // ================================
  const toggleTask = async (id, current) => {
    await supabase
      .from("todo_items")
      .update({ completed: !current })
      .eq("id", id)

    loadTasks()
  }

  // ================================
  // DELETE TASK
  // ================================
  const deleteTask = async (id) => {
    await supabase.from("todo_items").delete().eq("id", id)
    loadTasks()
  }

  const clearAll = async () => {
    if (confirm("Hapus semua tugas?")) {
      const scopeDate = getDateForScope()

      await supabase
        .from("todo_items")
        .delete()
        .eq("user_id", user.id)
        .eq("scope", type)
        .eq("date", scopeDate)

      loadTasks()
    }
  }

  // ================================
  // DATE DISPLAY (UI SAJA)
  // ================================
  const updateDisplayDate = () => {
    if (type === "daily") {
      const d = new Date(selectedDate + "T00:00:00")
      setDisplayDate(
        d.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      )
    } else if (type === "weekly") {
      const today = getJakartaTime()
      today.setDate(today.getDate() + weekOffset * 7)
      
      const start = new Date(today)
      start.setDate(today.getDate() - today.getDay())
      
      const end = new Date(start)
      end.setDate(start.getDate() + 6)

      setDisplayDate(
        `${start.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        })} - ${end.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`
      )
    } else {
      const today = getJakartaTime()
      const targetMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
      
      setDisplayDate(
        targetMonth.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        })
      )
    }
  }

  // ================================
  // NAVIGATION HELPERS
  // ================================
  const goToToday = () => {
    setSelectedDate(getJakartaTime().toISOString().split("T")[0])
  }

  const goToPrevDay = () => {
    const d = new Date(selectedDate + "T12:00:00") 
    d.setDate(d.getDate() - 1)
    setSelectedDate(d.toISOString().split("T")[0])
  }

  const goToNextDay = () => {
    const d = new Date(selectedDate + "T12:00:00") 
    d.setDate(d.getDate() + 1)
    setSelectedDate(d.toISOString().split("T")[0])
  }

  const isToday = () => {
    const today = getJakartaTime().toISOString().split("T")[0]
    return selectedDate === today
  }

  const isFutureDate = () => {
    const today = getJakartaTime().toISOString().split("T")[0]
    return selectedDate > today
  }

  const isCurrentWeek = () => weekOffset === 0
  const isCurrentMonth = () => monthOffset === 0

  const completedCount = tasks.filter(t => t.completed).length
  const progressPercent = tasks.length ? (completedCount / tasks.length) * 100 : 0

  return (
    <div className="space-y-6">
      {displayDate && (
        <p className="text-sm font-semibold text-neutral-600">{displayDate}</p>
      )}

      {/* DAILY NAVIGATION */}
      {type === "daily" && (
        <div className="space-y-3">
          <div className="flex gap-3 items-center flex-wrap">
            <button
              onClick={goToPrevDay}
              className="px-3 py-2 border rounded-lg hover:bg-neutral-50 transition-colors"
            >
              ← Kemarin
            </button>

            <button
              onClick={goToToday}
              disabled={isToday()}
              className={`px-3 py-2 border rounded-lg transition-colors ${
                isToday() 
                  ? "opacity-40 cursor-not-allowed bg-neutral-100" 
                  : "hover:bg-neutral-50"
              }`}
            >
              Hari Ini
            </button>

            <button
              onClick={goToNextDay}
              disabled={isFutureDate()}
              className={`px-3 py-2 border rounded-lg transition-colors ${
                isFutureDate() 
                  ? "opacity-40 cursor-not-allowed bg-neutral-100" 
                  : "hover:bg-neutral-50"
              }`}
            >
              Besok →
            </button>

            <input
              type="date"
              value={selectedDate}
              max={getJakartaTime().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded-lg hover:bg-neutral-50 cursor-pointer"
            />
          </div>

          {!isToday() && (
            <div className="text-xs text-neutral-500 bg-neutral-50 px-3 py-2 rounded-lg inline-block">
              📍 Melihat todo dari tanggal lain
            </div>
          )}
        </div>
      )}

      {/* WEEKLY NAVIGATION */}
      {type === "weekly" && (
        <div className="space-y-3">
          <div className="flex gap-3 items-center flex-wrap">
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="px-3 py-2 border rounded-lg hover:bg-neutral-50 transition-colors"
            >
              ← Minggu Lalu
            </button>

            <button
              onClick={() => setWeekOffset(0)}
              disabled={isCurrentWeek()}
              className={`px-3 py-2 border rounded-lg transition-colors ${
                isCurrentWeek() 
                  ? "opacity-40 cursor-not-allowed bg-neutral-100" 
                  : "hover:bg-neutral-50"
              }`}
            >
              Minggu Ini
            </button>

            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              disabled={weekOffset >= 0}
              className={`px-3 py-2 border rounded-lg transition-colors ${
                weekOffset >= 0
                  ? "opacity-40 cursor-not-allowed bg-neutral-100" 
                  : "hover:bg-neutral-50"
              }`}
            >
              Minggu Depan →
            </button>
          </div>

          {!isCurrentWeek() && (
            <div className="text-xs text-neutral-500 bg-neutral-50 px-3 py-2 rounded-lg inline-block">
              {weekOffset > 0 && `📍 Melihat ${weekOffset} minggu ke depan`}
              {weekOffset < 0 && `📍 Melihat ${Math.abs(weekOffset)} minggu yang lalu`}
            </div>
          )}
        </div>
      )}

      {/* MONTHLY NAVIGATION */}
      {type === "monthly" && (
        <div className="space-y-3">
          <div className="flex gap-3 items-center flex-wrap">
            <button
              onClick={() => setMonthOffset(prev => prev - 1)}
              className="px-3 py-2 border rounded-lg hover:bg-neutral-50 transition-colors"
            >
              ← Bulan Lalu
            </button>

            <button
              onClick={() => setMonthOffset(0)}
              disabled={isCurrentMonth()}
              className={`px-3 py-2 border rounded-lg transition-colors ${
                isCurrentMonth() 
                  ? "opacity-40 cursor-not-allowed bg-neutral-100" 
                  : "hover:bg-neutral-50"
              }`}
            >
              Bulan Ini
            </button>

            <button
              onClick={() => setMonthOffset(prev => prev + 1)}
              disabled={monthOffset >= 0}
              className={`px-3 py-2 border rounded-lg transition-colors ${
                monthOffset >= 0
                  ? "opacity-40 cursor-not-allowed bg-neutral-100" 
                  : "hover:bg-neutral-50"
              }`}
            >
              Bulan Depan →
            </button>
          </div>

          {!isCurrentMonth() && (
            <div className="text-xs text-neutral-500 bg-neutral-50 px-3 py-2 rounded-lg inline-block">
              {monthOffset > 0 && `📍 Melihat ${monthOffset} bulan ke depan`}
              {monthOffset < 0 && `📍 Melihat ${Math.abs(monthOffset)} bulan yang lalu`}
            </div>
          )}
        </div>
      )}

      <div className="bg-neutral-50 rounded-lg p-4 border">
        <p className="text-sm">
          Selesai: <b>{completedCount}</b> / {tasks.length}
        </p>

        <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              background: "linear-gradient(to right,#22c55e,#16a34a)",
            }}
          />
        </div>
      </div>

      <TodoForm onAdd={addTask} />

      <TodoList
        tasks={tasks.map(t => ({
          id: t.id,
          text: t.task,
          completed: t.completed
        }))}
        onToggle={(id, c) => toggleTask(id, c)}
        onDelete={deleteTask}
        onClearAll={clearAll}
      />
    </div>
  )
}
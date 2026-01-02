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

  useEffect(() => {
    if (user) {
      loadTasks()
      updateDisplayDate()
    }
  }, [type, user])

  // ================================
  // GET DATE KEY FOR SCOPE
  // ================================
  const getDateForScope = () => {
    const d = new Date()

    if (type === "daily") {
      return d.toISOString().split("T")[0]
    }

    if (type === "weekly") {
      const start = new Date(d)
      start.setDate(d.getDate() - d.getDay())
      return start.toISOString().split("T")[0]
    }

    if (type === "monthly") {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
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

    if (!error) setTasks(data)
  }

  // ================================
  // ADD TASK
  // ================================
  const addTask = async (taskText) => {
    const scopeDate = getDateForScope()

    const { data, error } = await supabase.from("todo_items").insert({
      user_id: user.id,
      scope: type,
      date: scopeDate,
      task: taskText,
      completed: false,
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

  // CLEAR ALL
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
    const d = new Date()

    if (type === "daily") {
      setDisplayDate(
        d.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      )
    } else if (type === "weekly") {
      const start = new Date(d)
      start.setDate(d.getDate() - d.getDay())
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
      setDisplayDate(
        d.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        })
      )
    }
  }

  // PROGRESS BAR
  const completedCount = tasks.filter(t => t.completed).length
  const progressPercent = tasks.length ? (completedCount / tasks.length) * 100 : 0

  return (
    <div className="space-y-6">
      {displayDate && (
        <p className="text-sm font-semibold text-neutral-600">{displayDate}</p>
      )}

      <div className="bg-neutral-50 rounded-lg p-4 border">
        <p className="text-sm">
          Selesai: <b>{completedCount}</b> / {tasks.length}
        </p>

        <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
          <div
            className="h-2 rounded-full"
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
          text: t.task,        // <- ini dia penyebabnya
          completed: t.completed
        }))}
        onToggle={(id, c) => toggleTask(id, c)}
        onDelete={deleteTask}
        onClearAll={clearAll}
      />
    </div>
  )
}

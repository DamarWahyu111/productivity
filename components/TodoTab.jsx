"use client"

import { useState, useEffect } from "react"
import TodoForm from "./TodoForm"
import TodoList from "./TodoList"

export default function TodoTab({ type }) {
  const [tasks, setTasks] = useState([])
  const [displayDate, setDisplayDate] = useState("")

  useEffect(() => {
    loadTasks()
    updateDisplayDate()
  }, [type])

  const getTaskKey = () => {
    const date = new Date()
    let key = `todo_${type}`

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
    // monthly doesn't need date display

    setDisplayDate(display)
  }

  const loadTasks = () => {
    const key = getTaskKey()
    const saved = localStorage.getItem(key)
    setTasks(saved ? JSON.parse(saved) : [])
  }

  const saveTasks = (newTasks) => {
    const key = getTaskKey()
    localStorage.setItem(key, JSON.stringify(newTasks))
  }

  const addTask = (taskText) => {
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    const newTasks = [...tasks, newTask]
    setTasks(newTasks)
    saveTasks(newTasks)
  }

  const toggleTask = (id) => {
    const newTasks = tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    setTasks(newTasks)
    saveTasks(newTasks)
  }

  const deleteTask = (id) => {
    const newTasks = tasks.filter((task) => task.id !== id)
    setTasks(newTasks)
    saveTasks(newTasks)
  }

  const clearAll = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua tugas?")) {
      setTasks([])
      saveTasks([])
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length
  const progressPercent = tasks.length ? (completedCount / tasks.length) * 100 : 0

  return (
    <div className="space-y-6">
      {displayDate && <p className="text-sm font-semibold text-neutral-600">{displayDate}</p>}

      {/* Progress Info */}
      <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
        <p className="text-sm font-medium text-neutral-700">
          Progres:{" "}
          <span className="text-neutral-900 font-bold">
            {completedCount}/{tasks.length}
          </span>{" "}
          tugas selesai
        </p>
        <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(to right, #eab308, #ef4444)`,
            }}
          />
        </div>
      </div>

      {/* Form */}
      <TodoForm onAdd={addTask} />

      {/* Task List */}
      <TodoList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} onClearAll={clearAll} />
    </div>
  )
}

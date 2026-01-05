"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"

export default function GoalDetail({
  goal,
  onClose,
  onUpdate,
  onDelete,
  onToggleStatus,
  onArchive,
}) {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState("")
  const [progressValue, setProgressValue] = useState("")
  const [progressNote, setProgressNote] = useState("")

  useEffect(() => {
    loadTasks()
  }, [goal.id])

  const getJakartaTime = () => {
    const jakartaTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    return new Date(jakartaTime)
  }

  const loadTasks = async () => {
    const { data } = await supabase
      .from("goal_tasks")
      .select("*")
      .eq("goal_id", goal.id)
      .order("order_index", { ascending: true })

    if (data) setTasks(data)
  }

  const addTask = async () => {
    if (!newTask.trim()) return

    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order_index)) : -1

    await supabase.from("goal_tasks").insert({
      goal_id: goal.id,
      task: newTask.trim(),
      completed: false,
      order_index: maxOrder + 1,
      created_at: getJakartaTime().toISOString(),
    })

    setNewTask("")
    loadTasks()
    onUpdate()
  }

  const toggleTask = async (taskId, currentStatus) => {
    await supabase
      .from("goal_tasks")
      .update({ completed: !currentStatus })
      .eq("id", taskId)

    loadTasks()
    onUpdate()
  }

  const deleteTask = async (taskId) => {
    await supabase.from("goal_tasks").delete().eq("id", taskId)
    loadTasks()
    onUpdate()
  }

  const updateProgress = async () => {
    if (!progressValue || !goal.target_value) return

    const newValue = Number(progressValue)

    await supabase
      .from("goals")
      .update({
        current_value: newValue,
        updated_at: getJakartaTime().toISOString(),
      })
      .eq("id", goal.id)

    if (progressNote.trim()) {
      await supabase.from("goal_progress").insert({
        goal_id: goal.id,
        date: getJakartaTime().toISOString().split("T")[0],
        value: newValue,
        note: progressNote.trim(),
        created_at: getJakartaTime().toISOString(),
      })
    }

    setProgressValue("")
    setProgressNote("")
    onUpdate()
  }

  const categoryEmojis = {
    health: "💪",
    finance: "💰",
    career: "🚀",
    education: "📚",
    personal: "🎯",
  }

  const completedTasks = tasks.filter(t => t.completed).length
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

  const targetProgress = goal.target_value 
    ? ((goal.current_value || 0) / goal.target_value) * 100 
    : null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">
              {categoryEmojis[goal.category]}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
              {goal.category}
            </span>
          </div>

          <h2 className="text-2xl font-black text-neutral-900 mb-2">
            {goal.title}
          </h2>

          {goal.description && (
            <p className="text-neutral-600 mb-3">{goal.description}</p>
          )}

          {goal.deadline && (
            <p className="text-sm text-neutral-500">
              📅 Deadline: {new Date(goal.deadline).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-700 text-3xl"
        >
          ×
        </button>
      </div>

      {/* Target Progress (if exists) */}
      {goal.target_value && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-blue-900">Target Progress</span>
            <span className="text-xl font-black text-blue-600">
              {goal.current_value || 0}/{goal.target_value} {goal.unit}
            </span>
          </div>

          <div className="w-full bg-blue-200 rounded-full h-4 mb-3">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
              style={{ width: `${Math.min(targetProgress || 0, 100)}%` }}
            />
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              value={progressValue}
              onChange={(e) => setProgressValue(e.target.value)}
              placeholder={`Update nilai (${goal.unit})`}
              className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={updateProgress}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Update
            </button>
          </div>

          <input
            type="text"
            value={progressNote}
            onChange={(e) => setProgressNote(e.target.value)}
            placeholder="Catatan progres (opsional)"
            className="w-full mt-2 px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
      )}

      {/* Task Progress */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-purple-900">Task Progress</span>
          <span className="text-sm font-bold text-purple-600">
            {completedTasks}/{tasks.length} ({Math.round(progress)}%)
          </span>
        </div>

        <div className="w-full bg-purple-200 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Add Task */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") addTask()
          }}
          placeholder="Tambah task baru..."
          className="flex-1 px-4 py-3 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={addTask}
          className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700"
        >
          ➕
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-center text-neutral-500 py-8">
            Belum ada task. Tambahkan task untuk breakdown goal ini!
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                task.completed
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-neutral-200 hover:border-purple-300"
              }`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id, task.completed)}
                className="w-5 h-5 accent-purple-600 cursor-pointer"
              />

              <span
                className={`flex-1 ${
                  task.completed
                    ? "line-through text-neutral-500"
                    : "text-neutral-900"
                }`}
              >
                {task.task}
              </span>

              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-500 hover:text-red-700"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t-2">
        <button
          onClick={() => onToggleStatus(goal.id, goal.status)}
          className={`flex-1 py-3 rounded-lg font-bold ${
            goal.status === "completed"
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {goal.status === "completed" ? "↩️ Aktifkan Lagi" : "✅ Tandai Selesai"}
        </button>

        <button
          onClick={() => onArchive(goal.id)}
          className="px-6 py-3 bg-neutral-200 text-neutral-700 font-medium rounded-lg hover:bg-neutral-300"
        >
          📦 Arsipkan
        </button>

        <button
          onClick={() => onDelete(goal.id)}
          className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600"
        >
          🗑️ Hapus
        </button>
      </div>
    </div>
  )
}
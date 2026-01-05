"use client"

import { useState } from "react"

export default function GoalForm({ onAdd, onCancel }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("personal")
  const [targetValue, setTargetValue] = useState("")
  const [unit, setUnit] = useState("")
  const [deadline, setDeadline] = useState("")
  const [tasks, setTasks] = useState([])
  const [currentTask, setCurrentTask] = useState("")

  const categories = [
    { id: "health", label: "💪 Kesehatan" },
    { id: "finance", label: "💰 Keuangan" },
    { id: "career", label: "🚀 Karir" },
    { id: "education", label: "📚 Pendidikan" },
    { id: "personal", label: "🎯 Personal" },
  ]

  const handleAddTask = () => {
    if (currentTask.trim()) {
      setTasks([...tasks, currentTask.trim()])
      setCurrentTask("")
    }
  }

  const handleRemoveTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Judul goal harus diisi!")
      return
    }

    onAdd({
      title: title.trim(),
      description: description.trim(),
      category,
      targetValue: targetValue ? Number(targetValue) : null,
      unit: unit.trim() || null,
      deadline: deadline || null,
      tasks: tasks.length > 0 ? tasks : null,
    })

    // Reset
    setTitle("")
    setDescription("")
    setCategory("personal")
    setTargetValue("")
    setUnit("")
    setDeadline("")
    setTasks([])
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-neutral-900">Buat Goal Baru</h3>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Judul Goal *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Lulus Sertifikasi AWS"
          className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Deskripsi
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Jelaskan detail goal Anda..."
          className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none min-h-[100px]"
          rows={3}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Kategori *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Target Value */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Target Angka (Opsional)
          </label>
          <input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="Contoh: 70"
            className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Satuan
          </label>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="kg, juta, %"
            className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Deadline (Opsional)
        </label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
        />
      </div>

      {/* Breakdown Tasks */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Breakdown Tasks (Opsional)
        </label>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={currentTask}
            onChange={(e) => setCurrentTask(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddTask()
              }
            }}
            placeholder="Tulis task kecil, tekan Enter"
            className="flex-1 px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddTask}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            ➕
          </button>
        </div>

        {tasks.length > 0 && (
          <div className="space-y-2 bg-white p-3 rounded-lg border-2 border-neutral-200">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded-lg"
              >
                <span className="text-sm">{task}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTask(index)}
                  className="text-red-500 hover:text-red-700 text-xl"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 py-3 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Buat Goal
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-neutral-200 text-neutral-700 font-medium rounded-lg hover:bg-neutral-300 transition-colors"
        >
          Batal
        </button>
      </div>
    </div>
  )
}
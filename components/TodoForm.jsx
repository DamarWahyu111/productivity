"use client"

import { useState } from "react"

export default function TodoForm({ onAdd }) {
  const [input, setInput] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onAdd(input)
      setInput("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-col sm:flex-row">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Tambahkan tugas baru..."
        className="flex-1 px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm sm:text-base"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-all shadow-md w-full sm:w-auto"
      >
        Tambah
      </button>
    </form>
  )
}

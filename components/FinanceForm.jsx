"use client"

import { useState } from "react"

export default function FinanceForm({ onAdd }) {
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "makanan",
    description: "",
  })

  const expenseCategories = ["makanan", "transportasi", "hiburan", "kesehatan", "pendidikan", "lainnya"]
  const incomeCategories = ["gaji", "bisnis", "investasi", "lainnya"]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.amount && Number.parseFloat(formData.amount) > 0) {
      onAdd(formData)
      setFormData({
        type: "expense",
        amount: "",
        category: "makanan",
        description: "",
      })
    }
  }

  const categories = formData.type === "expense" ? expenseCategories : incomeCategories

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg p-4 sm:p-6 border border-neutral-200 space-y-4 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">Jenis</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm transition-all shadow-sm hover:shadow-md"
          >
            <option value="income">💰 Pemasukan</option>
            <option value="expense">💸 Pengeluaran</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">Jumlah (Rp)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0"
            step="1000"
            min="0"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm transition-all shadow-sm hover:shadow-md"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">Kategori</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm transition-all shadow-sm hover:shadow-md"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">Keterangan</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Opsional"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm transition-all shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-lg font-semibold hover:from-neutral-800 hover:to-neutral-700 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
      >
        Tambah Transaksi
      </button>
    </form>
  )
}

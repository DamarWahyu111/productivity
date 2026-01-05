"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"

export default function FinanceChart({ data, type }) {

  const getChartWidth = () => {
    if (type === "monthly") return Math.max(900, data.length * 35)
    if (type === "weekly") return 700
    return 600 // daily
  }

  return (
    <div className="w-full bg-white rounded-xl shadow p-4">

      <p className="font-semibold mb-2">
        Grafik Pemasukan & Pengeluaran
      </p>

      {/* === SCROLL CONTAINER (BIAR BISA DI DRAG HP) === */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-full" style={{ width: getChartWidth() }}>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="label" />

              <YAxis
                tickFormatter={v => `Rp ${v.toLocaleString("id-ID")}`}
                width={85}
              />

              <Tooltip formatter={v => `Rp ${v.toLocaleString("id-ID")}`} />

              <Legend />

              <Line
                type="monotone"
                dataKey="income"
                name="Pemasukan"
                stroke="#16a34a"
                strokeWidth={3}
                dot
              />

              <Line
                type="monotone"
                dataKey="expense"
                name="Pengeluaran"
                stroke="#dc2626"
                strokeWidth={3}
                dot
              />

            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

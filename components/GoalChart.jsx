"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"

export default function GoalChart({ goals }) {
  // Prepare chart data
  const chartData = goals.map((goal) => ({
    name: goal.title.length > 20 ? goal.title.substring(0, 20) + "..." : goal.title,
    progress: Math.round(goal.progress),
    fullName: goal.title,
  }))

  // Calculate average progress
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0

  return (
    <div className="w-full bg-white rounded-xl shadow-md border border-neutral-200 p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-neutral-900">📊 Progress Goals</h3>
        <p className="text-sm text-neutral-600">
          Progress rata-rata: <span className="font-bold text-neutral-900">{avgProgress}%</span>
        </p>
      </div>

      {/* Scroll Container untuk mobile */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-full" style={{ minWidth: Math.max(600, goals.length * 80) }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />

              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />

              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                formatter={(value, name, props) => [`${value}%`, props.payload.fullName]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                }}
              />

              <Legend />

              <Bar
                dataKey="progress"
                name="Progress"
                fill="#171717"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average Line Indicator */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-neutral-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-neutral-900 rounded"></div>
          <span>Progress per Goal</span>
        </div>
        <span className="text-neutral-400">|</span>
        <span>Rata-rata: {avgProgress}%</span>
      </div>
    </div>
  )
}
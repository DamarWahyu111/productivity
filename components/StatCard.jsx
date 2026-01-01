"use client"

export default function StatCard({ title, value, icon, color }) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 text-neutral-900 shadow-lg transform hover:scale-105 transition-transform border border-neutral-200`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 text-neutral-900">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  )
}

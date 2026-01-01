"use client"
import MenuCard from "./MenuCard"

export default function Dashboard({ onNavigate }) {
  return (
    <div className="min-h-screen px-4 py-8 sm:py-12 md:py-16">
      {/* Main content container */}
      <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16 md:space-y-20">
        {/* Hero Typography Section */}
        <div className="space-y-6 sm:space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-neutral-900 leading-tight text-balance">
            Produktivitas
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-neutral-600 leading-relaxed max-w-2xl">
            Kelola waktu, uang, dan prioritas Anda dengan dashboard yang dirancang untuk kesuksesan. Mulai hari ini.
          </p>
        </div>

        {/* Menu Cards Section */}
        <div className="space-y-6 sm:space-y-8">
          <div className="border-t-2 border-neutral-900 pt-8 sm:pt-10 md:pt-12" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <MenuCard
              title="📝 To-Do List"
              description="Kelola tugas harian, mingguan, dan bulanan Anda dengan mudah"
              onClick={() => onNavigate("todo")}
            />
            <MenuCard
              title="💰 Finance Tracker"
              description="Pantau pemasukan dan pengeluaran keuangan Anda secara real-time"
              onClick={() => onNavigate("finance")}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import BackButton from "./BackButton"
import GoalTab from "./GoalTab"

export default function GoalMenu() {
  const [activeTab, setActiveTab] = useState("all")

  const tabs = [
    { id: "all", label: "🌟 Semua Goal", color: "bg-purple-100 text-purple-800" },
    { id: "active", label: "🎯 Aktif", color: "bg-blue-100 text-blue-800" },
    { id: "completed", label: "✅ Selesai", color: "bg-green-100 text-green-800" },
  ]

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900">
              🎯 Goal Planner
            </h1>
            <p className="text-neutral-600 text-sm sm:text-base">
              Rencanakan dan capai tujuan besar Anda
            </p>
          </div>
        </div>

        <BackButton />

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? tab.color + " shadow-lg scale-105"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <GoalTab type={activeTab} />
      </div>
    </div>
  )
}
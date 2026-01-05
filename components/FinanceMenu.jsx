"use client"

import { useState } from "react"
import BackButton from "./BackButton"
import FinanceTab from "./FinanceTab"

export default function FinanceMenu({ onBack }) {
  const [activeTab, setActiveTab] = useState("daily")

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Wrapper dengan lebar terbatas seperti Goals */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Header dengan icon dan judul - SAMA SEPERTI GOALS */}
        <div className="flex items-center gap-3">
          <div className="text-4xl">💰</div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Finance Planner</h1>
            <p className="text-neutral-600">Rencanakan dan capai tujuan keuangan Anda</p>
          </div>
        </div>

        <BackButton onClick={onBack} />

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-neutral-200">
            {["daily", "weekly", "monthly"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-neutral-100 text-neutral-900 border-b-2 border-neutral-900"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {tab === "daily" && "📅 Daily"}
                {tab === "weekly" && "📆 Weekly"}
                {tab === "monthly" && "📋 Monthly"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <FinanceTab type={activeTab} />
          </div>
        </div>
        
      </div>
    </div>
  )
}
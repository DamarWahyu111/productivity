"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import Dashboard from "@/components/Dashboard"
import TodoMenu from "@/components/TodoMenu"
import FinanceMenu from "@/components/FinanceMenu"

export default function Home() {
  const [currentMenu, setCurrentMenu] = useState("dashboard")

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentMenu === "dashboard" && <Dashboard onNavigate={setCurrentMenu} />}

        {currentMenu === "todo" && <TodoMenu onBack={() => setCurrentMenu("dashboard")} />}

        {currentMenu === "finance" && <FinanceMenu onBack={() => setCurrentMenu("dashboard")} />}
      </main>
    </div>
  )
}

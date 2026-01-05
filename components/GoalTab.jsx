"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/app/auth-context"
import GoalForm from "./GoalForm"
import GoalCard from "./GoalCard"
import GoalDetail from "./GoalDetail"
import GoalChart from "./GoalChart"

export default function GoalTab({ type }) {
  const { user } = useAuth()

  const [goals, setGoals] = useState([])
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Helper: Get Jakarta Time
  const getJakartaTime = () => {
    const jakartaTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    return new Date(jakartaTime)
  }

  useEffect(() => {
    if (user) loadGoals()
  }, [user, type, categoryFilter])

  // ================================
  // LOAD GOALS
  // ================================
  const loadGoals = async () => {
    let query = supabase
      .from("goals")
      .select(`
        *,
        goal_tasks (
          id,
          task,
          completed,
          order_index
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    // Filter by status
    if (type === "active") {
      query = query.eq("status", "active")
    } else if (type === "completed") {
      query = query.eq("status", "completed")
    }

    // Filter by category
    if (categoryFilter !== "all") {
      query = query.eq("category", categoryFilter)
    }

    const { data, error } = await query

    if (!error && data) {
      // Calculate progress for each goal
      const goalsWithProgress = data.map(goal => {
        const totalTasks = goal.goal_tasks?.length || 0
        const completedTasks = goal.goal_tasks?.filter(t => t.completed).length || 0
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

        return {
          ...goal,
          progress,
          totalTasks,
          completedTasks
        }
      })

      setGoals(goalsWithProgress)
    }
  }

  // ================================
  // ADD GOAL
  // ================================
  const addGoal = async (goalData) => {
    const jakartaDate = getJakartaTime()

    const { data: newGoal, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title: goalData.title,
        description: goalData.description,
        category: goalData.category,
        target_value: goalData.targetValue || null,
        current_value: 0,
        unit: goalData.unit || null,
        deadline: goalData.deadline || null,
        status: "active",
        created_at: jakartaDate.toISOString(),
        updated_at: jakartaDate.toISOString(),
      })
      .select()
      .single()

    if (!error && newGoal && goalData.tasks?.length > 0) {
      // Add breakdown tasks
      const tasksToInsert = goalData.tasks.map((task, index) => ({
        goal_id: newGoal.id,
        task: task,
        completed: false,
        order_index: index,
        created_at: jakartaDate.toISOString(),
      }))

      await supabase.from("goal_tasks").insert(tasksToInsert)
    }

    setShowForm(false)
    loadGoals()
  }

  // ================================
  // DELETE GOAL
  // ================================
  const deleteGoal = async (id) => {
    if (confirm("Hapus goal ini? Semua task breakdown juga akan terhapus.")) {
      await supabase.from("goals").delete().eq("id", id)
      setSelectedGoal(null)
      loadGoals()
    }
  }

  // ================================
  // TOGGLE GOAL STATUS
  // ================================
  const toggleGoalStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "completed" : "active"

    await supabase
      .from("goals")
      .update({ 
        status: newStatus,
        updated_at: getJakartaTime().toISOString()
      })
      .eq("id", id)

    loadGoals()
    if (selectedGoal?.id === id) {
      setSelectedGoal({ ...selectedGoal, status: newStatus })
    }
  }

  // ================================
  // ARCHIVE GOAL
  // ================================
  const archiveGoal = async (id) => {
    await supabase
      .from("goals")
      .update({ 
        status: "archived",
        updated_at: getJakartaTime().toISOString()
      })
      .eq("id", id)

    setSelectedGoal(null)
    loadGoals()
  }

  // Categories
  const categories = [
    { id: "all", label: "Semua", icon: "" },
    { id: "health", label: "Kesehatan", icon: "" },
    { id: "finance", label: "Keuangan", icon: "" },
    { id: "career", label: "Karir", icon: "" },
    { id: "education", label: "Pendidikan", icon: "" },
    { id: "personal", label: "Personal", icon: "" },
  ]

  // Stats
  const activeGoals = goals.filter(g => g.status === "active").length
  const completedGoals = goals.filter(g => g.status === "completed").length
  const totalProgress = goals.length > 0 
    ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-900">🎯 Goal Aktif</p>
          <p className="text-3xl font-black text-blue-600 mt-1">{activeGoals}</p>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <p className="text-sm font-medium text-green-900">✅ Selesai</p>
          <p className="text-3xl font-black text-green-600 mt-1">{completedGoals}</p>
        </div>

        <div className="bg-neutral-50 border-2 border-neutral-200 rounded-xl p-4">
          <p className="text-sm font-medium text-neutral-900">📊 Progress Rata-rata</p>
          <p className="text-3xl font-black text-neutral-900 mt-1">
            {Math.round(totalProgress)}%
          </p>
        </div>
      </div>

      {/* Progress Chart */}
      {goals.length > 0 && <GoalChart goals={goals} />}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              categoryFilter === cat.id
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 hover:bg-neutral-200"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Add Goal Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-4 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all shadow-md"
      >
        {showForm ? "❌ Batal" : "➕ Tambah Goal Baru"}
      </button>

      {/* Goal Form */}
      {showForm && (
        <div className="bg-neutral-50 border-2 border-neutral-200 rounded-xl p-6">
          <GoalForm onAdd={addGoal} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Goal Detail Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <GoalDetail
              goal={selectedGoal}
              onClose={() => setSelectedGoal(null)}
              onUpdate={() => {
                loadGoals()
                setSelectedGoal(null)
              }}
              onDelete={deleteGoal}
              onToggleStatus={toggleGoalStatus}
              onArchive={archiveGoal}
            />
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-12 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-300">
            <p className="text-4xl mb-4">🎯</p>
            <p className="text-neutral-600 font-medium">
              {type === "completed" 
                ? "Belum ada goal yang selesai" 
                : "Belum ada goal. Mulai tambahkan tujuan Anda!"}
            </p>
          </div>
        ) : (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={() => setSelectedGoal(goal)}
              onToggleStatus={toggleGoalStatus}
            />
          ))
        )}
      </div>
    </div>
  )
}
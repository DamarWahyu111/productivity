"use client"

export default function GoalCard({ goal, onClick, onToggleStatus }) {
  const categoryEmojis = {
    health: "💪",
    finance: "💰",
    career: "🚀",
    education: "📚",
    personal: "🎯",
  }

  const categoryColors = {
    health: "bg-green-100 text-green-800 border-green-300",
    finance: "bg-yellow-100 text-yellow-800 border-yellow-300",
    career: "bg-blue-100 text-blue-800 border-blue-300",
    education: "bg-purple-100 text-purple-800 border-purple-300",
    personal: "bg-pink-100 text-pink-800 border-pink-300",
  }

  const getDaysRemaining = () => {
    if (!goal.deadline) return null
    
    const now = new Date()
    const deadline = new Date(goal.deadline)
    const diffTime = deadline - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const daysRemaining = getDaysRemaining()

  return (
    <div
      className={`bg-white border-2 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer ${
        goal.status === "completed" 
          ? "border-green-300 bg-green-50" 
          : "border-neutral-200 hover:border-purple-300"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                categoryColors[goal.category] || categoryColors.personal
              }`}
            >
              {categoryEmojis[goal.category]} {goal.category}
            </span>

            {goal.status === "completed" && (
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
                ✅ Selesai
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-neutral-900 mb-1">
            {goal.title}
          </h3>

          {goal.description && (
            <p className="text-sm text-neutral-600 line-clamp-2">
              {goal.description}
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleStatus(goal.id, goal.status)
          }}
          className={`ml-4 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            goal.status === "completed"
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {goal.status === "completed" ? "↩️ Aktifkan" : "✅ Selesai"}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-neutral-600">
            Progress: {goal.completedTasks || 0}/{goal.totalTasks || 0} tasks
          </span>
          <span className="text-sm font-bold text-purple-600">
            {Math.round(goal.progress || 0)}%
          </span>
        </div>

        <div className="w-full bg-neutral-200 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{
              width: `${goal.progress || 0}%`,
              background: goal.status === "completed" 
                ? "linear-gradient(to right, #22c55e, #16a34a)"
                : "linear-gradient(to right, #a855f7, #7c3aed)",
            }}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-3">
          {goal.target_value && (
            <span className="bg-neutral-100 px-2 py-1 rounded">
              🎯 Target: {goal.current_value || 0}/{goal.target_value} {goal.unit}
            </span>
          )}
          
          {daysRemaining !== null && (
            <span
              className={`px-2 py-1 rounded font-medium ${
                daysRemaining < 0
                  ? "bg-red-100 text-red-700"
                  : daysRemaining < 7
                  ? "bg-orange-100 text-orange-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {daysRemaining < 0 
                ? `⏰ Lewat ${Math.abs(daysRemaining)} hari`
                : daysRemaining === 0
                ? "⏰ Hari ini!"
                : `📅 ${daysRemaining} hari lagi`}
            </span>
          )}
        </div>

        <span>
          Dibuat: {new Date(goal.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    </div>
  )
}
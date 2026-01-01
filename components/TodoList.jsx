"use client"

export default function TodoList({ tasks, onToggle, onDelete, onClearAll }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 text-base sm:text-lg">📭 Belum ada tugas</p>
        <p className="text-neutral-400 text-xs sm:text-sm mt-2">Tambahkan tugas pertama Anda sekarang!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors border border-neutral-200"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              className="w-5 h-5 rounded border-neutral-300 accent-neutral-900 cursor-pointer flex-shrink-0"
            />
            <span
              className={`flex-1 text-sm sm:text-base ${
                task.completed ? "line-through text-neutral-400" : "text-neutral-900"
              }`}
            >
              {task.text}
            </span>
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onClearAll}
        className="w-full mt-4 py-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors border border-red-200 text-sm sm:text-base"
      >
        Hapus Semua
      </button>
    </div>
  )
}

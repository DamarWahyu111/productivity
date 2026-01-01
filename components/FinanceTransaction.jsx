"use client"

export default function FinanceTransaction({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 bg-neutral-50 rounded-lg border border-neutral-200 shadow-sm">
        <p className="text-neutral-600 text-base sm:text-lg">📭 Belum ada transaksi</p>
      </div>
    )
  }

  const getSourceColor = (source) => {
    if (source === "daily") return "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200"
    if (source === "weekly") return "bg-gradient-to-r from-red-50 to-red-100 border-red-200"
    if (source === "monthly") return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"
    return "bg-gradient-to-r from-neutral-50 to-neutral-100 border-neutral-200"
  }

  const getSourceTextColor = (source) => {
    if (source === "daily") return "text-blue-700"
    if (source === "weekly") return "text-red-700"
    if (source === "monthly") return "text-yellow-700"
    return "text-neutral-700"
  }

  const getSourceBadgeColor = (source) => {
    if (source === "daily") return "bg-blue-200 text-blue-800"
    if (source === "weekly") return "bg-red-200 text-red-800"
    if (source === "monthly") return "bg-yellow-200 text-yellow-800"
    return "bg-neutral-200 text-neutral-800"
  }

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="space-y-2">
      {sortedTransactions.map((trans) => {
        const category = trans.category || "transaksi"
        const source = trans.source || "daily"
        const categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1)
        const sourceDisplay = source.charAt(0).toUpperCase() + source.slice(1)

        return (
          <div
            key={trans.id}
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${getSourceColor(source)}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p
                  className={`font-semibold text-sm sm:text-base ${
                    trans.type === "income" ? "text-green-700" : getSourceTextColor(source)
                  }`}
                >
                  {categoryDisplay}
                </p>
                <span className={`text-xs px-2 py-1 rounded ${getSourceBadgeColor(source)}`}>{sourceDisplay}</span>
              </div>
              {trans.description && <p className="text-xs sm:text-sm text-neutral-600">{trans.description}</p>}
              <p className="text-xs text-neutral-500 mt-1">{new Date(trans.date).toLocaleString("id-ID")}</p>
            </div>

            <div className="flex items-center gap-4 ml-0 sm:ml-4">
              <p
                className={`text-base sm:text-lg font-bold whitespace-nowrap ${
                  trans.type === "income" ? "text-green-600" : getSourceTextColor(source)
                }`}
              >
                {trans.type === "income" ? "+" : "-"} Rp {trans.amount.toLocaleString("id-ID")}
              </p>
              <button
                onClick={() => onDelete(trans.id)}
                className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all transform hover:scale-110 flex-shrink-0 shadow-sm hover:shadow-md"
              >
                🗑️
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

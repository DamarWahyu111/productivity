"use client"

export default function MenuCard({ title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all text-left group border border-neutral-200 hover:border-neutral-400 w-full"
    >
      <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">
        {title}
      </h3>
      <p className="text-neutral-600 mt-3 text-sm sm:text-base">{description}</p>
      <div className="mt-6 flex items-center text-neutral-900 font-medium text-sm sm:text-base">
        Buka <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </button>
  )
}

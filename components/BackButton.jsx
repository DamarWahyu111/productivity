"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function BackButton({ onClick }) {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleBack = () => {
    if (onClick) {
      onClick()
    } else {
      if (isMounted && window.history.length > 1) {
        router.back()
      } else {
        router.push("/dashboard")
      }
    }
  }

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
    >
      ← Kembali
    </button>
  )
}
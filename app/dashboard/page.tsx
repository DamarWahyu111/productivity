"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-context"
import Dashboard from "@/components/Dashboard"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth")
  }, [user, isLoading, router])

  if (isLoading || !user) return <p>Loading...</p>

  return (
    <div>
      <div className="flex justify-between items-center px-4 py-4">
        <h2>Selamat datang, {user?.name ?? user?.email}</h2>

        <Button onClick={logout}>Logout</Button>
      </div>

      <Dashboard onNavigate={(section: string) =>
        router.push(`/dashboard/${section}`)
      } />
    </div>
  )
}

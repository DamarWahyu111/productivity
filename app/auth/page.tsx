"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-context"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"

export default function AuthPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)

  // sudah login → langsung ke dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  // masih cek session → tampilkan loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking session...
      </div>
    )
  }

  //  belum login → tampilkan halaman auth
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Produktivitas Aplikasi</h1>
            <p className="text-muted-foreground">Kelola Produktivitas Anda dengan mudah</p>
          </div>

          <div className="bg-card border rounded-xl p-6">
            {isLogin ? (
              <LoginForm onSwitchMode={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onSwitchMode={() => setIsLogin(true)} />
            )}
          </div>

          <p className="text-center mt-4 text-sm">
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 ml-1"
            >
              {isLogin ? "Daftar" : "Masuk"}
            </button>
          </p>
        </div>
      </div>
    )
  }

  return null
}

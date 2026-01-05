"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/app/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Loader2 } from "lucide-react"

interface LoginFormProps {
  onSwitchMode: () => void
}

export function LoginForm({ onSwitchMode }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  
  const { login, resetPassword } = useAuth()

  // Load saved email if "Remember Me" was checked before
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    const wasRemembered = localStorage.getItem("rememberMe") === "true"
    
    if (savedEmail && wasRemembered) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      
      // Save email and preference if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email)
        localStorage.setItem("rememberMe", "true")
      } else {
        // Clear saved data if unchecked
        localStorage.removeItem("rememberedEmail")
        localStorage.removeItem("rememberMe")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Email atau password salah"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setResetSuccess(false)
    setResetLoading(true)

    try {
      await resetPassword(resetEmail)
      setResetSuccess(true)
      setResetEmail("")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengirim email reset"
      setError(errorMessage)
    } finally {
      setResetLoading(false)
    }
  }

  // Forgot Password Modal
  if (showForgotPassword) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Lupa Password</h2>
          <button
            onClick={() => {
              setShowForgotPassword(false)
              setResetSuccess(false)
              setError("")
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✅ Email reset password telah dikirim! Cek inbox Anda.
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="masukkan@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold py-2"
            disabled={resetLoading}
          >
            {resetLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengirim...
              </>
            ) : (
              "Kirim Link Reset"
            )}
          </Button>

          <button
            type="button"
            onClick={() => setShowForgotPassword(false)}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Kembali ke Login
          </button>
        </form>
      </div>
    )
  }

  // Regular Login Form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground mb-6">Masuk</h2>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="masukkan@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-border cursor-pointer"
          />
          <span className="text-muted-foreground">Ingat saya</span>
        </label>
        <button 
          type="button" 
          onClick={() => setShowForgotPassword(true)}
          className="text-primary hover:text-accent transition-colors"
        >
          Lupa password?
        </button>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold py-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          "Masuk"
        )}
      </Button>
    </form>
  )
}
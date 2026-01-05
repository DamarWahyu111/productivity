"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/app/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Loader2 } from "lucide-react"
import { ForgotPasswordForm } from "./ForgotPasswordForm"

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
  
  const { login } = useAuth()

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
      console.error("Login error details:", err)
  
      let errorMessage = "Email atau password salah"
      
      if (err instanceof Error) {
        // Handle specific error types
        if (err.message.includes("fetch") || err.message.includes("Failed to fetch")) {
          errorMessage = "Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi."
        } else if (err.message.includes("Invalid login credentials")) {
          errorMessage = "Email atau password salah"
        } else if (err.message.includes("Email not confirmed")) {
          errorMessage = "Email belum diverifikasi. Cek inbox Anda."
        } else if (err.message.includes("session")) {
          errorMessage = "Gagal membuat sesi. Coba refresh halaman."
        } else {
          errorMessage = err.message
        }
      }      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Show Forgot Password Form
  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
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
        className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-semibold py-2"
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
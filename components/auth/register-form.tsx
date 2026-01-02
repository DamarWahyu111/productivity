"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/app/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Lock, Loader2, Check } from "lucide-react"

interface RegisterFormProps {
  onSwitchMode: () => void
}

export function RegisterForm({ onSwitchMode }: RegisterFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const { register } = useAuth()

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++
    setPasswordStrength(strength)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    checkPasswordStrength(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Password tidak cocok")
      return
    }

    if (passwordStrength < 2) {
      setError("Password terlalu lemah. Gunakan kombinasi huruf, angka, dan simbol")
      return
    }

    setLoading(true)

    try {
      await register(name, email, password)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi nanti"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const strengthLabels = ["Sangat Lemah", "Lemah", "Sedang", "Kuat", "Sangat Kuat"]
  const strengthColors = ["bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground mb-6">Daftar</h2>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Nama Lengkap</label>
        <div className="relative">
          <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Masukkan nama anda"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>

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
            onChange={handlePasswordChange}
            required
            className="pl-10"
          />
        </div>
        {password && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Kekuatan: {strengthLabels[passwordStrength]}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Konfirmasi Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="pl-10"
          />
          {confirmPassword && password === confirmPassword && (
            <Check className="absolute right-3 top-3 w-5 h-5 text-green-500" />
          )}
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" required className="rounded border-border mt-1" />
        <span className="text-muted-foreground">
          Saya setuju dengan{" "}
          <button type="button" className="text-primary hover:text-accent">
            Syarat & Ketentuan
          </button>{" "}
          dan{" "}
          <button type="button" className="text-primary hover:text-accent">
            Kebijakan Privasi
          </button>
        </span>
      </label>

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
          "Daftar"
        )}
      </Button>
    </form>
  )
}

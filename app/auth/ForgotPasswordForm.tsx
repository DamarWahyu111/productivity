"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react"

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [mode, setMode] = useState<"choose" | "change" | "reset">("choose")
  
  // Change Password (dengan password lama)
  const [email, setEmail] = useState("")
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // Reset Password (kirim link email)
  const [resetEmail, setResetEmail] = useState("")
  const [resetSuccess, setResetSuccess] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // ==========================================
  // CHANGE PASSWORD (dengan password lama)
  // ==========================================
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Validasi
      if (!email || !oldPassword || !newPassword || !confirmPassword) {
        throw new Error("Semua field harus diisi")
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Password baru tidak cocok")
      }

      if (newPassword.length < 6) {
        throw new Error("Password minimal 6 karakter")
      }

      if (oldPassword === newPassword) {
        throw new Error("Password baru harus berbeda dengan password lama")
      }

      // Step 1: Login dulu dengan password lama untuk verifikasi
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: oldPassword,
      })

      if (signInError) {
        throw new Error("Email atau password lama salah")
      }

      // Step 2: Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      setSuccess("✅ Password berhasil diubah! Silakan login dengan password baru.")
      
      // Clear form
      setEmail("")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")

      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        onBack()
      }, 2000)

    } catch (err) {
      console.error("Change password error:", err)
      setError(err instanceof Error ? err.message : "Gagal mengubah password")
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // RESET PASSWORD (kirim link email)
  // ==========================================
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setResetSuccess(true)
    } catch (err) {
      console.error("Reset password error:", err)
      setError(err instanceof Error ? err.message : "Gagal mengirim email reset password")
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // PILIH MODE
  // ==========================================
  if (mode === "choose") {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Kembali</span>
        </button>

        <h2 className="text-2xl font-bold text-foreground mb-2">Masalah Password?</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Pilih metode yang sesuai dengan situasi Anda:
        </p>

        <div className="space-y-3">
          <button
            onClick={() => setMode("change")}
            className="w-full p-4 border-2 border-neutral-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
          >
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h3 className="font-bold text-foreground mb-1">
                  Ubah Password
                </h3>
                <p className="text-sm text-muted-foreground">
                  Saya masih ingat password lama dan ingin mengubahnya
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode("reset")}
            className="w-full p-4 border-2 border-neutral-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-bold text-foreground mb-1">
                  Reset via Email
                </h3>
                <p className="text-sm text-muted-foreground">
                  Saya lupa password lama, kirim link reset ke email
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    )
  }

  // ==========================================
  // MODE: CHANGE PASSWORD
  // ==========================================
  if (mode === "change") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setMode("choose")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Kembali</span>
        </button>

        <h2 className="text-2xl font-bold text-foreground mb-2">Ubah Password</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Masukkan email dan password lama untuk verifikasi
        </p>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="masukkan@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Password Lama</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Password Baru</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">Minimal 6 karakter</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Konfirmasi Password Baru</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            onClick={handleChangePassword}
            className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-semibold py-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengubah...
              </>
            ) : (
              "Ubah Password"
            )}
          </Button>
        </div>
      </div>
    )
  }

  // ==========================================
  // MODE: RESET PASSWORD (Email)
  // ==========================================
  if (mode === "reset") {
    if (resetSuccess) {
      return (
        <div className="space-y-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground">Email Terkirim!</h2>
            
            <p className="text-muted-foreground">
              Kami telah mengirim link reset password ke <strong>{resetEmail}</strong>
            </p>
            
            <p className="text-sm text-muted-foreground">
              Cek inbox email Anda dan klik link untuk reset password.
            </p>
          </div>

          <Button
            onClick={onBack}
            className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-semibold py-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Login
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <button
          onClick={() => setMode("choose")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Kembali</span>
        </button>

        <h2 className="text-2xl font-bold text-foreground mb-2">Reset via Email</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Masukkan email Anda dan kami akan mengirim link untuk reset password.
        </p>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="masukkan@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            onClick={handleResetPassword}
            className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-semibold py-2"
            disabled={loading || !resetEmail}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengirim...
              </>
            ) : (
              "Kirim Link Reset Password"
            )}
          </Button>
        </div>
      </div>
    )
  }

  return null
}
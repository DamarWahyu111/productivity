"use client"

import { useState } from "react"
import { useAuth } from "@/app/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Loader2, Eye, EyeOff } from "lucide-react"

export function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const { updatePassword, user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validasi
    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Password baru dan konfirmasi tidak cocok")
      return
    }

    if (newPassword === currentPassword) {
      setError("Password baru tidak boleh sama dengan password lama")
      return
    }

    setLoading(true)

    try {
      // Update password langsung tanpa email
      await updatePassword(newPassword)
      
      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      // Auto hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengubah password"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6 max-w-2xl">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Ubah Password
        </h3>
        <p className="text-sm text-neutral-600 mt-1">
          Pastikan password baru Anda kuat dan mudah diingat
        </p>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <span className="text-lg">✅</span>
          <span>Password berhasil diubah!</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <span className="text-lg">❌</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            Password Saat Ini
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
            <Input
              type={showCurrent ? "text" : "password"}
              placeholder="Masukkan password saat ini"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
            >
              {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            Password Baru
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
            <Input
              type={showNew ? "text" : "password"}
              placeholder="Minimal 6 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {newPassword && (
            <div className="flex items-center gap-2 text-xs">
              <div className={`h-1 flex-1 rounded ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={newPassword.length >= 6 ? 'text-green-600' : 'text-red-600'}>
                {newPassword.length >= 6 ? 'Kuat' : 'Lemah'}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            Konfirmasi Password Baru
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="Ulangi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPassword && (
            <p className={`text-xs ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
              {newPassword === confirmPassword ? '✓ Password cocok' : '✗ Password tidak cocok'}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengubah Password...
              </>
            ) : (
              "Ubah Password"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCurrentPassword("")
              setNewPassword("")
              setConfirmPassword("")
              setError("")
            }}
            className="px-6"
          >
            Reset
          </Button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 <strong>Tips:</strong> Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk password yang lebih aman.
        </p>
      </div>
    </div>
  )
}
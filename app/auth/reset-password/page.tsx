"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Loader2, CheckCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [checkingToken, setCheckingToken] = useState(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if user came from email link (has recovery token)
    const checkRecoveryToken = async () => {
      try {
        // Supabase automatically handles the token from URL
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Session error:", error)
          setError("Link reset password tidak valid atau sudah kadaluarsa")
          setIsValidToken(false)
        } else if (session) {
          setIsValidToken(true)
        } else {
          setError("Link reset password tidak valid atau sudah kadaluarsa")
          setIsValidToken(false)
        }
      } catch (err) {
        console.error("Token check error:", err)
        setError("Terjadi kesalahan saat memverifikasi link")
        setIsValidToken(false)
      } finally {
        setCheckingToken(false)
      }
    }

    checkRecoveryToken()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidToken(true)
        setCheckingToken(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async () => {
    setError("")

    // Validasi
    if (!newPassword || !confirmPassword) {
      setError("Semua field harus diisi")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Password tidak cocok")
      return
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }

    setLoading(true)

    try {
      // Update password menggunakan session dari recovery token
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      setSuccess(true)

      // Redirect ke login setelah 3 detik
      setTimeout(() => {
        router.push("/auth")
      }, 3000)

    } catch (err) {
      console.error("Reset password error:", err)
      setError(err instanceof Error ? err.message : "Gagal reset password")
    } finally {
      setLoading(false)
    }
  }

  // Loading state saat check token
  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-600" />
          <p className="text-neutral-600">Memverifikasi link reset password...</p>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-neutral-900">Password Berhasil Diubah!</h2>
            
            <p className="text-neutral-600">
              Password Anda telah berhasil diperbarui. Anda akan diarahkan ke halaman login...
            </p>

            <div className="pt-4">
              <Button
                onClick={() => router.push("/auth")}
                className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-semibold py-3"
              >
                Kembali ke Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-4xl">❌</span>
            </div>
            
            <h2 className="text-2xl font-bold text-neutral-900">Link Tidak Valid</h2>
            
            <p className="text-neutral-600">
              {error || "Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link baru."}
            </p>

            <div className="pt-4">
              <Button
                onClick={() => router.push("/auth")}
                className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-semibold py-3"
              >
                Kembali ke Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Reset Password</h2>
          <p className="text-neutral-600 text-sm">
            Masukkan password baru Anda
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Password Baru
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1">Minimal 6 karakter</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
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
            onClick={handleSubmit}
            className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-semibold py-3 mt-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengubah Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
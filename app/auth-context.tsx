"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  resetPasswordDirect: (email: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    
    const checkSession = async () => {
      try {
        // Add retry logic for initial session check
        let retries = 3
        let lastError = null
        
        while (retries > 0) {
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession()

            if (!mounted) return

            if (session?.user) {
              setUser({
                id: session.user.id,
                email: session.user.email || "",
                name: session.user.user_metadata?.name,
              })
            }
            
            // Success - break the retry loop
            break
          } catch (err) {
            lastError = err
            retries--
            
            if (retries > 0) {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }
        
        if (retries === 0 && lastError) {
          console.error("Failed to check session after retries:", lastError)
          // Clear potentially corrupted session data
          localStorage.removeItem('supabase.auth.token')
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return
      
      console.log("Auth event:", event)
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name,
        })
      } else {
        setUser(null)
      }

      // Handle password recovery
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/auth/reset-password')
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [router])

  const login = async (email: string, password: string) => {
    try {
      // Clear any existing sessions first
      await supabase.auth.signOut()
      
      // Small delay to ensure clean state
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      // Verify session was created
      if (!data.session) {
        throw new Error("Failed to create session")
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      throw new Error(error instanceof Error ? error.message : "Login failed")
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) throw error

      // Auto login after registration
      router.push("/dashboard")
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Registration failed")
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      
      // Clear "Remember Me" data on logout
      localStorage.removeItem("rememberedEmail")
      localStorage.removeItem("rememberMe")
      
      router.push("/auth")
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Logout failed")
    }
  }

  // Reset Password - Send email with reset link
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Password reset failed")
    }
  }

  // Update Password - After clicking reset link
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Password update failed")
    }
  }

  // Reset Password Direct - User verifies via email first
  const resetPasswordDirect = async (email: string, newPassword: string) => {
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      })
      
      if (resetError) throw resetError
      
      // Store new password temporarily
      sessionStorage.setItem('pendingPasswordReset', JSON.stringify({ email, newPassword }))
      
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Password reset failed")
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login, 
        register, 
        logout, 
        resetPassword, 
        updatePassword,
        resetPasswordDirect
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
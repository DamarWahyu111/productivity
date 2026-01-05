// Tambahkan ini di supabase-client.ts untuk debug

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Supabase URL:", supabaseUrl)
console.log("🔍 Supabase Key exists:", !!supabaseKey)
console.log("🔍 Supabase Key length:", supabaseKey?.length)

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials!")
  throw new Error(
    "Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.",
  )
}

// Validasi format URL
try {
  new URL(supabaseUrl)
  console.log("✅ Supabase URL is valid")
} catch (e) {
  console.error("❌ Invalid Supabase URL format:", supabaseUrl)
  throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL format")
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
  }
})

if (typeof window !== 'undefined') {
  supabase.auth.getSession()
    .then(({ data, error }) => {
      if (error) {
        console.error("❌ Supabase connection error:", error.message)
      } else {
        console.log("✅ Supabase connected successfully")
        console.log("📝 Current session:", data.session ? "Exists" : "None")
      }
    })
    .catch(err => {
      console.error("❌ Failed to connect to Supabase:", err)
    })
}
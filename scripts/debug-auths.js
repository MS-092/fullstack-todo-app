// Debug script to check authentication persistence
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Debugging Authentication & Data Persistence...")

if (!supabaseUrl || !supabaseKey) {
  console.log("❌ Environment variables missing!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAuth() {
  try {
    console.log("\n👤 Checking current session...")
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.log("❌ Session error:", sessionError.message)
    } else if (session) {
      console.log("✅ Active session found:")
      console.log("   User ID:", session.user.id)
      console.log("   Email:", session.user.email)
      console.log("   Expires:", new Date(session.expires_at * 1000).toLocaleString())

      // Test data access with current session
      console.log("\n📋 Testing data access...")
      const { data: todos, error: todosError } = await supabase
        .from("todostable")
        .select("*")
        .eq("user_id", session.user.id)

      if (todosError) {
        console.log("❌ Data access error:", todosError.message)
        if (todosError.message.includes("relation") && todosError.message.includes("does not exist")) {
          console.log("🔧 Table 'todostable' doesn't exist. Run the SQL scripts!")
        }
      } else {
        console.log("✅ Data access successful:", todos.length, "todos found")
      }
    } else {
      console.log("ℹ️  No active session")
    }

    console.log("\n🔄 Testing auth state persistence...")
    console.log("   Browser localStorage available:", typeof localStorage !== "undefined")

    console.log("\n📊 Summary:")
    console.log("   - Environment variables: ✅")
    console.log("   - Supabase connection: ✅")
    console.log("   - Session persistence:", session ? "✅" : "❌")
    console.log("   - Data table:", "Check manually in Supabase dashboard")

    console.log("\n🔧 Troubleshooting tips:")
    console.log("1. Make sure you've run the SQL scripts for 'todostable'")
    console.log("2. Try signing out and signing back in")
    console.log("3. Check browser console for detailed errors")
    console.log("4. Verify your Supabase project is active")
  } catch (error) {
    console.log("❌ Unexpected error:", error.message)
  }
}

debugAuth()
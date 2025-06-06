// Debug script to test Supabase connection and database setup
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Debugging Supabase Connection...")
console.log("📍 Supabase URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
console.log("🔑 Supabase Key:", supabaseKey ? "✅ Set" : "❌ Missing")

if (!supabaseUrl || !supabaseKey) {
  console.log("❌ Environment variables missing!")
  console.log("Please check your .env.local file")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugSupabase() {
  try {
    console.log("\n🧪 Testing Supabase connection...")

    // Test 1: Check if we can connect to Supabase
    const { data: healthCheck, error: healthError } = await supabase
      .from("todos")
      .select("count", { count: "exact", head: true })

    if (healthError) {
      console.log("❌ Connection failed:", healthError.message)

      if (healthError.message.includes("relation") && healthError.message.includes("does not exist")) {
        console.log("🔧 The 'todos' table doesn't exist!")
        console.log("📝 Please run the SQL scripts in your Supabase dashboard:")
        console.log("   1. Go to SQL Editor in Supabase")
        console.log("   2. Run the scripts/001-create-tables.sql script")
        return
      }

      if (healthError.message.includes("JWT")) {
        console.log("🔧 Authentication issue!")
        console.log("📝 Check your Supabase keys in .env.local")
        return
      }

      console.log("🔧 Other database error. Check your Supabase project status.")
      return
    }

    console.log("✅ Successfully connected to Supabase!")

    // Test 2: Check table structure
    console.log("\n🏗️  Checking table structure...")
    const { data: tableInfo, error: tableError } = await supabase
      .rpc("get_table_info", { table_name: "todos" })
      .single()

    if (tableError) {
      console.log("⚠️  Could not get table info (this is normal)")
    }

    // Test 3: Try to insert a test record (will fail if RLS is working correctly without auth)
    console.log("\n🔒 Testing Row Level Security...")
    const { data: testInsert, error: insertError } = await supabase.from("todos").insert([
      {
        title: "Test Todo",
        description: "This is a test",
        status: "pending",
        priority: "medium",
        user_id: "test-user-id",
      },
    ])

    if (insertError) {
      if (insertError.message.includes("RLS") || insertError.message.includes("policy")) {
        console.log("✅ Row Level Security is working correctly!")
        console.log("   (Insert failed as expected without proper authentication)")
      } else {
        console.log("⚠️  Insert error:", insertError.message)
      }
    } else {
      console.log("⚠️  Insert succeeded without authentication - RLS might not be configured")
    }

    // Test 4: Check auth
    console.log("\n👤 Checking authentication...")
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError) {
      console.log("❌ Auth error:", authError.message)
    } else if (session) {
      console.log("✅ User is authenticated:", session.user.email)
    } else {
      console.log("ℹ️  No active session (this is normal if not logged in)")
    }

    console.log("\n🎉 Supabase debugging complete!")
    console.log("\n📋 Next steps:")
    console.log("1. Make sure you've run the SQL scripts in Supabase")
    console.log("2. Try signing up/logging in to test authentication")
    console.log("3. Check browser console for more detailed errors")
  } catch (error) {
    console.log("❌ Unexpected error:", error.message)
  }
}

debugSupabase()

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for database operations with 'todostable'
export const todoService = {
  // Get all todos for a user
  async getTodos(userId) {
    const { data, error } = await supabase
      .from("todostable") // Updated table name
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  // Create a new todo
  async createTodo(todoData) {
    const { data, error } = await supabase.from("todostable").insert([todoData]).select() // Updated table name

    if (error) throw error
    return data[0]
  },

  // Update a todo
  async updateTodo(id, updates) {
    const { data, error } = await supabase.from("todostable").update(updates).eq("id", id).select() // Updated table name

    if (error) throw error
    return data[0]
  },

  // Delete a todo
  async deleteTodo(id) {
    const { error } = await supabase.from("todostable").delete().eq("id", id) // Updated table name

    if (error) throw error
  },
}

// Auth helper functions
export const authService = {
  // Sign up a new user
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  // Sign in a user
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  // Sign out a user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Update user password
  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  },

  // Get current session
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) throw error
    return session
  },
}

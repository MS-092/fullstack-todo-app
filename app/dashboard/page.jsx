"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CheckCircle, Plus, Edit, Trash2, User, LogOut, Filter, MoreVertical, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [todos, setTodos] = useState([])
  const [filteredTodos, setFilteredTodos] = useState([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("pending")
  const [priority, setPriority] = useState("medium")
  const [dueDate, setDueDate] = useState("")

  useEffect(() => {
    initializeAuth()
  }, [])

  useEffect(() => {
    filterTodos()
  }, [todos, filterStatus, filterPriority])

  const initializeAuth = async () => {
    try {
      setAuthLoading(true)
      console.log("🔐 Initializing authentication...")

      // First, check if there's an active Supabase session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
      }

      if (session?.user) {
        console.log("✅ Found active Supabase session:", session.user.email)
        setUser(session.user)
        await loadTodos(session.user.id)
        setAuthLoading(false)
        return
      }

      // If no Supabase session, check localStorage for fallback
      const userData = localStorage.getItem("user")
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData)
          console.log("📱 Found user in localStorage:", parsedUser.email)
          setUser(parsedUser)
          await loadTodos(parsedUser.id)
          setAuthLoading(false)
          return
        } catch (parseError) {
          console.error("Error parsing user data:", parseError)
          localStorage.removeItem("user")
        }
      }

      // No authentication found, redirect to login
      console.log("❌ No authentication found, redirecting to login")
      router.push("/auth/login")
    } catch (error) {
      console.error("Auth initialization error:", error)
      router.push("/auth/login")
    } finally {
      setAuthLoading(false)
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.email)

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        localStorage.setItem("user", JSON.stringify(session.user))
        await loadTodos(session.user.id)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setTodos([])
        localStorage.removeItem("user")
        router.push("/auth/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const loadTodos = async (userId) => {
    try {
      setError("")
      console.log("📋 Loading todos for user:", userId)

      // Use 'todostable' as you mentioned you changed the table name
      const { data: todos, error } = await supabase
        .from("todostable")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Load todos error:", error)

        // If table doesn't exist, show helpful error
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          setError("Database table 'todostable' not found. Please run the database setup scripts.")
          return
        }

        throw error
      }

      console.log("✅ Loaded todos:", todos?.length || 0, "items")
      setTodos(todos || [])
    } catch (error) {
      console.error("Failed to load todos:", error)
      setError(`Failed to load todos: ${error.message}`)
    }
  }

  useEffect(() => {
    if (!user?.id) return

    console.log("🔄 Setting up real-time subscription for user:", user.id)

    // Set up real-time subscription for 'todostable'
    const channel = supabase
      .channel("todostable_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todostable", // Updated table name
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("🔄 Real-time update:", payload)
          loadTodos(user.id)
        },
      )
      .subscribe()

    return () => {
      console.log("🧹 Cleaning up real-time subscription")
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const filterTodos = () => {
    let filtered = todos

    if (filterStatus !== "all") {
      filtered = filtered.filter((todo) => todo.status === filterStatus)
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((todo) => todo.priority === filterPriority)
    }

    setFilteredTodos(filtered)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStatus("pending")
    setPriority("medium")
    setDueDate("")
    setEditingTodo(null)
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!user?.id) {
      setError("User not authenticated. Please log in again.")
      setLoading(false)
      return
    }

    if (!title.trim()) {
      setError("Title is required")
      setLoading(false)
      return
    }

    const todoData = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      due_date: dueDate || null,
      user_id: user.id,
    }

    try {
      console.log("💾 Saving todo:", todoData)

      if (editingTodo) {
        const { data, error } = await supabase
          .from("todostable") // Updated table name
          .update(todoData)
          .eq("id", editingTodo.id)
          .eq("user_id", user.id)
          .select()

        if (error) {
          console.error("Update error:", error)
          throw error
        }

        console.log("✅ Todo updated:", data)
      } else {
        const { data, error } = await supabase
          .from("todostable") // Updated table name
          .insert([todoData])
          .select()

        if (error) {
          console.error("Insert error:", error)
          throw error
        }

        console.log("✅ Todo created:", data)
      }

      resetForm()
      setIsAddDialogOpen(false)
      await loadTodos(user.id)
    } catch (error) {
      console.error("Failed to save todo:", error)
      setError(`Failed to save todo: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (todo) => {
    setEditingTodo(todo)
    setTitle(todo.title)
    setDescription(todo.description || "")
    setStatus(todo.status)
    setPriority(todo.priority)
    setDueDate(todo.due_date || "")
    setError("")
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this todo?")) {
      return
    }

    try {
      setError("")
      console.log("🗑️ Deleting todo:", id)

      const { error } = await supabase
        .from("todostable") // Updated table name
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Delete error:", error)
        throw error
      }

      console.log("✅ Todo deleted successfully")
      await loadTodos(user.id)
    } catch (error) {
      console.error("Failed to delete todo:", error)
      setError(`Failed to delete todo: ${error.message}`)
    }
  }

  const toggleStatus = async (todo) => {
    const newStatus = todo.status === "completed" ? "pending" : "completed"

    try {
      setError("")
      console.log("🔄 Toggling status for todo:", todo.id, "to:", newStatus)

      const { error } = await supabase
        .from("todostable") // Updated table name
        .update({ status: newStatus })
        .eq("id", todo.id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Toggle status error:", error)
        throw error
      }

      console.log("✅ Todo status updated successfully")
      await loadTodos(user.id)
    } catch (error) {
      console.error("Failed to update todo:", error)
      setError(`Failed to update todo: ${error.message}`)
    }
  }

  const handleLogout = async () => {
    try {
      console.log("👋 Logging out...")
      await supabase.auth.signOut()
      localStorage.removeItem("user")
      setUser(null)
      setTodos([])
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      // Force logout even if there's an error
      localStorage.removeItem("user")
      setUser(null)
      setTodos([])
      router.push("/")
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access your dashboard</p>
          <Link href="/auth/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">TodoMaster</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todos.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {todos.filter((t) => t.status === "completed").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {todos.filter((t) => t.status === "in-progress").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {todos.filter((t) => t.status === "pending").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingTodo ? "Edit Task" : "Add New Task"}</DialogTitle>
                <DialogDescription>
                  {editingTodo ? "Update your task details." : "Create a new task to stay organized."}
                </DialogDescription>
              </DialogHeader>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : editingTodo ? "Update" : "Create"} Task
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid gap-4">
          {filteredTodos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-500 text-center">
                  {todos.length === 0
                    ? "Get started by creating your first task!"
                    : "Try adjusting your filters to see more tasks."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTodos.map((todo) => (
              <Card key={todo.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Checkbox
                        checked={todo.status === "completed"}
                        onCheckedChange={() => toggleStatus(todo)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${todo.status === "completed" ? "line-through text-gray-500" : ""}`}
                        >
                          {todo.title}
                        </h3>
                        {todo.description && <p className="text-sm text-gray-600 mt-1">{todo.description}</p>}
                        <div className="flex items-center gap-2 mt-3">
                          <Badge className={getStatusColor(todo.status)}>{todo.status.replace("-", " ")}</Badge>
                          <Badge className={getPriorityColor(todo.priority)}>{todo.priority}</Badge>
                          {todo.due_date && (
                            <span className="text-xs text-gray-500">
                              Due: {new Date(todo.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEdit(todo)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(todo.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

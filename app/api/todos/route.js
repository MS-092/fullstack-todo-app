import { NextResponse } from "next/server"

// Mock todos database - In production, use a real database
const todos = [
  {
    id: "1",
    title: "Welcome to TodoMaster!",
    description: "This is your first task. You can edit or delete it anytime.",
    status: "pending",
    priority: "medium",
    dueDate: "2024-12-31",
    createdAt: "2024-01-01T00:00:00.000Z",
    userId: "1",
  },
  {
    id: "2",
    title: "Complete project documentation",
    description: "Write comprehensive documentation for the new feature release.",
    status: "in-progress",
    priority: "high",
    dueDate: "2024-12-20",
    createdAt: "2024-01-02T00:00:00.000Z",
    userId: "1",
  },
]

export async function GET() {
  try {
    // In a real app, filter by authenticated user ID
    const userTodos = todos.filter((todo) => todo.userId === "1")

    return NextResponse.json({
      todos: userTodos,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { title, description, status, priority, dueDate } = await request.json()

    const newTodo = {
      id: (todos.length + 1).toString(),
      title,
      description,
      status,
      priority,
      dueDate,
      createdAt: new Date().toISOString(),
      userId: "1", // In a real app, get this from JWT token
    }

    todos.push(newTodo)

    return NextResponse.json({
      todo: newTodo,
      message: "Todo created successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

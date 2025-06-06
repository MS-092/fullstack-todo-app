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

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { title, description, status, priority, dueDate } = await request.json()

    const todoIndex = todos.findIndex((todo) => todo.id === id && todo.userId === "1")

    if (todoIndex === -1) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    todos[todoIndex] = {
      ...todos[todoIndex],
      title,
      description,
      status,
      priority,
      dueDate,
    }

    return NextResponse.json({
      todo: todos[todoIndex],
      message: "Todo updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const todoIndex = todos.findIndex((todo) => todo.id === id && todo.userId === "1")

    if (todoIndex === -1) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    todos.splice(todoIndex, 1)

    return NextResponse.json({
      message: "Todo deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

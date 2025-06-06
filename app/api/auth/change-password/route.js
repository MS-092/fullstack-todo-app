import { NextResponse } from "next/server"

// Mock user database - In production, use a real database
const users = [
  {
    id: "1",
    email: "demo@example.com",
    password: "password123",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
]

export async function POST(request) {
  try {
    const { currentPassword, newPassword } = await request.json()

    // In a real app, you'd get the user ID from the JWT token
    // For demo purposes, we'll use the first user
    const user = users[0]

    if (!user || user.password !== currentPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    // Update password
    user.password = newPassword // In production, hash this password

    return NextResponse.json({
      message: "Password updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

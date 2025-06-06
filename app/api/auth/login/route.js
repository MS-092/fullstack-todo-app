import { NextResponse } from "next/server"

// Mock user database - In production, use a real database
const users = [
  {
    id: "1",
    email: "demo@example.com",
    password: "password123", // In production, this would be hashed
    createdAt: "2024-01-01T00:00:00.000Z",
  },
]

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Find user by email
    const user = users.find((u) => u.email === email)

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Login successful",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      email,
      password, // In production, hash this password
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Account created successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

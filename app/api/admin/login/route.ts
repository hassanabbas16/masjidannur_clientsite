import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// In a real application, you would use a secure method to store and compare credentials
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "password123"

export async function POST(request: Request) {
  const body = await request.json()
  const { username, password } = body

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Set a cookie to indicate the user is logged in
    cookies().set("admin_token", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json({ success: false }, { status: 401 })
  }
}


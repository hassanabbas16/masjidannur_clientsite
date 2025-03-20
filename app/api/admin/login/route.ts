import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Use environment variables instead of hardcoded values
const ADMIN_USERNAME = process.env.ADMIN_USERNAME
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export async function POST(request: Request) {
  const body = await request.json()
  const { username, password } = body

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error("Admin credentials not configured in environment variables")
    return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 })
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Set a cookie to indicate the user is logged in
    cookies().set("admin_token", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json({ success: false }, { status: 401 })
  }
}


import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const adminToken = cookies().get("admin_token")

  if (adminToken) {
    return NextResponse.json({ authenticated: true })
  } else {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}


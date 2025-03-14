import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`

    const response = await fetch(verifyUrl, {
      method: 'POST',
    })

    const data = await response.json()

    if (data.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: 'Invalid captcha' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to verify captcha' },
      { status: 500 }
    )
  }
} 
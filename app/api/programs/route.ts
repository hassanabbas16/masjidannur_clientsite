import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Program from "@/models/program"

export async function GET() {
  try {
    await dbConnect()
    const programs = await Program.find().sort({ createdAt: -1 })
    return NextResponse.json(programs)
  } catch (error) {
    console.error("Error fetching programs:", error)
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()
    const body = await req.json()
    const program = await Program.create(body)
    return NextResponse.json(program, { status: 201 })
  } catch (error) {
    console.error("Error creating program:", error)
    return NextResponse.json({ error: "Failed to create program" }, { status: 500 })
  }
}


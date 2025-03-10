import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Program from "@/models/program"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const program = await Program.findById(params.id)
    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }
    return NextResponse.json(program)
  } catch (error) {
    console.error("Error fetching program:", error)
    return NextResponse.json({ error: "Failed to fetch program" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const body = await req.json()
    const program = await Program.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })
    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }
    return NextResponse.json(program)
  } catch (error) {
    console.error("Error updating program:", error)
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const program = await Program.findByIdAndDelete(params.id)
    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Program deleted successfully" })
  } catch (error) {
    console.error("Error deleting program:", error)
    return NextResponse.json({ error: "Failed to delete program" }, { status: 500 })
  }
}


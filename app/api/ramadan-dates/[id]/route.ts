import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import RamadanDate from "@/models/ramadanDate"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const date = await RamadanDate.findById(params.id)

    if (!date) {
      return NextResponse.json({ error: "Ramadan date not found" }, { status: 404 })
    }

    return NextResponse.json(date)
  } catch (error) {
    console.error("Error fetching Ramadan date:", error)
    return NextResponse.json({ error: "Failed to fetch Ramadan date" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await req.json()
    const date = await RamadanDate.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })

    if (!date) {
      return NextResponse.json({ error: "Ramadan date not found" }, { status: 404 })
    }

    return NextResponse.json(date)
  } catch (error) {
    console.error("Error updating Ramadan date:", error)
    return NextResponse.json({ error: "Failed to update Ramadan date" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const date = await RamadanDate.findByIdAndDelete(params.id)

    if (!date) {
      return NextResponse.json({ error: "Ramadan date not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Ramadan date deleted successfully" })
  } catch (error) {
    console.error("Error deleting Ramadan date:", error)
    return NextResponse.json({ error: "Failed to delete Ramadan date" }, { status: 500 })
  }
}


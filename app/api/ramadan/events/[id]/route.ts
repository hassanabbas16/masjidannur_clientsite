import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import RamadanEvent from "@/models/ramadanEvent"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const event = await RamadanEvent.findById(params.id)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error fetching Ramadan event:", error)
    return NextResponse.json({ error: "Failed to fetch Ramadan event" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await req.json()
    const event = await RamadanEvent.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error updating Ramadan event:", error)
    return NextResponse.json({ error: "Failed to update Ramadan event" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const event = await RamadanEvent.findByIdAndDelete(params.id)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting Ramadan event:", error)
    return NextResponse.json({ error: "Failed to delete Ramadan event" }, { status: 500 })
  }
}


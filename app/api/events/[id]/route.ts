import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Event from "@/models/event"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    
    console.log("Looking for event with ID:", params.id)
    
    if (!ObjectId.isValid(params.id)) {
      console.log("Invalid ObjectId format")
      return NextResponse.json({ error: "Invalid event ID format" }, { status: 400 })
    }

    const event = await Event.findById(params.id)
    
    if (!event) {
      console.log("Event not found in database")
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    console.log("Event found:", event)
    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await req.json()
    const event = await Event.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const event = await Event.findByIdAndDelete(params.id)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid event ID format" }, { status: 400 })
    }

    const body = await req.json()
    const event = await Event.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    )

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}


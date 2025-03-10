import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Event from "@/models/event"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const category = url.searchParams.get("category")
    const showHidden = url.searchParams.get("showHidden") === "true"

    const query: any = {}
    if (category) query.category = category
    if (!showHidden) query.isVisible = true

    const events = await Event.find(query).sort({ date: 1 })

    return NextResponse.json(events, { status: 200 })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()
    const event = await Event.create(body)

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}


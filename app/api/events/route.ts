import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Event from "@/models/event"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    console.log("Connected to database:", process.env.MONGODB_URI)

    const url = new URL(req.url)
    const showHidden = url.searchParams.get("showHidden") === "true"
    
    // Modify query based on showHidden parameter
    const query = showHidden ? {} : { isVisible: true }
    
    console.log("Query:", query); // Debug log
    
    const events = await Event.find(query).sort({ date: -1 })
    
    console.log("Found events:", events.length); // Debug log
    
    return NextResponse.json(events)
  } catch (error) {
    console.error("Error connecting to database or fetching events:", error)
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


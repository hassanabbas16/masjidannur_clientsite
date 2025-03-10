import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import RamadanEvent from "@/models/ramadanEvent"

export async function GET(req: Request) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const year = url.searchParams.get("year")
    const eventType = url.searchParams.get("eventType")
    const showHidden = url.searchParams.get("showHidden") === "true"

    const query: any = {}

    if (year) {
      query.year = Number.parseInt(year)
    } else {
      // Default to current year
      query.year = new Date().getFullYear()
    }

    if (eventType) {
      query.eventType = eventType
    }

    if (!showHidden) {
      query.isVisible = true
    }

    const events = await RamadanEvent.find(query).sort({ date: 1, time: 1 })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching Ramadan events:", error)
    return NextResponse.json({ error: "Failed to fetch Ramadan events" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()

    // Set default year if not provided
    if (!body.year) {
      body.year = new Date().getFullYear()
    }

    const event = await RamadanEvent.create(body)

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Error creating Ramadan event:", error)
    return NextResponse.json({ error: "Failed to create Ramadan event" }, { status: 500 })
  }
}


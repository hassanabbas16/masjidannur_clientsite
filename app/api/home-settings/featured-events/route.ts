import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import HomePageSettings from "@/models/homePageSettings"
import Event from "@/models/event"

export async function GET() {
  try {
    await dbConnect()

    // Get active settings
    const settings = await HomePageSettings.findOne({ isActive: true })

    if (!settings) {
      return NextResponse.json({ error: "Home page settings not found" }, { status: 404 })
    }

    // Get featured events
    let featuredEvents = []

    if (settings.featuredEventIds && settings.featuredEventIds.length > 0) {
      // Get events by IDs
      featuredEvents = await Event.find({
        _id: { $in: settings.featuredEventIds },
        isVisible: true,
      }).sort({ date: 1 })
    } else {
      // If no featured events are set, get upcoming events
      const now = new Date()
      featuredEvents = await Event.find({
        date: { $gte: now },
        isVisible: true,
      })
        .sort({ date: 1 })
        .limit(3)
    }

    return NextResponse.json(featuredEvents)
  } catch (error) {
    console.error("Error fetching featured events:", error)
    return NextResponse.json({ error: "Failed to fetch featured events" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()

    if (!body.eventIds) {
      return NextResponse.json({ error: "Event IDs are required" }, { status: 400 })
    }

    // Get active settings
    let settings = await HomePageSettings.findOne({ isActive: true })

    if (!settings) {
      return NextResponse.json({ error: "Home page settings not found" }, { status: 404 })
    }

    // Update featured events
    settings = await HomePageSettings.findByIdAndUpdate(
      settings._id,
      { featuredEventIds: body.eventIds },
      { new: true },
    )

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating featured events:", error)
    return NextResponse.json({ error: "Failed to update featured events" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()

    // Check if eventIds are provided
    if (!body.eventIds || body.eventIds.length === 0) {
      return NextResponse.json({ error: "Event IDs are required" }, { status: 400 })
    }

    // Get active settings
    let settings = await HomePageSettings.findOne({ isActive: true })

    if (!settings) {
      // Create new settings if none exists
      settings = await HomePageSettings.create({
        featuredEventIds: body.eventIds,
        isActive: true,
      })
    } else {
      // Update existing settings with new featured event IDs
      settings = await HomePageSettings.findByIdAndUpdate(
        settings._id,
        { featuredEventIds: body.eventIds },
        { new: true }
      )
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error creating/updating featured events:", error)
    return NextResponse.json({ error: "Failed to create/update featured events" }, { status: 500 })
  }
}

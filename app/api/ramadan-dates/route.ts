import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import RamadanDate from "@/models/ramadanDate"
import RamadanSettings from "@/models/ramadanSettings"

export async function GET(req: Request) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const year = url.searchParams.get("year")
    const available = url.searchParams.get("available")

    const query: any = {}
    if (year) {
      query.year = Number.parseInt(year)
    } else {
      // Default to current year if not specified
      const currentYear = new Date().getFullYear()
      query.year = currentYear
    }

    if (available !== null) {
      query.available = available === "true"
    }

    const dates = await RamadanDate.find(query).sort({ date: 1 })

    return NextResponse.json(dates)
  } catch (error) {
    console.error("Error fetching Ramadan dates:", error)
    return NextResponse.json({ error: "Failed to fetch Ramadan dates" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()

    // Validate required fields
    if (!body.date || body.year === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if date already exists for this year
    const existingDate = await RamadanDate.findOne({
      date: new Date(body.date),
      year: body.year,
    })

    if (existingDate) {
      return NextResponse.json({ error: "This date already exists for the specified year" }, { status: 400 })
    }

    // Create the date
    const ramadanDate = await RamadanDate.create(body)

    return NextResponse.json(ramadanDate, { status: 201 })
  } catch (error) {
    console.error("Error creating Ramadan date:", error)
    return NextResponse.json({ error: "Failed to create Ramadan date" }, { status: 500 })
  }
}

// Generate dates for a Ramadan year based on start and end dates
export async function PUT(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()

    // Validate required fields
    if (!body.year || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const startDate = new Date(body.startDate)
    const endDate = new Date(body.endDate)
    const year = body.year

    // Delete existing dates for this year if regenerate flag is true
    if (body.regenerate) {
      await RamadanDate.deleteMany({ year })
    }

    // Generate dates between start and end
    const dates = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      // Check if date already exists
      const existingDate = await RamadanDate.findOne({
        date: new Date(currentDate),
        year,
      })

      if (!existingDate) {
        dates.push({
          date: new Date(currentDate),
          available: true,
          year,
          sponsorId: null,
          sponsorName: null,
          notes: "",
        })
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Bulk insert new dates
    if (dates.length > 0) {
      await RamadanDate.insertMany(dates)
    }

    // Update or create Ramadan settings for this year
    let settings = await RamadanSettings.findOne({ year })

    if (!settings) {
      settings = await RamadanSettings.create({
        year,
        startDate,
        endDate,
        isActive: true,
      })
    } else {
      settings = await RamadanSettings.findByIdAndUpdate(settings._id, { startDate, endDate }, { new: true })
    }

    // Return all dates for this year
    const allDates = await RamadanDate.find({ year }).sort({ date: 1 })

    return NextResponse.json({
      message: `Generated ${dates.length} new dates for Ramadan ${year}`,
      dates: allDates,
      settings,
    })
  } catch (error) {
    console.error("Error generating Ramadan dates:", error)
    return NextResponse.json({ error: "Failed to generate Ramadan dates" }, { status: 500 })
  }
}


import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import RamadanSettings from "@/models/ramadanSettings"

export async function GET(req: Request) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const year = url.searchParams.get("year")

    const query: any = {}
    if (year) {
      query.year = Number.parseInt(year)
    } else {
      query.isActive = true
    }

    const settings = await RamadanSettings.findOne(query)

    if (!settings) {
      // If no settings found for the specified year or no active settings,
      // return a default template
      const currentYear = new Date().getFullYear()
      return NextResponse.json({
        year: currentYear,
        startDate: new Date(currentYear, 2, 1), // March 1st of current year
        endDate: new Date(currentYear, 2, 30), // March 30th of current year
        iftarCost: 500,
        iftarCapacity: 100,
        iftarDescription:
          "Sponsoring an iftar is a beautiful way to contribute to our community during the blessed month of Ramadan.",
        heroTitle: "Sponsor an Iftar",
        heroSubtitle: "Join us in providing iftar meals for our community during the blessed month of Ramadan",
        aboutTitle: "About Iftar Sponsorship",
        aboutDescription:
          "Sponsoring an iftar is a beautiful way to contribute to our community during the blessed month of Ramadan. Your generosity helps provide a nutritious meal for those breaking their fast at the masjid.",
        additionalInfo: [
          "The cost to sponsor an iftar is $500, which covers food and drinks for approximately 100 people.",
          "Sponsors are welcome to attend the iftar they've sponsored and may bring family members to help serve the meal.",
        ],
        isActive: true,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching Ramadan settings:", error)
    return NextResponse.json({ error: "Failed to fetch Ramadan settings" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()

    // Validate required fields
    if (!body.year || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // If this is set as active, deactivate all other settings
    if (body.isActive) {
      await RamadanSettings.updateMany({ _id: { $ne: body._id }, isActive: true }, { $set: { isActive: false } })
    }

    // Check if settings for this year already exist
    const existingSettings = await RamadanSettings.findOne({ year: body.year })

    let settings
    if (existingSettings) {
      // Update existing settings
      settings = await RamadanSettings.findByIdAndUpdate(existingSettings._id, body, { new: true, runValidators: true })
    } else {
      // Create new settings
      settings = await RamadanSettings.create(body)
    }

    return NextResponse.json(settings, { status: 201 })
  } catch (error) {
    console.error("Error creating/updating Ramadan settings:", error)
    return NextResponse.json({ error: "Failed to create/update Ramadan settings" }, { status: 500 })
  }
}


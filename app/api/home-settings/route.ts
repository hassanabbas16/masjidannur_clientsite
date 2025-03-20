import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import HomePageSettings from "@/models/homePageSettings"

export async function GET() {
  try {
    await dbConnect()

    // Get active settings or create default if none exists
    let settings = await HomePageSettings.findOne({ isActive: true })

    if (!settings) {
      // Create default settings
      settings = await HomePageSettings.create({
        heroTitle: "Welcome to Masjid AnNoor",
        heroSubtitle: "A place of worship, learning, and community for Muslims in Fort Smith, Arkansas",
        heroButtonPrimary: {
          text: "View Prayer Times",
          link: "/prayer-times",
          isVisible: true,
        },
        heroButtonSecondary: {
          text: "Learn More",
          link: "/about",
          isVisible: true,
        },
        showPrayerTimesWidget: true,
        showZakatCalculator: true,
        showHijriCalendar: true,
        showSpecialIslamicDays: true,
        showEventsSection: true,
        featuredEventIds: [],
        eventsTitle: "Upcoming Events",
        eventsSubtitle: "Join us for these special occasions at Masjid AnNoor",
        mainButtons: [
          {
            id: "prayer-times",
            title: "Prayer Schedule",
            description: "View daily prayer times",
            icon: "Clock",
            link: "/prayer-times",
            isVisible: true,
          },
          {
            id: "donations",
            title: "Make A Donation",
            description: "Support our masjid",
            icon: "DollarSign",
            link: "/online-giving",
            isVisible: true,
          },
          {
            id: "sponsor-iftar",
            title: "Sponsor An Iftar",
            description: "Provide meals during Ramadan",
            icon: "Heart",
            link: "/ramadan/sponsor-iftar",
            isVisible: true,
          },
          {
            id: "iftar-times",
            title: "Iftaar Schedule",
            description: "View Ramadan timings",
            icon: "Calendar",
            link: "/ramadan/iftar-times",
            isVisible: true,
          },
        ],
        isActive: true,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching home page settings:", error)
    return NextResponse.json({ error: "Failed to fetch home page settings" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()

    // Find active settings
    let settings = await HomePageSettings.findOne({ isActive: true })

    if (!settings) {
      // Create new settings if none exists
      settings = await HomePageSettings.create({
        ...body,
        isActive: true,
      })
    } else {
      // Update existing settings
      settings = await HomePageSettings.findByIdAndUpdate(settings._id, body, { new: true, runValidators: true })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating home page settings:", error)
    return NextResponse.json({ error: "Failed to update home page settings" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()

    // Find active settings
    let settings = await HomePageSettings.findOne({ isActive: true })

    if (!settings) {
      // Create new settings if none exists
      settings = await HomePageSettings.create({
        ...body,
        isActive: true,
      })
    } else {
      // Update existing settings
      settings = await HomePageSettings.findByIdAndUpdate(settings._id, body, { new: true, runValidators: true })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error creating/updating home page settings:", error)
    return NextResponse.json({ error: "Failed to create/update home page settings" }, { status: 500 })
  }
}

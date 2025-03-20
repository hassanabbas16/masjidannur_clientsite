import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import About from "@/models/about"

export async function GET() {
  try {
    await dbConnect()

    // Find the about page content or create default if it doesn't exist
    let about = await About.findOne()

    if (!about) {
      about = await About.create({
        hero: {
          title: "About Masjid AnNoor",
          subtitle: "Our journey, mission, and commitment to the community",
        },
        sidebar: {
          image: "/placeholder.svg?height=800&width=600",
          visitTitle: "Visit Us",
          visitDescription: "We welcome you to visit Masjid AnNoor and be part of our growing community.",
          address: "1800 S. Albert Pike Ave\nFort Smith, AR 72903",
        },
        journey: {
          title: "Our Journey",
          content: [
            "Sunnie Islamic Center was founded in 1993 with a vision to serve the spiritual, educational, and social needs of the Muslim community. What began in a small commercial unit has grown into a thriving center of worship and community support.",
            "In 2005, the founders acquired 1800 S Albert Pike Ave, which is now known as Masjid Annoor, a beacon of faith and service in our community.",
          ],
        },
        mission: {
          title: "Our Mission",
          content:
            "At Sunnie Islamic Center, we are dedicated to fostering a welcoming and inclusive environment for all. Our mission is to provide a space for prayer, learning, and community engagement, rooted in the teachings of Islam. Through educational programs, humanitarian initiatives, and outreach efforts, we strive to strengthen our community and contribute positively to society.",
        },
        services: {
          title: "Our Services",
          items: [
            {
              title: "Daily & Jumu'ah Prayers",
              description: "A place for spiritual growth and connection.",
            },
            {
              title: "Islamic Education",
              description: "Classes and programs for children and adults.",
            },
            {
              title: "Community Outreach",
              description: "Humanitarian efforts, including aid for those in need.",
            },
            {
              title: "Youth & Family Programs",
              description: "Strengthening faith and values across generations.",
            },
          ],
        },
        join: {
          title: "Join Us",
          content:
            "We welcome you to visit Masjid Annoor and be part of our growing community. Whether you seek a place of worship, learning, or support, Sunnie Islamic Center is here for you.",
        },
      })
    }

    return NextResponse.json(about)
  } catch (error) {
    console.error("Error fetching about page:", error)
    return NextResponse.json({ error: "Failed to fetch about page" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()

    // Find the about page content or create a new one
    let about = await About.findOne()

    if (about) {
      // Update the existing about content
      about = await About.findByIdAndUpdate(about._id, body, { new: true, runValidators: true })
    } else {
      // Create a new about content if it doesn't exist
      about = await About.create(body)
    }

    return NextResponse.json(about)
  } catch (error) {
    console.error("Error updating/creating about page:", error)
    return NextResponse.json({ error: "Failed to update/ create about page" }, { status: 500 })
  }
}
export async function PUT(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()

    // Find the about page content or create a new one
    let about = await About.findOne()

    if (about) {
      about = await About.findByIdAndUpdate(about._id, body, { new: true, runValidators: true })
    } else {
      about = await About.create(body)
    }

    return NextResponse.json(about)
  } catch (error) {
    console.error("Error updating about page:", error)
    return NextResponse.json({ error: "Failed to update about page" }, { status: 500 })
  }
}


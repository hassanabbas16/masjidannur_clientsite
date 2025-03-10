import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import SiteSettings from "@/models/siteSettings"

export async function GET() {
  try {
    await dbConnect()

    // Get active settings or create default if none exists
    let settings = await SiteSettings.findOne({ isActive: true })
    
    if (!settings) {
      // Create default settings
      settings = await SiteSettings.create({
        // Header defaults
        logo: "/placeholder.svg?height=48&width=48",
        siteName: "Masjid AnNoor",
        siteLocation: "Fort Smith, AR",
        headerMenuItems: [
          { id: "home", name: "Home", href: "/", enabled: true, dropdown: false, order: 0 },
          { id: "about", name: "About", href: "/about", enabled: true, dropdown: false, order: 1 },
          { 
            id: "programs", 
            name: "Programs", 
            href: "/programs", 
            enabled: true, 
            dropdown: true, 
            order: 2,
            items: [
              { id: "team-fajr", name: "Team Fajr", href: "/programs/team-fajr", order: 0 },
              { id: "tafsir-classes", name: "Tafsir Classes", href: "/programs/tafsir-classes", order: 1 },
              { id: "islamic-school", name: "Islamic School", href: "/programs/islamic-school", order: 2 },
              { id: "revert-tutoring", name: "Revert Tutoring", href: "/programs/revert-tutoring", order: 3 }
            ]
          },
          { 
            id: "resources", 
            name: "Resources", 
            href: "/resources", 
            enabled: true, 
            dropdown: true, 
            order: 3,
            items: [
              { id: "become-resource", name: "Become A Resource", href: "/resources/become-resource", order: 0 }
            ]
          },
          { id: "prayer-times", name: "Prayer Times", href: "/prayer-times", enabled: true, dropdown: false, order: 4 },
          { id: "online-giving", name: "Online Giving", href: "/online-giving", enabled: true, dropdown: false, order: 5 },
          { 
            id: "ramadan", 
            name: "Ramadan", 
            href: "/ramadan", 
            enabled: true, 
            dropdown: true, 
            order: 6,
            items: [
              { id: "iftar-times", name: "Iftar Times", href: "/ramadan/iftar-times", order: 0 },
              { id: "sponsor-iftar", name: "Sponsor an Iftar", href: "/ramadan/sponsor-iftar", order: 1 }
            ]
          }
        ],
        
        // Footer defaults
        footerLogo: "/placeholder.svg?height=48&width=48",
        footerTagline: "Serving the spiritual, educational, and social needs of the Muslim community since 1993. A beacon of faith and service in our community.",
        socialLinks: [
          { platform: "Facebook", url: "#", icon: "Facebook", enabled: true },
          { platform: "Instagram", url: "#", icon: "Instagram", enabled: true },
          { platform: "Twitter", url: "#", icon: "Twitter", enabled: true }
        ],
        quickLinks: [
          { id: "home", name: "Home", href: "/", enabled: true, order: 0 },
          { id: "about", name: "About", href: "/about", enabled: true, order: 1 },
          { id: "programs", name: "Programs", href: "/programs", enabled: true, order: 2 },
          { id: "events", name: "Events", href: "/event", enabled: true, order: 3 },
          { id: "prayer-times", name: "Prayer Times", href: "/prayer-times", enabled: true, order: 4 },
          { id: "donate", name: "Donate", href: "/online-giving", enabled: true, order: 5 }
        ],
        contactInfo: {
          address: "1800 S. Albert Pike Ave, Fort Smith, AR 72903",
          phone: "479-783-2914",
          email: "sunnie.islamic.center@gmail.com"
        },
        copyrightText: "© {year} Masjid AnNoor. All rights reserved.",
        developerInfo: {
          name: "Emergitech Solutions",
          url: "https://emergitechsolutions.com",
          enabled: true
        },
        isActive: true
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching site settings:", error)
    return NextResponse.json({ error: "Failed to fetch site settings" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()
    
    // Find active settings
    let settings = await SiteSettings.findOne({ isActive: true })
    
    if (!settings) {
      // Create new settings if none exists
      settings = await SiteSettings.create({
        ...body,
        isActive: true
      })
    } else {
      // Update existing settings
      settings = await SiteSettings.findByIdAndUpdate(
        settings._id,
        body,
        { new: true, runValidators: true }
      )
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating site settings:", error)
    return NextResponse.json({ error: "Failed to update site settings" }, { status: 500 })
  }
}

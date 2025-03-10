import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import RamadanResource from "@/models/ramadanResource"

export async function GET(req: Request) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const year = url.searchParams.get("year")
    const category = url.searchParams.get("category")
    const showHidden = url.searchParams.get("showHidden") === "true"

    const query: any = {}

    if (year) {
      query.year = Number.parseInt(year)
    } else {
      // Default to current year
      query.year = new Date().getFullYear()
    }

    if (category) {
      query.category = category
    }

    if (!showHidden) {
      query.isVisible = true
    }

    const resources = await RamadanResource.find(query).sort({ order: 1, title: 1 })

    return NextResponse.json(resources)
  } catch (error) {
    console.error("Error fetching Ramadan resources:", error)
    return NextResponse.json({ error: "Failed to fetch Ramadan resources" }, { status: 500 })
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

    const resource = await RamadanResource.create(body)

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error("Error creating Ramadan resource:", error)
    return NextResponse.json({ error: "Failed to create Ramadan resource" }, { status: 500 })
  }
}


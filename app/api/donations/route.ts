import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Donation from "@/models/donation"

export async function GET(req: Request) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const donationType = url.searchParams.get("donationType")
    const status = url.searchParams.get("status")
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    const query: any = {}

    if (donationType) query.donationType = donationType
    if (status) query.status = status

    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    const donations = await Donation.find(query).populate("donationType", "name").sort({ createdAt: -1 })

    return NextResponse.json(donations)
  } catch (error) {
    console.error("Error fetching donations:", error)
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()
    const donation = await Donation.create(body)

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error("Error creating donation:", error)
    return NextResponse.json({ error: "Failed to create donation" }, { status: 500 })
  }
}


import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import DonationType from "@/models/donationType"

export async function GET() {
  try {
    await dbConnect()

    const donationTypes = await DonationType.find({ isActive: true }).sort({ name: 1 })

    return NextResponse.json(donationTypes)
  } catch (error) {
    console.error("Error fetching donation types:", error)
    return NextResponse.json({ error: "Failed to fetch donation types" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()
    const donationType = await DonationType.create(body)

    return NextResponse.json(donationType, { status: 201 })
  } catch (error) {
    console.error("Error creating donation type:", error)
    return NextResponse.json({ error: "Failed to create donation type" }, { status: 500 })
  }
}


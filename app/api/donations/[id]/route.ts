import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Donation from "@/models/donation"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const donation = await Donation.findById(params.id).populate("donationType", "name")

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    return NextResponse.json(donation)
  } catch (error) {
    console.error("Error fetching donation:", error)
    return NextResponse.json({ error: "Failed to fetch donation" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await req.json()
    const donation = await Donation.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    return NextResponse.json(donation)
  } catch (error) {
    console.error("Error updating donation:", error)
    return NextResponse.json({ error: "Failed to update donation" }, { status: 500 })
  }
}


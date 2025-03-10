import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import DonationType from "@/models/donationType"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const donationType = await DonationType.findById(params.id)

    if (!donationType) {
      return NextResponse.json({ error: "Donation type not found" }, { status: 404 })
    }

    return NextResponse.json(donationType)
  } catch (error) {
    console.error("Error fetching donation type:", error)
    return NextResponse.json({ error: "Failed to fetch donation type" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await req.json()
    const donationType = await DonationType.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })

    if (!donationType) {
      return NextResponse.json({ error: "Donation type not found" }, { status: 404 })
    }

    return NextResponse.json(donationType)
  } catch (error) {
    console.error("Error updating donation type:", error)
    return NextResponse.json({ error: "Failed to update donation type" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const donationType = await DonationType.findByIdAndDelete(params.id)

    if (!donationType) {
      return NextResponse.json({ error: "Donation type not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Donation type deleted successfully" })
  } catch (error) {
    console.error("Error deleting donation type:", error)
    return NextResponse.json({ error: "Failed to delete donation type" }, { status: 500 })
  }
}


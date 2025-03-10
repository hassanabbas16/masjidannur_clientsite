import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import RamadanSettings from "@/models/ramadanSettings"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const settings = await RamadanSettings.findById(params.id)

    if (!settings) {
      return NextResponse.json({ error: "Ramadan settings not found" }, { status: 404 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching Ramadan settings:", error)
    return NextResponse.json({ error: "Failed to fetch Ramadan settings" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await req.json()

    // If this is set as active, deactivate all other settings
    if (body.isActive) {
      await RamadanSettings.updateMany({ _id: { $ne: params.id }, isActive: true }, { $set: { isActive: false } })
    }

    const settings = await RamadanSettings.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })

    if (!settings) {
      return NextResponse.json({ error: "Ramadan settings not found" }, { status: 404 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating Ramadan settings:", error)
    return NextResponse.json({ error: "Failed to update Ramadan settings" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const settings = await RamadanSettings.findByIdAndDelete(params.id)

    if (!settings) {
      return NextResponse.json({ error: "Ramadan settings not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Ramadan settings deleted successfully" })
  } catch (error) {
    console.error("Error deleting Ramadan settings:", error)
    return NextResponse.json({ error: "Failed to delete Ramadan settings" }, { status: 500 })
  }
}


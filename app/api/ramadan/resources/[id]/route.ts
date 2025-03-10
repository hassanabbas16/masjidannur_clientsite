import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import RamadanResource from "@/models/ramadanResource"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const resource = await RamadanResource.findById(params.id)

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    return NextResponse.json(resource)
  } catch (error) {
    console.error("Error fetching Ramadan resource:", error)
    return NextResponse.json({ error: "Failed to fetch Ramadan resource" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await req.json()
    const resource = await RamadanResource.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    return NextResponse.json(resource)
  } catch (error) {
    console.error("Error updating Ramadan resource:", error)
    return NextResponse.json({ error: "Failed to update Ramadan resource" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const resource = await RamadanResource.findByIdAndDelete(params.id)

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Resource deleted successfully" })
  } catch (error) {
    console.error("Error deleting Ramadan resource:", error)
    return NextResponse.json({ error: "Failed to delete Ramadan resource" }, { status: 500 })
  }
}


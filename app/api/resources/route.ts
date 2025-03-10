import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Resource from "@/models/resource"

export async function GET(req: Request) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const showUnapproved = url.searchParams.get("showUnapproved") === "true"

    const query = showUnapproved ? {} : { isApproved: true }
    const resources = await Resource.find(query).sort({ createdAt: -1 })

    return NextResponse.json(resources)
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()
    const resource = await Resource.create(body)

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error("Error creating resource:", error)
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 })
  }
}


import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadsDir = path.join(process.cwd(), "public/uploads")

    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      console.error("Error creating uploads directory:", error)
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const filename = `${file.name.split('.')[0]}-${uniqueSuffix}.${file.name.split('.').pop()}`
    const filePath = path.join(uploadsDir, filename)
    
    await writeFile(filePath, buffer)

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    )
  }
} 
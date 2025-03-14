import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return new NextResponse('URL is required', { status: 400 })
  }

  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch file')
    }

    const contentType = response.headers.get('content-type')
    const blob = await response.blob()

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType || 'application/pdf',
        'Content-Disposition': `attachment; filename="${url.split('/').pop() || 'download.pdf'}"`,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return new NextResponse('Failed to download file', { status: 500 })
  }
} 
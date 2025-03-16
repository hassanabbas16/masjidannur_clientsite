"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AboutForm from "@/components/admin/about-form"
import { ChevronLeft } from "lucide-react"

interface AboutData {
  _id: string
  hero: {
    title: string
    subtitle: string
  }
  sidebar: {
    image: string
    visitTitle: string
    visitDescription: string
    address: string
  }
  journey: {
    title: string
    content: string[]
  }
  mission: {
    title: string
    content: string
  }
  services: {
    title: string
    items: Array<{
      title: string
      description: string
    }>
  }
  join: {
    title: string
    content: string
  }
}

export default function AdminAboutPage() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch("/api/about")
        if (response.ok) {
          const data = await response.json()
          setAboutData(data)
        } else {
          console.error("Failed to fetch about page data")
        }
      } catch (error) {
        console.error("Error fetching about page data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAboutData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!aboutData) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-800">Failed to load About page data</h1>
        <p className="mt-4 text-gray-600">Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Back Button Section */}
      <div className="flex items-center gap-4 flex-col sm:flex-row sm:items-center sm:gap-6">
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">About Page Management</h1>
        <Button 
          variant="secondary"
          className="text-foreground w-full sm:w-auto"
          onClick={() => router.push("/about")}
        >
          View About Page
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit About Page Content</CardTitle>
        </CardHeader>
        <CardContent>
          <AboutForm initialData={aboutData} />
        </CardContent>
      </Card>
    </div>
  )
}

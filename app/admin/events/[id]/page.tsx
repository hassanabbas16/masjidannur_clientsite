"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import EventForm from "@/components/admin/event-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

// Add Event type
interface Event {
  _id: string
  title: string
  description: string
  date: string
  endDate: string
  location: string
  category: string[]
  organizer: string
  contactEmail: string
  image: string
  isVisible: boolean
  additionalDetails: string
}

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter() // Hook to navigate
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setEvent(data)
        } else {
          console.error("Failed to fetch event")
        }
      } catch (error) {
        console.error("Error fetching event:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchEvent()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-800">Event Not Found</h1>
        <p className="mt-4 text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Event</h1>
      </div>
      <EventForm initialData={event} isEditing />
    </div>
  )
}

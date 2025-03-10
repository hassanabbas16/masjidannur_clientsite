"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import RamadanEventForm from "@/components/admin/ramadan-event-form"

export default function EditRamadanEventPage() {
  const params = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/ramadan/events/${params.id}`)
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
      <h1 className="text-3xl font-bold">Edit Ramadan Event</h1>
      <RamadanEventForm initialData={event} isEditing />
    </div>
  )
}


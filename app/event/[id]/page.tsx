"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, MapPin, ArrowLeft } from "lucide-react"

interface Event {
  _id: string
  title: string
  description: string
  date: string
  endDate: string
  location: string
  image: string
  category: string
  organizer: string
  contactEmail: string
  additionalDetails: string
}

export default function EventPage() {
  const params = useParams()
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
      <div className="container px-4 md:px-6 py-12">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 md:h-96 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container px-4 md:px-6 py-12">
        <Link href="/event" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Link>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-800">Event Not Found</h1>
          <p className="mt-4 text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="mt-6">
            <Link href="/event">View All Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 md:px-6 py-12">
      <Link href="/event" className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Link>

      <Card className="overflow-hidden border-0 shadow-elegant">
        <CardContent className="p-0">
          <div className="relative h-64 md:h-96">
            <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge className="mb-2">{event.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">{event.title}</h1>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4 text-primary" />
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-primary" />
                {new Date(event.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} -
                {new Date(event.endDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-primary" />
                {event.location}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-heading font-bold mb-2">About This Event</h2>
              <p className="text-muted-foreground">{event.description}</p>
            </div>

            {event.additionalDetails && (
              <div>
                <h2 className="text-2xl font-heading font-bold mb-2">Additional Information</h2>
                <p className="text-muted-foreground">{event.additionalDetails}</p>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-heading font-bold mb-2">Organizer</h2>
              <p className="text-muted-foreground">{event.organizer}</p>
              <p className="text-muted-foreground">Contact: {event.contactEmail}</p>
            </div>

            {/* <Button className="w-full md:w-auto">Register for This Event</Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


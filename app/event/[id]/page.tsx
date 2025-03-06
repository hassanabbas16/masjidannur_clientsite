"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, MapPin, ArrowLeft } from 'lucide-react'

interface Event {
  id: number
  title: string
  description: string
  date: Date
  endDate: Date
  location: string
  image: string
  category: string
  organizer: string
  contactEmail: string
  additionalDetails: string
}

// This would come from a CMS or API in a real implementation
const events: Event[] = [
  {
    id: 1,
    title: "Ramadan Night Prayers",
    description: "Join us for special night prayers during the blessed month of Ramadan. Experience the spiritual atmosphere of Qiyam al-Layl and strengthen your connection with Allah during this blessed time.",
    date: new Date("2024-03-15T20:00:00"),
    endDate: new Date("2024-03-15T22:00:00"),
    location: "Main Prayer Hall",
    image: "/placeholder.svg?height=400&width=600",
    category: "Worship",
    organizer: "Imam Abdullah",
    contactEmail: "imam@masjidannoor.com",
    additionalDetails: "Please bring your own prayer mat and Quran. Water will be provided.",
  },
  {
    id: 2,
    title: "Community Iftar",
    description: "Break your fast with the community. All are welcome to join this blessed gathering. Enjoy a delicious meal and strengthen bonds with your fellow Muslims.",
    date: new Date("2024-03-20T18:30:00"),
    endDate: new Date("2024-03-20T20:30:00"),
    location: "Masjid Courtyard",
    image: "/placeholder.svg?height=400&width=600",
    category: "Community",
    organizer: "Sisters' Committee",
    contactEmail: "sisters@masjidannoor.com",
    additionalDetails: "Vegetarian and non-vegetarian options will be available. Please bring your own water bottle to reduce waste.",
  },
  {
    id: 3,
    title: "Islamic Finance Workshop",
    description: "Learn about Islamic principles of finance and investment. This workshop will cover topics such as halal investments, avoiding riba, and managing wealth in accordance with Islamic teachings.",
    date: new Date("2024-04-05T14:00:00"),
    endDate: new Date("2024-04-05T16:00:00"),
    location: "Education Center",
    image: "/placeholder.svg?height=400&width=600",
    category: "Education",
    organizer: "Br. Yusuf, Islamic Finance Expert",
    contactEmail: "education@masjidannoor.com",
    additionalDetails: "Handouts will be provided. Please bring a notebook and pen for taking notes.",
  },
  {
    id: 4,
    title: "Youth Quran Competition",
    description: "Annual Quran recitation and memorization competition for youth. Encourage and celebrate the efforts of our young Muslims in learning and preserving the Holy Quran.",
    date: new Date("2024-04-15T10:00:00"),
    endDate: new Date("2024-04-15T13:00:00"),
    location: "Main Prayer Hall",
    image: "/placeholder.svg?height=400&width=600",
    category: "Youth",
    organizer: "Youth Committee",
    contactEmail: "youth@masjidannoor.com",
    additionalDetails: "Participants must register in advance. Prizes will be awarded in various categories.",
  },
]

export default function EventPage() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)

  useEffect(() => {
    // In a real implementation, this would be an API call
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : -1
    const fetchedEvent = events.find(e => e.id === id)
    setEvent(fetchedEvent || null)
  }, [params.id])

  if (!event) {
    return <div>Loading...</div>
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
            <Image
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge className="mb-2">{event.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                {event.title}
              </h1>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4 text-primary" />
                {event.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-primary" />
                {event.date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} - 
                {event.endDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
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

            <div>
              <h2 className="text-2xl font-heading font-bold mb-2">Additional Information</h2>
              <p className="text-muted-foreground">{event.additionalDetails}</p>
            </div>

            <div>
              <h2 className="text-2xl font-heading font-bold mb-2">Organizer</h2>
              <p className="text-muted-foreground">{event.organizer}</p>
              <p className="text-muted-foreground">Contact: {event.contactEmail}</p>
            </div>

            <Button className="w-full md:w-auto">Register for This Event</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

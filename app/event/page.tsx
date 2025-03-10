"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EventCalendar } from "@/components/event-calendar"

interface Event {
  _id: string
  title: string
  description: string
  date: string
  endDate: string
  location: string
  image: string
  category: string[]
  organizer: string
  contactEmail: string
  additionalDetails: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events")
        if (response.ok) {
          const data = await response.json()
          setEvents(data)
        } else {
          console.error("Failed to fetch events")
        }
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const upcomingEvents = events
    .filter((event) => new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  const featuredEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-[#0D7A3B] text-white overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-5"></div>
          <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">Upcoming Events</h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              Join us for a variety of spiritual, educational, and community events
            </p>
          </div>
        </section>

        <div className="container px-4 md:px-6 py-12 md:py-24">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-elegant">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#0D7A3B] text-white overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="container relative py-12 md:py-20 lg:py-28 flex flex-col items-center text-center">
          <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-4 md:mb-6 px-4">
            Upcoming Events
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-2xl px-4">
            Join us for a variety of spiritual, educational, and community events
          </p>
        </div>
      </section>

      <section className="container px-4 md:px-6 py-8 md:py-12 lg:py-16">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-3">
          {/* Events List */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Featured Event */}
            {featuredEvent && (
              <Card className="overflow-hidden border-0 shadow-elegant">
                <CardContent className="p-0">
                  <div className="relative aspect-video md:aspect-[3/1]">
                    <Image
                      src={featuredEvent.image || "/placeholder.svg"}
                      alt={featuredEvent.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {featuredEvent.category.map((cat) => (
                          <Badge key={cat}>{cat}</Badge>
                        ))}
                      </div>
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-white mb-2">
                        {featuredEvent.title}
                      </h2>
                      <p className="text-white/90 mb-4 line-clamp-2 text-sm md:text-base">
                        {featuredEvent.description}
                      </p>
                      <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-white/80">
                        {/* ... keep date/time elements ... */}
                      </div>
                      <Link href={`/event/${featuredEvent._id}`}>
                        <Button className="mt-4 text-sm md:text-base">Learn More</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Other Upcoming Events */}
            <div className="space-y-6 md:space-y-8">
              <h2 className="text-2xl md:text-3xl font-heading font-bold gradient-heading px-2">
                More Upcoming Events
              </h2>
              {upcomingEvents.slice(1, 4).map((event) => (
                <Card key={event._id} className="overflow-hidden border-0 shadow-elegant">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative aspect-square md:aspect-[4/3] md:w-1/3">
                        <Image
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge>{event.category[0]}</Badge>
                        </div>
                      </div>
                      <div className="p-4 md:p-6 md:w-2/3 space-y-2 md:space-y-3">
                        <h3 className="text-lg md:text-xl font-heading font-bold">
                          {event.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2 text-sm md:text-base">
                          {event.description}
                        </p>
                        <div className="flex flex-col gap-2 text-xs md:text-sm text-muted-foreground">
                          {/* ... keep date/time elements ... */}
                        </div>
                        <Link href={`/event/${event._id}`}>
                          <Button className="mt-2 text-sm md:text-base">Learn More</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 md:space-y-8">
            {/* Calendar */}
            <Card className="border-0 shadow-elegant overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Event Calendar</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-4">
                <EventCalendar events={events} />
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="border-0 shadow-elegant overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Event Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-wrap gap-2">
                {Array.from(new Set(events.flatMap(event => event.category))).map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs md:text-sm">
                    {category}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="border-0 shadow-elegant overflow-hidden bg-secondary">
              <CardContent className="p-4 md:p-6 space-y-2">
                <h3 className="text-lg md:text-xl font-heading font-bold">Host an Event</h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  Interested in organizing an event?
                </p>
                <Button asChild className="w-full text-sm md:text-base">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Events */}
        <div className="mt-12 md:mt-16">
          <h2 className="text-2xl font-heading font-bold mb-6 px-2">All Events</h2>
          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link href={`/event/${event._id}`} key={event._id}>
                <Card className="overflow-hidden border-0 shadow-elegant transition-all hover:shadow-md h-full">
                  <CardContent className="p-0">
                    <div className="relative aspect-video">
                      <Image 
                        src={event.image || "/placeholder.svg"} 
                        alt={event.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {event.category.slice(0, 2).map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs md:text-sm">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="text-base md:text-lg font-heading font-bold line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-3 text-sm md:text-base">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs md:text-sm text-muted-foreground pt-2">
                        {/* ... keep date/time elements ... */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

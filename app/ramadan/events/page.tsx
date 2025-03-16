"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, MapPin, Users, Search, ArrowLeft, Filter } from "lucide-react"
import moment from "moment"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface RamadanEvent {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  eventType: string
  speaker?: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<RamadanEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<RamadanEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("date-asc")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const eventsPerPage = 9

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/ramadan/events")
        const data = await response.json()
        setEvents(data)
        setFilteredEvents(data)
      } catch (error) {
        console.error("Error fetching Ramadan events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  useEffect(() => {
    // Filter events based on active tab and search query
    let filtered = events

    // Filter by event type
    if (activeTab !== "all") {
      filtered = filtered.filter((event) => event.eventType === activeTab)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          (event.speaker && event.speaker.toLowerCase().includes(query)),
      )
    }

    // Sort events
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "title-asc":
          return a.title.localeCompare(b.title)
        case "title-desc":
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })

    setFilteredEvents(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [activeTab, searchQuery, sortBy, events])

  // Get current events for pagination
  const indexOfLastEvent = currentPage * eventsPerPage
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent)
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)

  if (loading) {
    return (
      <div className="container px-4 md:px-6 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="relative bg-[#0D7A3B] text-white overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="container relative py-16 md:py-20 flex flex-col items-center text-center">
          <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl max-w-4xl mb-4">Ramadan Events</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Browse all upcoming events during the blessed month
          </p>
        </div>
      </section>

      <div className="container px-4 md:px-6 py-8 md:py-12">
        {/* Back button */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="pl-0">
            <Link href="/ramadan">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Ramadan Page
            </Link>
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Date (Earliest first)</SelectItem>
              <SelectItem value="date-desc">Date (Latest first)</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
            </span>
          </div>
        </div>

        {/* Events Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="lecture">Lectures</TabsTrigger>
            <TabsTrigger value="taraweeh">Taraweeh</TabsTrigger>
            <TabsTrigger value="iftar">Iftar</TabsTrigger>
            <TabsTrigger value="qiyam">Qiyam</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {currentEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No events found. Try adjusting your filters or search query.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentEvents.map((event) => (
                  <Card key={event._id} className="border-0 shadow-elegant overflow-hidden h-full">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{event.title}</CardTitle>
                        <Badge variant="outline" className="capitalize">
                          {event.eventType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-muted-foreground">{event.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-primary" />
                          <span>{moment(event.date).format("MMMM D, YYYY")}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-primary" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-primary" />
                          <span>{event.location}</span>
                        </div>
                        {event.speaker && (
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-primary" />
                            <span>{event.speaker}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, and pages around current page
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink isActive={page === currentPage} onClick={() => setCurrentPage(page)}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }

                // Show ellipsis for gaps
                if (page === 2 && currentPage > 3) {
                  return (
                    <PaginationItem key="ellipsis-start">
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }

                if (page === totalPages - 1 && currentPage < totalPages - 2) {
                  return (
                    <PaginationItem key="ellipsis-end">
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }

                return null
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}


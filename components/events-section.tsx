"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Event } from "@/types"
import Link from "next/link"

export function EventsSection({ events }: { events: Event[] }) {
  const [currentPage, setCurrentPage] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  const visibleEvents = events.filter(event => event.isVisible)
  const eventsPerPage = 2 // Show 2 events at a time
  const totalPages = Math.ceil(visibleEvents.length / eventsPerPage)

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  useEffect(() => {
    resetTimeout()
    timeoutRef.current = setTimeout(() => {
      setCurrentPage((prevPage) => (prevPage + 1) % totalPages)
    }, 5000) // Auto scroll every 5 seconds

    return () => {
      resetTimeout()
    }
  }, [currentPage, totalPages])

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  if (visibleEvents.length === 0) return null

  return (
    <div className="relative px-12">
      {totalPages > 1 && (
        <>
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-white shadow-md hover:bg-gray-100"
              onClick={prevPage}
            >
              <ChevronLeft className="h-6 w-6 text-primary" />
            </Button>
          </div>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-white shadow-md hover:bg-gray-100"
              onClick={nextPage}
            >
              <ChevronRight className="h-6 w-6 text-primary" />
            </Button>
          </div>
        </>
      )}
      
      <div ref={containerRef} className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div key={pageIndex} className="w-full flex-shrink-0">
              <div className="flex gap-6">
                {visibleEvents
                  .slice(pageIndex * eventsPerPage, (pageIndex + 1) * eventsPerPage)
                  .map((event) => (
                    <Card 
                      key={event._id} 
                      className="flex-1 overflow-hidden border-0 shadow-elegant"
                    >
                      <CardContent className="p-0">
                        <div className="relative">
                          <Image
                            src={event.image || "/placeholder.jpg"}
                            alt={event.title}
                            width={800}
                            height={400}
                            className="w-full h-[400px] object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                            <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-medium rounded-full mb-3">
                              Upcoming
                            </span>
                            <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
                              {event.title}
                            </h3>
                            <p className="text-white/90 mb-4 max-w-2xl">
                              {event.description}
                            </p>
                            <Link href={`/event/${event._id}`} passHref>
                              <Button className="bg-white text-primary hover:bg-white/90">
                                Learn More
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                currentPage === index ? "bg-primary" : "bg-muted"
              }`}
              onClick={() => setCurrentPage(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
} 
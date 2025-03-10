"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Event {
  _id: string
  title: string
  date: string
  category: string[]
}

interface EventCalendarProps {
  events: Event[]
}

export function EventCalendar({ events }: EventCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const eventDates = events.reduce(
    (acc, event) => {
      const date = new Date(event.date).toDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(event)
      return acc
    },
    {} as Record<string, Event[]>
  )

  const selectedDateEvents = selectedDate ? eventDates[selectedDate.toDateString()] || [] : []

  return (
    <Card className="shadow-elegant">
      <CardContent className="p-4 w-full max-w-full">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-lg border p-2 shadow-sm w-full"
          modifiers={{
            event: (date) => eventDates[date.toDateString()] !== undefined,
          }}
          modifiersStyles={{
            event: {
              backgroundColor: "hsl(var(--primary) / 0.1)",
              color: "hsl(var(--primary))",
              fontWeight: "bold",
            },
          }}
          components={{
            DayContent: ({ date }: { date: Date }) => {
              const dateEvents = eventDates[date.toDateString()]
              return (
                <div
                  className="relative flex items-center justify-center text-center text-lg"
                >
                  {date.getDate()} {/* Rendering the day number directly */}
                  {dateEvents && (
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </div>
              )
            },
          }}
        />

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            {selectedDate?.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>

          {selectedDateEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No events scheduled</p>
          ) : (
            <ul className="space-y-3">
              {selectedDateEvents.map((event) => (
                <li
                  key={event._id}
                  className="group p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm font-medium">{event.title}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {event.category.map((cat) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className="text-xs font-medium px-2 py-0.5 border-primary/20"
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <Clock className="inline-block h-3 w-3 mr-1" />
                    {new Date(event.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

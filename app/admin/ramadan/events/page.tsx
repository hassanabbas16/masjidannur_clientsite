"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Edit, Plus, Search, Trash2, Calendar, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import moment from "moment"

interface RamadanEvent {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  isRecurring: boolean
  recurringDays: string[]
  eventType: string
  speaker?: string
  isVisible: boolean
  year: number
}

export default function RamadanEventsPage() {
  const [events, setEvents] = useState<RamadanEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/ramadan/events?showHidden=true")
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setEventToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!eventToDelete) return

    try {
      const response = await fetch(`/api/ramadan/events/${eventToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setEvents(events.filter((event) => event._id !== eventToDelete))
      } else {
        console.error("Failed to delete event")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
    } finally {
      setDeleteDialogOpen(false)
      setEventToDelete(null)
    }
  }

  const handleVisibilityToggle = async (id: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/ramadan/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVisible: !currentVisibility }),
      })

      if (response.ok) {
        setEvents(events.map((event) => (event._id === id ? { ...event, isVisible: !currentVisibility } : event)))
      } else {
        console.error("Failed to update event visibility")
      }
    } catch (error) {
      console.error("Error updating event visibility:", error)
    }
  }

  const filteredEvents = events
    .filter((event) => {
      // Filter by search term
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.speaker && event.speaker.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filter by event type
      const matchesType = filterType === "all" || event.eventType === filterType

      return matchesSearch && matchesType
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "lecture":
        return <Badge className="bg-blue-500">Lecture</Badge>
      case "taraweeh":
        return <Badge className="bg-purple-500">Taraweeh</Badge>
      case "iftar":
        return <Badge className="bg-amber-500">Iftar</Badge>
      case "qiyam":
        return <Badge className="bg-indigo-500">Qiyam</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
      </Button>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Ramadan Events</h1>
        <Button asChild>
          <Link href="/admin/ramadan/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Ramadan Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lecture">Lectures</SelectItem>
                <SelectItem value="taraweeh">Taraweeh</SelectItem>
                <SelectItem value="iftar">Iftar</SelectItem>
                <SelectItem value="qiyam">Qiyam</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No events found. Create your first Ramadan event!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Visible</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event._id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{getEventTypeBadge(event.eventType)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                            <span>{moment(event.date).format("MMM D, YYYY")}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                            <span>{event.time}</span>
                          </div>
                          {event.isRecurring && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded mt-1 inline-block">
                              Recurring
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>
                        <Switch
                          checked={event.isVisible}
                          onCheckedChange={() => handleVisibilityToggle(event._id, event.isVisible)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/admin/ramadan/events/${event._id}`)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteClick(event._id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Moon, Sun, Calendar, BookOpen, Users } from "lucide-react"
import moment from "moment"

interface PrayerTimes {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Sunset: string
  Maghrib: string
  Isha: string
  Imsak: string
  Midnight: string
}

interface NextPrayer {
  name: string
  time: string
  timeRemaining: string
}

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

interface RamadanResource {
  _id: string
  title: string
  description: string
  resourceType: string
  url: string
  category: string
}

export default function RamadanPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null)
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null)
  const [isRamadan, setIsRamadan] = useState(false)
  const [ramadanDay, setRamadanDay] = useState(0)
  const [events, setEvents] = useState<RamadanEvent[]>([])
  const [resources, setResources] = useState<RamadanResource[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const response = await fetch(`/api/ramadan/prayer-times?date=${moment().format("DD-MM-YYYY")}`)
        const data = await response.json()

        setPrayerTimes(data.prayerTimes)
        setNextPrayer(data.nextPrayer)
        setIsRamadan(data.isRamadan)
        setRamadanDay(data.ramadanDay)
      } catch (error) {
        console.error("Error fetching prayer times:", error)
      }
    }

    fetchPrayerTimes()
  }, [currentDate])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/ramadan/events")
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error("Error fetching Ramadan events:", error)
      }
    }

    const fetchResources = async () => {
      try {
        const response = await fetch("/api/ramadan/resources")
        const data = await response.json()
        setResources(data)
      } catch (error) {
        console.error("Error fetching Ramadan resources:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
    fetchResources()
  }, [])

  const filteredEvents = activeTab === "all" ? events : events.filter((event) => event.eventType === activeTab)

  if (loading) {
    return (
      <div className="container px-4 md:px-6 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#0D7A3B] text-white overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">
            Ramadan {currentDate.getFullYear()}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Join us for a blessed month of fasting, prayer, and community
          </p>
        </div>
      </section>

      <div className="container px-4 md:px-6 py-12">
        {/* Ramadan Status Card */}
        <Card className="mb-8 border-0 shadow-elegant overflow-hidden">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-xl font-medium text-muted-foreground">Today's Date</h2>
                <p className="text-2xl font-bold">{moment().format("MMMM D, YYYY")}</p>
                <p className="text-lg">{moment().format("dddd")}</p>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-medium text-muted-foreground">Ramadan Status</h2>
                {isRamadan ? (
                  <>
                    <p className="text-3xl font-bold text-primary">Day {ramadanDay}</p>
                    <p className="text-lg">of Ramadan {moment().format("iYYYY")}</p>
                  </>
                ) : (
                  <p className="text-2xl font-bold">Preparing for Ramadan</p>
                )}
              </div>

              <div className="text-center md:text-right">
                <h2 className="text-xl font-medium text-muted-foreground">Next Prayer</h2>
                {nextPrayer && (
                  <>
                    <p className="text-2xl font-bold">
                      {nextPrayer.name} - {nextPrayer.time}
                    </p>
                    <p className="text-lg">In {nextPrayer.timeRemaining}</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prayer Times Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-elegant overflow-hidden">
            <CardHeader className="bg-primary/10">
              <CardTitle className="flex items-center">
                <Sun className="mr-2 text-primary" /> Suhoor Time
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-3xl font-bold">{prayerTimes?.Imsak || "Loading..."}</p>
              <p className="text-muted-foreground">Start your fast with blessings</p>
              <div className="mt-4 text-sm">
                <p>
                  <span className="font-medium">Fajr Prayer:</span> {prayerTimes?.Fajr || "Loading..."}
                </p>
                <p>
                  <span className="font-medium">Sunrise:</span> {prayerTimes?.Sunrise || "Loading..."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant overflow-hidden">
            <CardHeader className="bg-primary/10">
              <CardTitle className="flex items-center">
                <Moon className="mr-2 text-primary" /> Iftar Time
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-3xl font-bold">{prayerTimes?.Maghrib || "Loading..."}</p>
              <p className="text-muted-foreground">Break your fast and join us for Maghrib prayer</p>
              <div className="mt-4 text-sm">
                <p>
                  <span className="font-medium">Sunset:</span> {prayerTimes?.Sunset || "Loading..."}
                </p>
                <p>
                  <span className="font-medium">Isha Prayer:</span> {prayerTimes?.Isha || "Loading..."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ramadan Events Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-3xl font-heading font-bold gradient-heading">Ramadan Events</h2>
            <Link href="/ramadan/events">
              <Button variant="outline">View All Events</Button>
            </Link>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="lecture">Lectures</TabsTrigger>
              <TabsTrigger value="taraweeh">Taraweeh</TabsTrigger>
              <TabsTrigger value="iftar">Iftar</TabsTrigger>
              <TabsTrigger value="qiyam">Qiyam</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No events found for this category.</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.slice(0, 6).map((event) => (
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
        </div>

        {/* Quick Links Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-elegant overflow-hidden h-full">
            <CardHeader>
              <CardTitle>Sponsor an Iftar</CardTitle>
              <CardDescription>Contribute to our community iftars and earn great rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                The Prophet Muhammad (peace be upon him) said: "Whoever provides iftar for a fasting person will have a
                reward like his, without decreasing from the reward of the fasting person in any way." Join us in this
                blessed opportunity.
              </p>
              <Button asChild className="w-full">
                <Link href="/ramadan/sponsor-iftar">Sponsor Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant overflow-hidden h-full">
            <CardHeader>
              <CardTitle>Ramadan Resources</CardTitle>
              <CardDescription>Helpful materials for your spiritual journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {resources.slice(0, 4).map((resource) => (
                  <div key={resource._id} className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">{resource.title}</p>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" asChild className="w-full">
                <Link href="/ramadan/resources">View All Resources</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Ramadan Schedule Link */}
        <Card className="border-0 shadow-elegant overflow-hidden mb-12">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Ramadan Prayer Schedule</h3>
                <p className="text-muted-foreground">
                  View the complete schedule for Sehri, Iftar, and prayer times throughout Ramadan
                </p>
              </div>
              <Button asChild>
                <Link href="/ramadan/iftar-times">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Full Schedule
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


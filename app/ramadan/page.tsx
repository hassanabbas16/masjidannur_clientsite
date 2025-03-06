"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Moon, Sun } from "lucide-react"

// This would come from an API or database in a real implementation
const ramadanInfo = {
  startDate: new Date("2024-03-11"),
  endDate: new Date("2024-04-09"),
}

const ramadanEvents = [
  {
    id: 1,
    title: "Taraweeh Prayers",
    description: "Join us for nightly Taraweeh prayers led by our hafiz.",
    time: "9:00 PM",
    location: "Main Prayer Hall",
  },
  {
    id: 2,
    title: "Iftar Gatherings",
    description: "Break your fast with the community. All are welcome.",
    time: "Maghrib prayer time",
    location: "Masjid Courtyard",
  },
  {
    id: 3,
    title: "Ramadan Lectures Series",
    description: "Daily lectures on various Islamic topics throughout Ramadan.",
    time: "After Asr prayer",
    location: "Main Prayer Hall",
  },
]

export default function RamadanPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [ramadanDay, setRamadanDay] = useState(0)
  const [nextPrayerTime, setNextPrayerTime] = useState("")

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const start = ramadanInfo.startDate.getTime()
    const now = currentDate.getTime()
    const day = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1
    setRamadanDay(day > 0 && day <= 30 ? day : 0)
  }, [currentDate])

  // This would be replaced with actual prayer time calculations
  useEffect(() => {
    setNextPrayerTime("7:30 PM") // Example time
  }, [currentDate])

  return (
    <div className="container px-4 md:px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-6">Ramadan at Masjid AnNoor</h1>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">Ramadan {new Date().getFullYear()}</h2>
              <p className="text-muted-foreground">
                {ramadanInfo.startDate.toLocaleDateString()} - {ramadanInfo.endDate.toLocaleDateString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Current Date: {currentDate.toLocaleDateString()}</p>
              {ramadanDay > 0 ? (
                <p className="text-xl font-bold">Day {ramadanDay} of Ramadan</p>
              ) : (
                <p className="text-xl font-bold">Preparing for Ramadan</p>
              )}
            </div>
            <div className="text-center mt-4 md:mt-0">
              <p className="text-lg">Next Prayer:</p>
              <p className="text-xl font-bold">{nextPrayerTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sun className="mr-2" /> Suhoor Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">4:30 AM</p>
            <p className="text-muted-foreground">Start your fast with blessings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Moon className="mr-2" /> Iftar Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">7:45 PM</p>
            <p className="text-muted-foreground">Break your fast and join us for Maghrib prayer</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-3xl font-bold mb-6">Ramadan Events</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {ramadanEvents.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{event.description}</p>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Clock className="mr-2 h-4 w-4" />
                {event.time}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                {event.location}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Sponsor an Iftar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Contribute to our community iftars and earn great rewards.</p>
            <Button asChild>
              <Link href="/ramadan/sponsor-iftar">Sponsor Now</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ramadan Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Ramadan Prayer Timetable</li>
              <li>Fasting Guidelines</li>
              <li>Recommended Duas</li>
              <li>Charity Opportunities</li>
            </ul>
            <Button variant="outline">Download Resources</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


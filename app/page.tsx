"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Calendar, Heart, DollarSign, ArrowRight } from "lucide-react"
import PrayerTimesWidget from "@/components/prayer-times-widget"
import ZakatCalculator from "@/components/zakat-calculator-widget"
import GregorianHijriCalendar from "@/components/GregorianHijriCalendar"
import SpecialIslamicDays from "@/components/special-islamic-days"
import '../styles/home.css'
import { EventsSection } from "@/components/events-section"
import { Event } from "@/types"

interface HomePageSettings {
  heroTitle: string
  heroSubtitle: string
  heroButtonPrimary: {
    text: string
    link: string
    isVisible: boolean
  }
  heroButtonSecondary: {
    text: string
    link: string
    isVisible: boolean
  }
  showPrayerTimesWidget: boolean
  showZakatCalculator: boolean
  showHijriCalendar: boolean
  showSpecialIslamicDays: boolean
  showEventsSection: boolean
  featuredEventIds: string[]
  eventsTitle: string
  eventsSubtitle: string
  mainButtons: {
    id: string
    title: string
    description: string
    icon: string
    link: string
    isVisible: boolean
  }[]
}

export default function Home() {
  const [settings, setSettings] = useState<HomePageSettings | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/home-settings")
      const data = await response.json()
      setSettings(data)

      // Fetch featured events
      const eventsResponse = await fetch("/api/home-settings/featured-events")
      const eventsData = await eventsResponse.json()
      setEvents(eventsData)
    } catch (error) {
      console.error("Error fetching home page settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Clock":
        return <Clock className="h-7 w-7 text-primary" />
      case "Calendar":
        return <Calendar className="h-7 w-7 text-primary" />
      case "Heart":
        return <Heart className="h-7 w-7 text-primary" />
      case "DollarSign":
        return <DollarSign className="h-7 w-7 text-primary" />
      default:
        return <Clock className="h-7 w-7 text-primary" />
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex flex-col min-h-screen">
        <section className="relative bg-[#0D7A3B] text-white overflow-hidden">
          <div className="absolute inset-0 bg-golden-pattern opacity-40"></div>
          <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
            <div className="animate-pulse bg-white/20 h-12 w-3/4 max-w-2xl rounded mb-6"></div>
            <div className="animate-pulse bg-white/20 h-6 w-2/3 max-w-xl rounded mb-10"></div>
            <div className="flex gap-4">
              <div className="animate-pulse bg-white/20 h-12 w-40 rounded"></div>
              <div className="animate-pulse bg-white/20 h-12 w-40 rounded"></div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-[#0D7A3B] text-white overflow-hidden">
        <div className="absolute inset-0 bg-golden-pattern opacity-40"></div>
        <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
          <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl max-w-4xl mb-6">
            {settings.heroTitle}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mb-10">{settings.heroSubtitle}</p>
          <div className="flex flex-wrap gap-6 justify-center">
            {settings.heroButtonPrimary.isVisible && (
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#0D7A3B] to-[#0D8A3B] text-white border-2 border-[#0D7A3B] rounded-lg shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out px-8 py-3 hover:bg-[#0D7A3B] hover:text-white"
              >
                <Link href={settings.heroButtonPrimary.link}>{settings.heroButtonPrimary.text}</Link>
              </Button>
            )}

            {settings.heroButtonSecondary.isVisible && (
              <Button
                asChild
                size="lg"
                className="bg-[#0D7A3B] text-white border-2 border-[#0D7A3B] rounded-lg shadow-xl hover:scale-105 transform transition-all duration-200 ease-in-out px-8 py-3 hover:bg-white hover:text-[#0D7A3B]"
              >
                <Link href={settings.heroButtonSecondary.link}>{settings.heroButtonSecondary.text}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Buttons Section */}
      <section className="container px-4 sm:px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {settings.mainButtons
            .filter((button) => button.isVisible)
            .map((button) => (
              <Link key={button.id} href={button.link} className="block">
                <Card className="h-full shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col items-center text-center p-8 h-full">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        {getIconComponent(button.icon)}
                      </div>
                      <h3 className="text-xl font-heading font-medium mb-2">{button.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{button.description}</p>
                      <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </section>

      {/* Events Section */}
      {settings.showEventsSection && events.length > 0 && (
        <section className="container py-6 sm:py-8 md:py-10 mt-12 sm:mt-16 md:mt-24 relative">
        <div className="relative mb-4 sm:mb-6">
          {/* Center aligned heading and text */}
          <div className="text-center mx-auto max-w-3xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold gradient-heading mb-2 sm:mb-3">
              Upcoming Events
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join us for these special occasions at Masjid AnNoor
            </p>
          </div>

          {/* Absolutely positioned button on large screens, centered on mobile */}
          <div className="mt-4 md:mt-0 flex justify-center md:absolute md:right-8 md:top-1/2 md:-translate-y-1/2">
            <Button asChild variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
              <Link href="/event">View All Events</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-24">
          <EventsSection events={events} />
        </div>
        </section>
      )}

      {/* Prayer Times Widget */}
      <section className="bg-secondary py-16">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold gradient-heading mb-3">Today's Prayer Times</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Join us for daily prayers at Masjid AnNoor</p>
          </div>

          {settings.showPrayerTimesWidget && <PrayerTimesWidget />}

          <div className="mt-8 text-center">
            <Button asChild variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
              <Link href="/prayer-times">View Full Schedule</Link>
            </Button>
          </div>

          {/* Special Islamic Days & Gregorian/Hijri Calendar Side by Side */}
          <div className="mt-16 flex flex-wrap justify-center gap-8">
            {/* Special Islamic Days Embed */}
            {settings.showSpecialIslamicDays && <SpecialIslamicDays />}

            {/* Gregorian/Hijri Calendar Embed */}
            {settings.showHijriCalendar && <GregorianHijriCalendar />}

            {/* Zakat Calculator Embed */}
            {settings.showZakatCalculator && <ZakatCalculator />}
          </div>
        </div>
      </section>
    </div>
  )
}

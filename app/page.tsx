import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Calendar, Heart, DollarSign, ArrowRight } from "lucide-react"
import PrayerTimesWidget from "@/components/prayer-times-widget"
import ZakatCalculator from '@/components/zakat-calculator-widget';
import GregorianHijriCalendar from "@/components/GregorianHijriCalendar"
import '../styles/home.css';
import SpecialIslamicDays from "@/components/special-islamic-days"

// This would come from the CMS in a real implementation
const events = [
  {
    id: 1,
    title: "Ramadan 2024",
    description: "Join us for the blessed month of Ramadan. Special prayers and iftars daily.",
    image: "/placeholder.svg?height=400&width=800",
  },
  {
    id: 2,
    title: "Eid Prayer",
    description: "Eid prayer will be held at the masjid. Two sessions available.",
    image: "/placeholder.svg?height=400&width=800",
  },
  {
    id: 3,
    title: "Community Picnic",
    description: "Annual community picnic at the local park. Food and activities for all ages.",
    image: "/placeholder.svg?height=400&width=800",
  },
]

export default function Home() {
  return (
    <div className="flex flex-col">
    {/* Hero Section */}
    <section className="relative bg-[#0D7A3B] text-white overflow-hidden">
      <div className="absolute inset-0 bg-golden-pattern opacity-40"></div>
      <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
        <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">
          Welcome to Masjid AnNoor
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-10">
          A place of worship, learning, and community for Muslims in Fort Smith, Arkansas
        </p>
        <div className="flex flex-wrap gap-6 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-[#0D7A3B] to-[#0D8A3B] text-white border-2 border-[#0D7A3B] rounded-lg shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out px-8 py-3 hover:bg-[#0D7A3B] hover:text-white"
          >
            <Link href="/prayer-times">View Prayer Times</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-[#0D7A3B] text-white border-2 border-[#0D7A3B] rounded-lg shadow-xl hover:scale-105 transform transition-all duration-200 ease-in-out px-8 py-3 hover:bg-white hover:text-[#0D7A3B]"
          >
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>

      {/* Main Buttons Section */}
      <section className="container px-4 md:px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/prayer-times" className="block">
            <Card className="h-full shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden group">
              <CardContent className="p-0">
                <div className="flex flex-col items-center text-center p-8 h-full">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Clock className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-medium mb-2">Prayer Schedule</h3>
                  <p className="text-muted-foreground text-sm mb-4">View daily prayer times</p>
                  <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/online-giving" className="block">
            <Card className="h-full shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden group">
              <CardContent className="p-0">
                <div className="flex flex-col items-center text-center p-8 h-full">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <DollarSign className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-medium mb-2">Make A Donation</h3>
                  <p className="text-muted-foreground text-sm mb-4">Support our masjid</p>
                  <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ramadan/sponsor-iftar" className="block">
            <Card className="h-full shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden group">
              <CardContent className="p-0">
                <div className="flex flex-col items-center text-center p-8 h-full">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Heart className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-medium mb-2">Sponsor An Iftar</h3>
                  <p className="text-muted-foreground text-sm mb-4">Provide meals during Ramadan</p>
                  <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ramadan/iftar-times" className="block">
            <Card className="h-full shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden group">
              <CardContent className="p-0">
                <div className="flex flex-col items-center text-center p-8 h-full">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Calendar className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-medium mb-2">Iftaar Schedule</h3>
                  <p className="text-muted-foreground text-sm mb-4">View Ramadan timings</p>
                  <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Events Carousel */}
      <section className="container px-4 md:px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold gradient-heading mb-2">Upcoming Events</h2>
            <p className="text-muted-foreground">Join us for these special occasions at Masjid AnNoor</p>
          </div>
          <Button asChild variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
            <Link href="/event">View All Events</Link>
          </Button>
        </div>

        <Tabs defaultValue="event-1" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 bg-muted/50 p-1 rounded-full max-w-md mx-auto">
            {events.map((event) => (
              <TabsTrigger
                key={event.id}
                value={`event-${event.id}`}
                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                {event.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {events.map((event) => (
            <TabsContent key={event.id} value={`event-${event.id}`} className="mt-0 animate-fade-in">
              <Card className="overflow-hidden border-0 shadow-elegant">
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      width={1200}
                      height={600}
                      className="w-full h-[400px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-medium rounded-full mb-3">
                        Upcoming
                      </span>
                      <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">{event.title}</h3>
                      <p className="text-white/90 mb-4 max-w-2xl">{event.description}</p>
                      <Link href={`/event/${event.id}`} passHref>
                      <Button className="bg-white text-primary hover:bg-white/90">Learn More</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Prayer Times Widget */}
      <section className="bg-secondary py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-heading font-bold gradient-heading mb-3">
                Today's Prayer Times
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join us for daily prayers at Masjid AnNoor
              </p>
            </div>
            <PrayerTimesWidget />
            <div className="mt-8 text-center">
              <Button asChild variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
                <Link href="/prayer-times">View Full Schedule</Link>
              </Button>
            </div>

            {/* Special Islamic Days & Gregorian/Hijri Calendar Side by Side */}
            <div className="mt-16 flex flex-wrap justify-center gap-8">
              {/* Special Islamic Days Embed */}
              <SpecialIslamicDays/>
              {/* Gregorian/Hijri Calendar Embed */}
              <GregorianHijriCalendar />
              {/* Zakat Calculator Embed */}
              <ZakatCalculator />
            </div>
          </div>
        </section>
    </div>
  )
}


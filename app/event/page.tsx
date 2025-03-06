import Link from "next/link"
import Image from "next/image"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, MapPin } from "lucide-react"

// This would come from a CMS or API in a real implementation
const events = [
  {
    id: 1,
    title: "Ramadan Night Prayers",
    description: "Join us for special night prayers during the blessed month of Ramadan.",
    date: new Date("2024-03-15T20:00:00"),
    location: "Main Prayer Hall",
    image: "/placeholder.svg?height=400&width=600",
    category: "Worship",
  },
  {
    id: 2,
    title: "Community Iftar",
    description: "Break your fast with the community. All are welcome to join this blessed gathering.",
    date: new Date("2024-03-20T18:30:00"),
    location: "Masjid Courtyard",
    image: "/placeholder.svg?height=400&width=600",
    category: "Community",
  },
  {
    id: 3,
    title: "Islamic Finance Workshop",
    description: "Learn about Islamic principles of finance and investment.",
    date: new Date("2024-04-05T14:00:00"),
    location: "Education Center",
    image: "/placeholder.svg?height=400&width=600",
    category: "Education",
  },
  {
    id: 4,
    title: "Youth Quran Competition",
    description: "Annual Quran recitation and memorization competition for youth.",
    date: new Date("2024-04-15T10:00:00"),
    location: "Main Prayer Hall",
    image: "/placeholder.svg?height=400&width=600",
    category: "Youth",
  },
]

export default function EventsPage() {
  const featuredEvent = events[0] // Assume the first event is featured

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#0D7A3B] text-white overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">Upcoming Events</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Join us for a variety of spiritual, educational, and community events at Masjid AnNoor
          </p>
        </div>
      </section>

      <section className="container px-4 md:px-6 py-12 md:py-24">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Events List */}
          <div className="md:col-span-2 space-y-8">
            {/* Featured Event */}
            <Card className="overflow-hidden border-0 shadow-elegant">
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={featuredEvent.image || "/placeholder.svg"}
                    alt={featuredEvent.title}
                    width={800}
                    height={400}
                    className="w-full h-[300px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <Badge className="mb-2">{featuredEvent.category}</Badge>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
                      {featuredEvent.title}
                    </h2>
                    <p className="text-white/90 mb-4">{featuredEvent.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-white/80">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {featuredEvent.date.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {featuredEvent.date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {featuredEvent.location}
                      </div>
                    </div>
                    <Link href={`/event/${featuredEvent.id}`} passHref>
                      <Button className="mt-4">Learn More</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Other Events */}
            <div className="space-y-8">
              <h2 className="text-3xl font-heading font-bold gradient-heading">More Upcoming Events</h2>
              {events.slice(1).map((event) => (
                <Card key={event.id} className="overflow-hidden border-0 shadow-elegant">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-1/3">
                        <Image
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          width={300}
                          height={200}
                          className="w-full h-[200px] object-cover"
                        />
                        <Badge className="absolute top-2 left-2">{event.category}</Badge>
                      </div>
                      <div className="p-6 md:w-2/3">
                        <h3 className="text-xl font-heading font-bold mb-2">{event.title}</h3>
                        <p className="text-muted-foreground mb-4">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            {event.date.toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        </div>
                        <Link href={`/event/${event.id}`} passHref>
                          <Button className="mt-4">Learn More</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Calendar */}
            <Card className="border-0 shadow-elegant overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle>Event Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar mode="single" selected={new Date()} className="rounded-md border" />
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="border-0 shadow-elegant overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle>Event Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Worship</Badge>
                  <Badge variant="secondary">Community</Badge>
                  <Badge variant="secondary">Education</Badge>
                  <Badge variant="secondary">Youth</Badge>
                  <Badge variant="secondary">Charity</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="border-0 shadow-elegant overflow-hidden bg-secondary">
              <CardContent className="p-6">
                <h3 className="text-xl font-heading font-bold mb-2">Host an Event</h3>
                <p className="text-muted-foreground mb-4">Interested in organizing an event at Masjid AnNoor?</p>
                <Button asChild className="w-full">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}


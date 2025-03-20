"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface AboutData {
  hero: {
    title: string
    subtitle: string
  }
  sidebar: {
    image: string
    visitTitle: string
    visitDescription: string
    address: string
  }
  journey: {
    title: string
    content: string[]
  }
  mission: {
    title: string
    content: string
  }
  services: {
    title: string
    items: Array<{
      title: string
      description: string
    }>
  }
  join: {
    title: string
    content: string
  }
}

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch("/api/about")
        if (response.ok) {
          const data = await response.json()
          setAboutData(data)
        } else {
          console.error("Failed to fetch about page data")
        }
      } catch (error) {
        console.error("Error fetching about page data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAboutData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!aboutData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Failed to load about page content. Please try again later.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">
            {aboutData.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">{aboutData.hero.subtitle}</p>
        </div>
      </section>

      <section className="container px-4 md:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4 lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden shadow-elegant">
                <Image
                  src={aboutData.sidebar.image || "/placeholder.svg"}
                  alt="Masjid AnNoor"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="bg-secondary rounded-xl p-6">
                <h3 className="text-xl font-heading font-bold mb-4">{aboutData.sidebar.visitTitle}</h3>
                <p className="text-muted-foreground mb-2">{aboutData.sidebar.visitDescription}</p>
                <p className="font-medium whitespace-pre-line">{aboutData.sidebar.address}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-7">
            <Card className="border-0 shadow-elegant overflow-hidden">
              <CardContent className="p-6 sm:p-8 md:p-10">
                <div className="space-y-10">
                  <section>
                    <h2 className="text-3xl font-heading font-bold gradient-heading mb-6">{aboutData.journey.title}</h2>
                    {aboutData.journey.content.map((paragraph, index) => (
                      <p key={index} className="text-lg leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </section>

                  <section>
                    <h2 className="text-3xl font-heading font-bold gradient-heading mb-6">{aboutData.mission.title}</h2>
                    <p className="text-lg leading-relaxed">{aboutData.mission.content}</p>
                  </section>

                  <section>
                    <h2 className="text-3xl font-heading font-bold gradient-heading mb-6">
                      {aboutData.services.title}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {aboutData.services.items.map((service, index) => (
                        <div key={index} className="bg-secondary p-6 rounded-xl">
                          <h3 className="text-xl font-medium mb-3">{service.title}</h3>
                          <p className="text-muted-foreground">{service.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h2 className="text-3xl font-heading font-bold gradient-heading mb-6">{aboutData.join.title}</h2>
                    <p className="text-lg leading-relaxed">{aboutData.join.content}</p>
                  </section>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}


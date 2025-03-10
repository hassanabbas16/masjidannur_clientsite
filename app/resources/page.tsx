"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone } from "lucide-react"

interface Resource {
  _id: string
  name: string
  title: string
  description: string
  email: string
  phone: string
  image: string
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch("/api/resources")
        if (response.ok) {
          const data = await response.json()
          setResources(data)
        } else {
          console.error("Failed to fetch resources")
        }
      } catch (error) {
        console.error("Error fetching resources:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
        <section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">
              Community Resources
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              Connect with qualified teachers and service providers from our community
            </p>
          </div>
        </section>
        <div className="container px-4 md:px-6 py-12">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
      <section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">
            Community Resources
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Connect with qualified teachers and service providers from our community
          </p>
        </div>
      </section>

      <section className="container px-4 md:px-6 py-12 md:py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Available Resources</h2>
            <p className="text-muted-foreground mt-2">Explore our community experts and service providers</p>
          </div>
          <Link href="/resources/become-resource">
            <Button className="bg-green-600 hover:bg-green-700">Become a Resource</Button>
          </Link>
        </div>

        {resources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-6">No resources available at the moment.</p>
            <Link href="/resources/become-resource" className="inline-block">
              <Button className="bg-green-600 hover:bg-green-700">Become Our First Resource</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <Card
                key={resource._id}
                className="h-full flex flex-col border-0 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden">
                    <Image
                      src={resource.image || "/placeholder.svg"}
                      alt={resource.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle>{resource.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{resource.title}</p>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-2 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    <span>{resource.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-green-600" />
                    <a href={`mailto:${resource.email}`} className="hover:underline">
                      {resource.email}
                    </a>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}


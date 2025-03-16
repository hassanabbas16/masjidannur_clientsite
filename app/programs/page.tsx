"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Program {
  _id: string
  title: string
  description: string
  image: string
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch("/api/programs")
        if (response.ok) {
          const data = await response.json()
          setPrograms(data)
        } else {
          console.error("Failed to fetch programs")
        }
      } catch (error) {
        console.error("Error fetching programs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
        <section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">
              Our Programs
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              Explore the enriching programs we offer to our community.
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
            Our Programs
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Explore the diverse programs we offer at the masjid. Each program is designed to provide enriching experiences.
          </p>
        </div>
      </section>

      <section className="container px-4 md:px-6 py-12 md:py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Available Programs</h2>
            <p className="text-muted-foreground mt-2">Explore the programs offered in our community</p>
          </div>
        </div>

        {programs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-6">No programs available at the moment.</p>
            <Link href="/programs/become-program" className="inline-block">
              <Button className="bg-green-600 hover:bg-green-700">Become Our First Program</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <Card key={program._id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image src={program.image || "/placeholder.svg"} alt={program.title} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle>{program.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4">{program.description}</CardDescription>
                  <Button asChild>
                    <Link href={`/programs/${program._id}`}>Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

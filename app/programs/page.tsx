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
    return <div>Loading...</div>
  }

  return (
    <div className="container px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold mb-4 text-center">Our Programs</h1>
      <p className="text-center mb-8 max-w-3xl mx-auto">
      Explore the diverse programs we offer at the masjid. Each program is designed to provide enriching experiences, 
      featuring an image, title, and a detailed description. Click on any program to discover more and get involved.

      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {programs.map((program) => (
          <Card key={program._id} className="overflow-hidden">
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
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface Program {
  _id: string
  title: string
  description: string
  image: string
  fullDescription?: string
  schedule?: string
  contact?: string
}

export default function ProgramPage() {
  const params = useParams()
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await fetch(`/api/programs/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProgram(data)
        } else {
          console.error("Failed to fetch program")
        }
      } catch (error) {
        console.error("Error fetching program:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProgram()
    }
  }, [params.id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!program) {
    return <div>Program not found</div>
  }

  return (
    <div className="container px-4 md:px-6 py-12">
      <Link href="/programs" className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Programs
      </Link>

      <Card className="overflow-hidden border-0 shadow-elegant">
        <CardContent className="p-0">
          <div className="relative h-64 md:h-96">
            <Image src={program.image || "/placeholder.svg"} alt={program.title} fill className="object-cover" />
          </div>
          <div className="p-6 space-y-6">
            <CardHeader className="p-0">
              <CardTitle className="text-3xl font-bold">{program.title}</CardTitle>
            </CardHeader>
            <p className="text-lg text-muted-foreground">{program.description}</p>
            {program.fullDescription && (
              <div>
                <h2 className="text-2xl font-bold mb-2">About This Program</h2>
                <p className="text-muted-foreground">{program.fullDescription}</p>
              </div>
            )}
            {program.schedule && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Schedule</h2>
                <p className="text-muted-foreground">{program.schedule}</p>
              </div>
            )}
            {program.contact && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Contact</h2>
                <p className="text-muted-foreground">{program.contact}</p>
              </div>
            )}
            {/* <Button className="w-full md:w-auto">Register for This Program</Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


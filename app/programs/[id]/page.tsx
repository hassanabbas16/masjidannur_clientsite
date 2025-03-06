"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface Program {
  id: string
  title: string
  description: string
  image: string
  fullDescription?: string
  schedule?: string
  contact?: string
}

// This would come from the CMS in a real implementation
const programs: Program[] = [
  {
    id: "team-fajr",
    title: "Team Fajr",
    description: "Join us every Saturday for Fajr prayer, followed by a brothers' gathering and breakfast.",
    image: "/placeholder.svg?height=400&width=800",
    fullDescription:
      "Team Fajr is a program designed to encourage brothers to attend the Fajr prayer in congregation. After the prayer, we gather for a short reminder and enjoy breakfast together. This program aims to strengthen our faith, build brotherhood, and start our Saturdays with blessings.",
    schedule: "Every Saturday, Fajr prayer time (varies based on season)",
    contact: "For more information, contact Br. Ahmed at ahmed@masjidannoor.com",
  },
  {
    id: "tafsir-classes",
    title: "Tafsir Classes",
    description: "Deepen your understanding of the Quran with Tafsir classes every Saturday between Maghrib and Isha.",
    image: "/placeholder.svg?height=400&width=800",
    fullDescription:
      "Our Tafsir classes offer in-depth explanations of the Quran, helping attendees understand the context, linguistic nuances, and practical applications of Quranic verses. These classes are led by our knowledgeable Imam and are suitable for all levels of Islamic knowledge.",
    schedule: "Every Saturday between Maghrib and Isha prayers",
    contact: "For more information, contact Imam Abdullah at imam@masjidannoor.com",
  },
  {
    id: "islamic-school",
    title: "Islamic School for Children",
    description:
      "Our Islamic School runs from Monday to Thursday, 5:30 PM – 7:00 PM, providing children with essential Islamic education.",
    image: "/placeholder.svg?height=400&width=800",
    fullDescription:
      "The Islamic School for Children is a comprehensive program designed to provide young Muslims with a strong foundation in Islamic knowledge. The curriculum includes Quran recitation and memorization, Islamic studies, Arabic language, and character development. Our experienced teachers use engaging methods to make learning enjoyable and effective.",
    schedule: "Monday to Thursday, 5:30 PM – 7:00 PM",
    contact: "For registration and more details, please call the masjid at (479) 123-4567 or speak with the Imam",
  },
  {
    id: "revert-tutoring",
    title: "Revert Tutoring Classes",
    description: "One-on-one tutoring sessions for new Muslims, available by appointment.",
    image: "/placeholder.svg?height=400&width=800",
    fullDescription:
      "Our Revert Tutoring Classes offer personalized support for new Muslims, helping them learn the basics of Islam, improve their prayer, and answer any questions they may have. These one-on-one sessions are tailored to the individual's needs and pace of learning, providing a comfortable environment for growth in faith.",
    schedule: "Available by appointment",
    contact:
      "To schedule a session, please contact Sr. Maryam at maryam@masjidannoor.com or call the masjid at (479) 123-4567",
  },
]

export default function ProgramPage() {
  const params = useParams()
  const [program, setProgram] = useState<Program | null>(null)

  useEffect(() => {
    const id = typeof params.id === "string" ? params.id : ""
    const fetchedProgram = programs.find((p) => p.id === id)
    setProgram(fetchedProgram || null)
  }, [params.id])

  if (!program) {
    return <div>Loading...</div>
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
            <div>
              <h2 className="text-2xl font-bold mb-2">About This Program</h2>
              <p className="text-muted-foreground">{program.fullDescription}</p>
            </div>
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
            <Button className="w-full md:w-auto">Register for This Program</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


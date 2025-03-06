import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// This would come from the CMS in a real implementation
const programs = [
  {
    id: "team-fajr",
    title: "Team Fajr",
    description: "Join us every Saturday for Fajr prayer, followed by a brothers' gathering and breakfast.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "tafsir-classes",
    title: "Tafsir Classes",
    description: "Deepen your understanding of the Quran with Tafsir classes every Saturday between Maghrib and Isha.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "islamic-school",
    title: "Islamic School for Children",
    description:
      "Our Islamic School runs from Monday to Thursday, 5:30 PM – 7:00 PM, providing children with essential Islamic education. For more details, call the masjid or speak with the Imam.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "revert-tutoring",
    title: "Revert Tutoring Classes",
    description:
      "One-on-one tutoring sessions for new Muslims, available by appointment. To schedule, contact us via phone, email, or by visiting the masjid.",
    image: "/placeholder.svg?height=200&width=400",
  },
]

export default function ProgramsPage() {
  return (
    <div className="container px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold mb-4 text-center">Our Programs</h1>
      <p className="text-center mb-8 max-w-3xl mx-auto">
        Below are some of the programs offered at the masjid. Each program includes an image, a title, and a
        description. Click on a program to learn more.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {programs.map((program) => (
          <Card key={program.id} id={program.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image src={program.image || "/placeholder.svg"} alt={program.title} fill className="object-cover" />
            </div>
            <CardHeader>
              <CardTitle>{program.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-4">{program.description}</CardDescription>
              <Button asChild>
                <Link href={`/programs/${program.id}`}>Learn More</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h2 className="text-xl font-bold mb-4">Future CMS Features:</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Option to add images for each program</li>
          <li>Ability to add and update program titles</li>
          <li>Editable descriptions for each program</li>
        </ul>
      </div>
    </div>
  )
}

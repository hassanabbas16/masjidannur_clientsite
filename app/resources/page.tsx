import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone } from "lucide-react"

// This would come from the CMS in a real implementation
const resources = [
  {
    id: 1,
    name: "Aisha Rahman",
    title: "Arabic Language Instructor",
    description:
      "Certified Arabic language instructor with 10+ years of teaching experience. Offers classes for beginners to advanced learners, focusing on Modern Standard Arabic and conversational skills.",
    email: "aisha.rahman@example.com",
    phone: "(479) 234-5678",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 2,
    name: "Yusuf Ali",
    title: "Islamic Studies Teacher",
    description:
      "Specializing in Islamic history and fiqh for middle and high school students. Provides engaging lessons on the life of Prophet Muhammad (PBUH), Islamic civilization, and contemporary Islamic issues.",
    email: "yusuf.ali@example.com",
    phone: "(479) 345-6789",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 3,
    name: "Fatima Hassan",
    title: "Women's Halaqa Leader",
    description:
      "Leads weekly women's halaqa sessions focusing on Quranic tafsir and personal development. Provides a supportive environment for sisters to learn and grow in their faith.",
    email: "fatima.hassan@example.com",
    phone: "(479) 456-7890",
    image: "/placeholder.svg?height=200&width=200",
  },
]

export default function ResourcesPage() {
  return (
    <div className="container px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Community Resources</h1>
          <p className="text-muted-foreground mt-2">
            Connect with qualified teachers and service providers from our community
          </p>
        </div>
        <Link href="/resources/become-resource">
          <Button className="bg-[#0D7A3B] hover:bg-[#0A6331]">Become a Resource</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden">
                <Image src={resource.image || "/placeholder.svg"} alt={resource.name} fill className="object-cover" />
              </div>
              <div>
                <CardTitle>{resource.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{resource.title}</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{resource.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${resource.email}`} className="hover:underline">
                  {resource.email}
                </a>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}


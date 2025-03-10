"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Link2, Video, ImageIcon, Download, ExternalLink, Search } from "lucide-react"

interface RamadanResource {
  _id: string
  title: string
  description: string
  resourceType: string
  url: string
  fileSize?: string
  category: string
  isVisible: boolean
  order: number
  year: number
}

export default function RamadanResourcesPage() {
  const [resources, setResources] = useState<RamadanResource[]>([])
  const [filteredResources, setFilteredResources] = useState<RamadanResource[]>([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch("/api/ramadan/resources")
        const data = await response.json()
        setResources(data)
        setFilteredResources(data)
      } catch (error) {
        console.error("Error fetching Ramadan resources:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [])

  useEffect(() => {
    // Filter resources based on category and search term
    const filtered = resources.filter((resource) => {
      const matchesCategory = activeCategory === "all" || resource.category === activeCategory
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesCategory && matchesSearch
    })

    setFilteredResources(filtered)
  }, [activeCategory, searchTerm, resources])

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-primary" />
      case "link":
        return <Link2 className="h-5 w-5 text-primary" />
      case "video":
        return <Video className="h-5 w-5 text-primary" />
      case "image":
        return <ImageIcon className="h-5 w-5 text-primary" />
      default:
        return <FileText className="h-5 w-5 text-primary" />
    }
  }

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case "pdf":
        return <Badge variant="outline">PDF</Badge>
      case "link":
        return <Badge variant="outline">Link</Badge>
      case "video":
        return <Badge variant="outline">Video</Badge>
      case "image":
        return <Badge variant="outline">Image</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "prayer":
        return "bg-blue-100 text-blue-800"
      case "fasting":
        return "bg-green-100 text-green-800"
      case "charity":
        return "bg-amber-100 text-amber-800"
      case "quran":
        return "bg-purple-100 text-purple-800"
      case "dua":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#0D7A3B] text-white overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">Ramadan Resources</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Helpful materials to enhance your spiritual journey during the blessed month
          </p>
        </div>
      </section>

      <div className="container px-4 md:px-6 py-12">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Tabs
              defaultValue="all"
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full md:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="prayer">Prayer</TabsTrigger>
                <TabsTrigger value="fasting">Fasting</TabsTrigger>
                <TabsTrigger value="charity">Charity</TabsTrigger>
                <TabsTrigger value="quran">Quran</TabsTrigger>
                <TabsTrigger value="dua">Dua</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Resources List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">No Resources Found</h2>
            <p className="text-muted-foreground mb-8">
              {searchTerm ? "Try a different search term or category." : "No resources available for this category."}
            </p>
            {searchTerm && <Button onClick={() => setSearchTerm("")}>Clear Search</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource._id} className="border-0 shadow-elegant overflow-hidden h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      {getResourceTypeIcon(resource.resourceType)}
                      <span
                        className={`ml-2 text-xs px-2 py-1 rounded-full ${getCategoryColor(resource.category)} capitalize`}
                      >
                        {resource.category}
                      </span>
                    </div>
                    {getResourceTypeLabel(resource.resourceType)}
                  </div>
                  <CardTitle className="text-xl">{resource.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex flex-col h-full">
                  <div className="flex-grow">
                    <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                  </div>
                  <div className="mt-auto">
                    {resource.resourceType === "pdf" ? (
                      <Button asChild className="w-full">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                          {resource.fileSize && <span className="ml-1 text-xs">({resource.fileSize})</span>}
                        </a>
                      </Button>
                    ) : resource.resourceType === "video" ? (
                      <Button asChild className="w-full">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <Video className="mr-2 h-4 w-4" />
                          Watch Video
                        </a>
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Resource
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


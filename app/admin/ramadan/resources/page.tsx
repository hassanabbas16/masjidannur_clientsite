"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Edit, Plus, Search, Trash2, ExternalLink, FileText, Link2, Video, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/ramadan/resources?showHidden=true")
      const data = await response.json()
      setResources(data)
    } catch (error) {
      console.error("Error fetching resources:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setResourceToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!resourceToDelete) return

    try {
      const response = await fetch(`/api/ramadan/resources/${resourceToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setResources(resources.filter((resource) => resource._id !== resourceToDelete))
      } else {
        console.error("Failed to delete resource")
      }
    } catch (error) {
      console.error("Error deleting resource:", error)
    } finally {
      setDeleteDialogOpen(false)
      setResourceToDelete(null)
    }
  }

  const handleVisibilityToggle = async (id: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/ramadan/resources/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVisible: !currentVisibility }),
      })

      if (response.ok) {
        setResources(
          resources.map((resource) =>
            resource._id === id ? { ...resource, isVisible: !currentVisibility } : resource,
          ),
        )
      } else {
        console.error("Failed to update resource visibility")
      }
    } catch (error) {
      console.error("Error updating resource visibility:", error)
    }
  }

  const filteredResources = resources
    .filter((resource) => {
      // Filter by search term
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase())

      // Filter by category
      const matchesCategory = filterCategory === "all" || resource.category === filterCategory

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => a.order - b.order)

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "link":
        return <Link2 className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "image":
        return <Image className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "prayer":
        return <Badge className="bg-blue-500">Prayer</Badge>
      case "fasting":
        return <Badge className="bg-green-500">Fasting</Badge>
      case "charity":
        return <Badge className="bg-amber-500">Charity</Badge>
      case "quran":
        return <Badge className="bg-purple-500">Quran</Badge>
      case "dua":
        return <Badge className="bg-indigo-500">Dua</Badge>
      default:
        return (
          <Badge variant="outline" className="capitalize">
            {category}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Ramadan Resources</h1>
        <Button asChild>
          <Link href="/admin/ramadan/resources/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Resource
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Ramadan Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="prayer">Prayer</SelectItem>
                <SelectItem value="fasting">Fasting</SelectItem>
                <SelectItem value="charity">Charity</SelectItem>
                <SelectItem value="quran">Quran</SelectItem>
                <SelectItem value="dua">Dua</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No resources found. Create your first Ramadan resource!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Visible</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => (
                    <TableRow key={resource._id}>
                      <TableCell className="font-medium">{resource.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getResourceTypeIcon(resource.resourceType)}
                          <span className="capitalize">{resource.resourceType}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(resource.category)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[150px]">{resource.url}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => window.open(resource.url, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={resource.isVisible}
                          onCheckedChange={() => handleVisibilityToggle(resource._id, resource.isVisible)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/admin/ramadan/resources/${resource._id}`)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteClick(resource._id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the resource.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


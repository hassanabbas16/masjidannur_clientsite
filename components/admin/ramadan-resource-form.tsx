"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RamadanResourceFormProps {
  initialData?: {
    _id?: string
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
  isEditing?: boolean
}

export default function RamadanResourceForm({ initialData, isEditing = false }: RamadanResourceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    resourceType: initialData?.resourceType || "link",
    url: initialData?.url || "",
    fileSize: initialData?.fileSize || "",
    category: initialData?.category || "other",
    isVisible: initialData?.isVisible ?? true,
    order: initialData?.order || 0,
    year: initialData?.year || new Date().getFullYear(),
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = isEditing ? `/api/ramadan/resources/${initialData?._id}` : "/api/ramadan/resources"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/ramadan/resources")
        router.refresh()
      } else {
        console.error("Failed to save resource")
      }
    } catch (error) {
      console.error("Error saving resource:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resourceTypes = ["pdf", "link", "video", "image"]
  const categories = ["prayer", "fasting", "charity", "quran", "dua", "other"]

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Ramadan Resource" : "Create New Ramadan Resource"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Resource Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resourceType">Resource Type</Label>
              <Select
                value={formData.resourceType}
                onValueChange={(value) => handleSelectChange("resourceType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="capitalize">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                value={formData.order.toString()}
                onChange={(e) => setFormData((prev) => ({ ...prev, order: Number.parseInt(e.target.value) || 0 }))}
              />
              <p className="text-sm text-muted-foreground">Lower numbers appear first</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Resource URL</Label>
            <Input id="url" name="url" value={formData.url} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          {formData.resourceType === "pdf" && (
            <div className="space-y-2">
              <Label htmlFor="fileSize">File Size (Optional)</Label>
              <Input id="fileSize" name="fileSize" value={formData.fileSize} onChange={handleChange} />
              <p className="text-sm text-muted-foreground">Example: 2.5 MB</p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="isVisible"
              checked={formData.isVisible}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isVisible: checked }))}
            />
            <Label htmlFor="isVisible">Resource Visible</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/ramadan/resources")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{isEditing ? "Update Resource" : "Create Resource"}</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}


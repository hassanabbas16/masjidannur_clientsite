"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface AboutFormProps {
  initialData: {
    _id: string
    hero: {
      title: string
      subtitle: string
    }
    sidebar: {
      image: string
      visitTitle: string
      visitDescription: string
      address: string
    }
    journey: {
      title: string
      content: string[]
    }
    mission: {
      title: string
      content: string
    }
    services: {
      title: string
      items: Array<{
        title: string
        description: string
      }>
    }
    join: {
      title: string
      content: string
    }
  }
}

export default function AboutForm({ initialData }: AboutFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    hero: { ...initialData.hero },
    sidebar: { ...initialData.sidebar },
    journey: {
      title: initialData.journey.title,
      content: [...initialData.journey.content],
    },
    mission: { ...initialData.mission },
    services: {
      title: initialData.services.title,
      items: [...initialData.services.items],
    },
    join: { ...initialData.join },
  })

  const handleChange = (section: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const handleNestedChange = (section: string, nestedSection: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [nestedSection]: {
          ...prev[section as keyof typeof prev][nestedSection as any],
          [field]: value,
        },
      },
    }))
  }

  const handleJourneyParagraphChange = (index: number, value: string) => {
    const newContent = [...formData.journey.content]
    newContent[index] = value
    setFormData((prev) => ({
      ...prev,
      journey: {
        ...prev.journey,
        content: newContent,
      },
    }))
  }

  const addJourneyParagraph = () => {
    setFormData((prev) => ({
      ...prev,
      journey: {
        ...prev.journey,
        content: [...prev.journey.content, ""],
      },
    }))
  }

  const removeJourneyParagraph = (index: number) => {
    const newContent = [...formData.journey.content]
    newContent.splice(index, 1)
    setFormData((prev) => ({
      ...prev,
      journey: {
        ...prev.journey,
        content: newContent,
      },
    }))
  }

  const handleServiceChange = (index: number, field: string, value: string) => {
    const newItems = [...formData.services.items]
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    }
    setFormData((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        items: newItems,
      },
    }))
  }

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        items: [...prev.services.items, { title: "", description: "" }],
      },
    }))
  }

  const removeService = (index: number) => {
    const newItems = [...formData.services.items]
    newItems.splice(index, 1)
    setFormData((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        items: newItems,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/about", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.refresh()
        alert("About page updated successfully!")
      } else {
        console.error("Failed to update about page")
        alert("Failed to update about page. Please try again.")
      }
    } catch (error) {
      console.error("Error updating about page:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="hero">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="sidebar">Sidebar</TabsTrigger>
          <TabsTrigger value="journey">Journey</TabsTrigger>
          <TabsTrigger value="mission">Mission</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="join">Join Us</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero-title">Hero Title</Label>
            <Input
              id="hero-title"
              value={formData.hero.title}
              onChange={(e) => handleChange("hero", "title", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
            <Input
              id="hero-subtitle"
              value={formData.hero.subtitle}
              onChange={(e) => handleChange("hero", "subtitle", e.target.value)}
              required
            />
          </div>
        </TabsContent>

        <TabsContent value="sidebar" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sidebar-image">Sidebar Image URL</Label>
            <Input
              id="sidebar-image"
              value={formData.sidebar.image}
              onChange={(e) => handleChange("sidebar", "image", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sidebar-visit-title">Visit Title</Label>
            <Input
              id="sidebar-visit-title"
              value={formData.sidebar.visitTitle}
              onChange={(e) => handleChange("sidebar", "visitTitle", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sidebar-visit-description">Visit Description</Label>
            <Textarea
              id="sidebar-visit-description"
              value={formData.sidebar.visitDescription}
              onChange={(e) => handleChange("sidebar", "visitDescription", e.target.value)}
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sidebar-address">Address</Label>
            <Textarea
              id="sidebar-address"
              value={formData.sidebar.address}
              onChange={(e) => handleChange("sidebar", "address", e.target.value)}
              rows={3}
              required
            />
          </div>
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="journey-title">Journey Title</Label>
            <Input
              id="journey-title"
              value={formData.journey.title}
              onChange={(e) => handleChange("journey", "title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Journey Content</Label>
            {formData.journey.content.map((paragraph, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={paragraph}
                  onChange={(e) => handleJourneyParagraphChange(index, e.target.value)}
                  rows={4}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeJourneyParagraph(index)}
                  disabled={formData.journey.content.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addJourneyParagraph} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Paragraph
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="mission" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mission-title">Mission Title</Label>
            <Input
              id="mission-title"
              value={formData.mission.title}
              onChange={(e) => handleChange("mission", "title", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mission-content">Mission Content</Label>
            <Textarea
              id="mission-content"
              value={formData.mission.content}
              onChange={(e) => handleChange("mission", "content", e.target.value)}
              rows={6}
              required
            />
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="services-title">Services Title</Label>
            <Input
              id="services-title"
              value={formData.services.title}
              onChange={(e) => handleChange("services", "title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Service Items</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              {formData.services.items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`service-title-${index}`}>Title</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeService(index)}
                        disabled={formData.services.items.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      id={`service-title-${index}`}
                      value={item.title}
                      onChange={(e) => handleServiceChange(index, "title", e.target.value)}
                      required
                    />
                    <Label htmlFor={`service-description-${index}`}>Description</Label>
                    <Textarea
                      id={`service-description-${index}`}
                      value={item.description}
                      onChange={(e) => handleServiceChange(index, "description", e.target.value)}
                      rows={2}
                      required
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={addService} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="join" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="join-title">Join Us Title</Label>
            <Input
              id="join-title"
              value={formData.join.title}
              onChange={(e) => handleChange("join", "title", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="join-content">Join Us Content</Label>
            <Textarea
              id="join-content"
              value={formData.join.content}
              onChange={(e) => handleChange("join", "content", e.target.value)}
              rows={4}
              required
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}


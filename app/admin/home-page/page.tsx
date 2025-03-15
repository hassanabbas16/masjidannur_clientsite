"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import {
  Save,
  Clock,
  Calendar,
  Heart,
  DollarSign,
  Calculator,
  CalendarDays,
  Star,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  ArrowLeft,
} from "lucide-react"

interface HomePageSettings {
  _id?: string
  heroTitle: string
  heroSubtitle: string
  heroButtonPrimary: {
    text: string
    link: string
    isVisible: boolean
  }
  heroButtonSecondary: {
    text: string
    link: string
    isVisible: boolean
  }
  showPrayerTimesWidget: boolean
  showZakatCalculator: boolean
  showHijriCalendar: boolean
  showSpecialIslamicDays: boolean
  showEventsSection: boolean
  featuredEventIds: string[]
  eventsTitle: string
  eventsSubtitle: string
  mainButtons: {
    id: string
    title: string
    description: string
    icon: string
    link: string
    isVisible: boolean
  }[]
  isActive: boolean
}

interface Event {
  _id: string
  title: string
  description: string
  date: string
  category: string[]
  isVisible: boolean
  image?: string
}

export default function HomePageManagement() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("hero")
  const [settings, setSettings] = useState<HomePageSettings | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingButton, setEditingButton] = useState<string | null>(null)
  const [buttonForm, setButtonForm] = useState({
    id: "",
    title: "",
    description: "",
    icon: "",
    link: "",
    isVisible: true,
  })

  useEffect(() => {
    fetchSettings()
    fetchEvents()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/home-settings")
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching home page settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events?showHidden=true")
      const data = await response.json()
      setEvents(data)

      // Fetch featured events
      const featuredResponse = await fetch("/api/home-settings/featured-events")
      const featuredData = await featuredResponse.json()
      setFeaturedEvents(featuredData)
    } catch (error) {
      console.error("Error fetching events:", error)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    try {
      setSaving(true)

      const response = await fetch("/api/home-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert("Settings saved successfully!")
      } else {
        alert("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("An error occurred while saving settings")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateFeaturedEvents = async (eventIds: string[]) => {
    try {
      setSaving(true)

      const response = await fetch("/api/home-settings/featured-events", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventIds }),
      })

      if (response.ok) {
        // Update settings with new featured event IDs
        if (settings) {
          setSettings({
            ...settings,
            featuredEventIds: eventIds,
          })
        }

        // Refresh featured events
        fetchEvents()

        alert("Featured events updated successfully!")
      } else {
        alert("Failed to update featured events")
      }
    } catch (error) {
      console.error("Error updating featured events:", error)
      alert("An error occurred while updating featured events")
    } finally {
      setSaving(false)
    }
  }

  const handleAddToFeatured = (eventId: string) => {
    if (!settings) return

    // Check if already featured
    if (settings.featuredEventIds.includes(eventId)) return

    // Add to featured events
    const updatedIds = [...settings.featuredEventIds, eventId]
    setSettings({
      ...settings,
      featuredEventIds: updatedIds,
    })

    // Update featured events
    handleUpdateFeaturedEvents(updatedIds)
  }

  const handleRemoveFromFeatured = (eventId: string) => {
    if (!settings) return

    // Remove from featured events
    const updatedIds = settings.featuredEventIds.filter((id) => id !== eventId)
    setSettings({
      ...settings,
      featuredEventIds: updatedIds,
    })

    // Update featured events
    handleUpdateFeaturedEvents(updatedIds)
  }

  const handleReorderFeatured = (result: any) => {
    if (!result.destination || !settings) return

    const items = Array.from(settings.featuredEventIds)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSettings({
      ...settings,
      featuredEventIds: items,
    })

    // Update featured events
    handleUpdateFeaturedEvents(items)
  }

  const handleEditButton = (button: any) => {
    setButtonForm({
      id: button.id,
      title: button.title,
      description: button.description,
      icon: button.icon,
      link: button.link,
      isVisible: button.isVisible,
    })
    setEditingButton(button.id)
  }

  const handleSaveButton = () => {
    if (!settings) return

    const updatedButtons = settings.mainButtons.map((button) => (button.id === buttonForm.id ? buttonForm : button))

    setSettings({
      ...settings,
      mainButtons: updatedButtons,
    })

    setEditingButton(null)
  }

  const handleCancelEditButton = () => {
    setEditingButton(null)
  }

  const handleToggleButtonVisibility = (buttonId: string) => {
    if (!settings) return

    const updatedButtons = settings.mainButtons.map((button) =>
      button.id === buttonId ? { ...button, isVisible: !button.isVisible } : button,
    )

    setSettings({
      ...settings,
      mainButtons: updatedButtons,
    })
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Clock":
        return <Clock className="h-5 w-5" />
      case "Calendar":
        return <Calendar className="h-5 w-5" />
      case "Heart":
        return <Heart className="h-5 w-5" />
      case "DollarSign":
        return <DollarSign className="h-5 w-5" />
      case "Calculator":
        return <Calculator className="h-5 w-5" />
      case "CalendarDays":
        return <CalendarDays className="h-5 w-5" />
      case "Star":
        return <Star className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-800">Settings Not Found</h1>
        <p className="mt-4 text-gray-600">Unable to load home page settings.</p>
        <Button className="mt-6" onClick={fetchSettings}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-center sm:text-left">Home Page Management</h1>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="buttons">Main Buttons</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Manage the hero section content and buttons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="hero-title">Hero Title</Label>
                <Input
                  id="hero-title"
                  value={settings.heroTitle}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
                <Textarea
                  id="hero-subtitle"
                  value={settings.heroSubtitle}
                  onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 border p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Primary Button</Label>
                    <Switch
                      checked={settings.heroButtonPrimary.isVisible}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          heroButtonPrimary: {
                            ...settings.heroButtonPrimary,
                            isVisible: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary-button-text">Button Text</Label>
                    <Input
                      id="primary-button-text"
                      value={settings.heroButtonPrimary.text}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          heroButtonPrimary: {
                            ...settings.heroButtonPrimary,
                            text: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary-button-link">Button Link</Label>
                    <Input
                      id="primary-button-link"
                      value={settings.heroButtonPrimary.link}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          heroButtonPrimary: {
                            ...settings.heroButtonPrimary,
                            link: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4 border p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Secondary Button</Label>
                    <Switch
                      checked={settings.heroButtonSecondary.isVisible}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          heroButtonSecondary: {
                            ...settings.heroButtonSecondary,
                            isVisible: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary-button-text">Button Text</Label>
                    <Input
                      id="secondary-button-text"
                      value={settings.heroButtonSecondary.text}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          heroButtonSecondary: {
                            ...settings.heroButtonSecondary,
                            text: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary-button-link">Button Link</Label>
                    <Input
                      id="secondary-button-link"
                      value={settings.heroButtonSecondary.link}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          heroButtonSecondary: {
                            ...settings.heroButtonSecondary,
                            link: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving} className="ml-auto">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="buttons" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Main Buttons</CardTitle>
              <CardDescription>Manage the main navigation buttons</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Icon</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Visible</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.mainButtons.map((button) => (
                    <TableRow key={button.id}>
                      {editingButton === button.id ? (
                        <>
                          <TableCell>
                            <Select
                              value={buttonForm.icon}
                              onValueChange={(value) => setButtonForm({ ...buttonForm, icon: value })}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Select icon" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Clock">Clock</SelectItem>
                                <SelectItem value="Calendar">Calendar</SelectItem>
                                <SelectItem value="Heart">Heart</SelectItem>
                                <SelectItem value="DollarSign">Dollar Sign</SelectItem>
                                <SelectItem value="Calculator">Calculator</SelectItem>
                                <SelectItem value="CalendarDays">Calendar Days</SelectItem>
                                <SelectItem value="Star">Star</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={buttonForm.title}
                              onChange={(e) => setButtonForm({ ...buttonForm, title: e.target.value })}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={buttonForm.description}
                              onChange={(e) => setButtonForm({ ...buttonForm, description: e.target.value })}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={buttonForm.link}
                              onChange={(e) => setButtonForm({ ...buttonForm, link: e.target.value })}
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={buttonForm.isVisible}
                              onCheckedChange={(checked) => setButtonForm({ ...buttonForm, isVisible: checked })}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={handleSaveButton}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={handleCancelEditButton}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>
                            <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-primary">
                              {getIconComponent(button.icon)}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{button.title}</TableCell>
                          <TableCell>{button.description}</TableCell>
                          <TableCell>{button.link}</TableCell>
                          <TableCell>
                            <Switch
                              checked={button.isVisible}
                              onCheckedChange={() => handleToggleButtonVisibility(button.id)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleEditButton(button)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving} className="ml-auto">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Events Section</CardTitle>
              <CardDescription>Manage the events section and featured events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.showEventsSection}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      showEventsSection: checked,
                    })
                  }
                />
                <Label>Show Events Section</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="events-title">Events Section Title</Label>
                <Input
                  id="events-title"
                  value={settings.eventsTitle}
                  onChange={(e) => setSettings({ ...settings, eventsTitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="events-subtitle">Events Section Subtitle</Label>
                <Input
                  id="events-subtitle"
                  value={settings.eventsSubtitle}
                  onChange={(e) => setSettings({ ...settings, eventsSubtitle: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Featured Events</Label>
                  <p className="text-sm text-muted-foreground">Drag to reorder</p>
                </div>

                <DragDropContext onDragEnd={handleReorderFeatured}>
                  <Droppable droppableId="featured-events">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {settings.featuredEventIds.length === 0 ? (
                          <p className="text-center py-4 text-muted-foreground">No featured events selected</p>
                        ) : (
                          settings.featuredEventIds.map((eventId, index) => {
                            const event = events.find((e) => e._id === eventId)
                            if (!event) return null

                            return (
                              <Draggable key={eventId} draggableId={eventId} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="flex items-center justify-between p-3 border rounded-md bg-background"
                                  >
                                    <div className="flex items-center">
                                      <div {...provided.dragHandleProps} className="mr-2 cursor-grab">
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      <div>
                                        <p className="font-medium">{event.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {new Date(event.date).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveFromFeatured(eventId)}>
                                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            )
                          })
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              <div className="space-y-4 border-t pt-4">
                <Label className="text-base font-medium">Available Events</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events
                      .filter((event) => !settings.featuredEventIds.includes(event._id))
                      .map((event) => (
                        <TableRow key={event._id}>
                          <TableCell className="font-medium">{event.title}</TableCell>
                          <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {event.category.map((cat) => (
                              <span key={cat} className="inline-block px-2 py-1 mr-1 text-xs bg-secondary rounded-full">
                                {cat}
                              </span>
                            ))}
                          </TableCell>
                          <TableCell>
                            {event.isVisible ? (
                              <span className="flex items-center text-green-600">
                                <Eye className="h-4 w-4 mr-1" /> Visible
                              </span>
                            ) : (
                              <span className="flex items-center text-amber-600">
                                <EyeOff className="h-4 w-4 mr-1" /> Hidden
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleAddToFeatured(event._id)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Featured
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving} className="ml-auto">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="widgets" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Widgets Visibility</CardTitle>
              <CardDescription>Control which widgets are displayed on the home page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 border p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Prayer Times Widget</h3>
                      <p className="text-sm text-muted-foreground">Shows today's prayer times</p>
                    </div>
                    <Switch
                      checked={settings.showPrayerTimesWidget}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          showPrayerTimesWidget: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4 border p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Zakat Calculator</h3>
                      <p className="text-sm text-muted-foreground">Allows users to calculate zakat</p>
                    </div>
                    <Switch
                      checked={settings.showZakatCalculator}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          showZakatCalculator: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4 border p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Hijri Calendar</h3>
                      <p className="text-sm text-muted-foreground">Shows Gregorian/Hijri calendar</p>
                    </div>
                    <Switch
                      checked={settings.showHijriCalendar}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          showHijriCalendar: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4 border p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Special Islamic Days</h3>
                      <p className="text-sm text-muted-foreground">Shows upcoming Islamic holidays</p>
                    </div>
                    <Switch
                      checked={settings.showSpecialIslamicDays}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          showSpecialIslamicDays: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving} className="ml-auto">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


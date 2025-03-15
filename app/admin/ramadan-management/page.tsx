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
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2, Save, RefreshCw, ArrowLeft } from "lucide-react"
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

interface RamadanSettings {
  _id?: string
  year: number
  startDate: Date | string
  endDate: Date | string
  iftarCost: number
  iftarCapacity: number
  iftarDescription: string
  heroTitle: string
  heroSubtitle: string
  aboutTitle: string
  aboutDescription: string
  additionalInfo: string[]
  isActive: boolean
  iftarEnabled: boolean
}

interface RamadanDate {
  _id: string
  date: Date | string
  available: boolean
  sponsorId: string | null
  sponsorName: string | null
  notes: string
  year: number
}

export default function RamadanManagementPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("settings")
  const [settings, setSettings] = useState<RamadanSettings | null>(null)
  const [dates, setDates] = useState<RamadanDate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [additionalInfo, setAdditionalInfo] = useState<string[]>([])
  const [newInfo, setNewInfo] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dateToDelete, setDateToDelete] = useState<string | null>(null)
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dateNotes, setDateNotes] = useState("")
  const [editingDate, setEditingDate] = useState<RamadanDate | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [selectedYear])

  useEffect(() => {
    if (settings) {
      fetchDates()
    }
  }, [settings])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/ramadan-settings?year=${selectedYear}`)
      const data = await response.json()

      // Convert string dates to Date objects
      if (data.startDate) data.startDate = new Date(data.startDate)
      if (data.endDate) data.endDate = new Date(data.endDate)

      setSettings(data)
      setAdditionalInfo(data.additionalInfo || [])
    } catch (error) {
      console.error("Error fetching Ramadan settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDates = async () => {
    try {
      const response = await fetch(`/api/ramadan-dates?year=${settings?.year || selectedYear}`)
      const data = await response.json()

      // Convert string dates to Date objects
      data.forEach((date: RamadanDate) => {
        date.date = new Date(date.date)
      })

      setDates(data)
    } catch (error) {
      console.error("Error fetching Ramadan dates:", error)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    try {
      setSaving(true)

      // Include additionalInfo in settings
      const updatedSettings = {
        ...settings,
        additionalInfo,
      }

      const url = updatedSettings._id ? `/api/ramadan-settings/${updatedSettings._id}` : "/api/ramadan-settings"

      const method = updatedSettings._id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSettings),
      })

      if (response.ok) {
        const data = await response.json()

        // Convert string dates to Date objects
        if (data.startDate) data.startDate = new Date(data.startDate)
        if (data.endDate) data.endDate = new Date(data.endDate)

        setSettings(data)
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

  const handleGenerateDates = async () => {
    if (!settings || !settings.startDate || !settings.endDate) {
      alert("Please set start and end dates first")
      return
    }

    try {
      setGenerating(true)

      const response = await fetch("/api/ramadan-dates", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: settings.year,
          startDate: settings.startDate,
          endDate: settings.endDate,
          regenerate: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Convert string dates to Date objects
        data.dates.forEach((date: RamadanDate) => {
          date.date = new Date(date.date)
        })

        setDates(data.dates)
        setRegenerateDialogOpen(false)
        alert(`Generated ${data.dates.length} dates for Ramadan ${settings.year}`)
      } else {
        alert("Failed to generate dates")
      }
    } catch (error) {
      console.error("Error generating dates:", error)
      alert("An error occurred while generating dates")
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteDate = async () => {
    if (!dateToDelete) return

    try {
      const response = await fetch(`/api/ramadan-dates/${dateToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setDates(dates.filter((date) => date._id !== dateToDelete))
        alert("Date deleted successfully")
      } else {
        alert("Failed to delete date")
      }
    } catch (error) {
      console.error("Error deleting date:", error)
      alert("An error occurred while deleting date")
    } finally {
      setDeleteDialogOpen(false)
      setDateToDelete(null)
    }
  }

  const handleUpdateDate = async () => {
    if (!editingDate) return

    try {
      const response = await fetch(`/api/ramadan-dates/${editingDate._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editingDate,
          notes: dateNotes,
        }),
      })

      if (response.ok) {
        const updatedDate = await response.json()
        updatedDate.date = new Date(updatedDate.date)

        setDates(dates.map((date) => (date._id === updatedDate._id ? updatedDate : date)))

        setEditingDate(null)
        setSelectedDate(null)
        setDateNotes("")
        alert("Date updated successfully")
      } else {
        alert("Failed to update date")
      }
    } catch (error) {
      console.error("Error updating date:", error)
      alert("An error occurred while updating date")
    }
  }

  const handleToggleDateAvailability = async (date: RamadanDate) => {
    try {
      const response = await fetch(`/api/ramadan-dates/${date._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...date,
          available: !date.available,
        }),
      })

      if (response.ok) {
        const updatedDate = await response.json()
        updatedDate.date = new Date(updatedDate.date)

        setDates(dates.map((d) => (d._id === updatedDate._id ? updatedDate : d)))
      } else {
        alert("Failed to update date availability")
      }
    } catch (error) {
      console.error("Error updating date availability:", error)
      alert("An error occurred while updating date availability")
    }
  }

  const handleAddInfo = () => {
    if (!newInfo.trim()) return
    setAdditionalInfo([...additionalInfo, newInfo])
    setNewInfo("")
  }

  const handleRemoveInfo = (index: number) => {
    setAdditionalInfo(additionalInfo.filter((_, i) => i !== index))
  }

  const handleDateSelect = (date: RamadanDate) => {
    setEditingDate(date)
    setSelectedDate(new Date(date.date))
    setDateNotes(date.notes || "")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

        <h1 className="text-3xl font-bold">Ramadan Management</h1>
        <div className="flex items-center gap-2">
          <Label htmlFor="year-select">Year:</Label>
          <Input
            id="year-select"
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
            className="w-24"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">Settings & Content</TabsTrigger>
          <TabsTrigger value="dates">Dates Management</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ramadan {settings?.year} Settings</CardTitle>
              <CardDescription>Configure the settings for Ramadan {settings?.year}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={settings?.year || selectedYear}
                    onChange={(e) => setSettings({ ...settings!, year: Number.parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Iftar Cost</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle iftar sponsorship payment requirement
                      </p>
                    </div>
                    <Switch
                      checked={settings?.iftarEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings!, iftarEnabled: checked })
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Iftar Cost</Label>
                    <Input
                      type="number"
                      value={settings?.iftarCost}
                      onChange={(e) =>
                        setSettings({
                          ...settings!,
                          iftarCost: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled={!settings?.iftarEnabled}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iftar-capacity">Iftar Capacity (people)</Label>
                  <Input
                    id="iftar-capacity"
                    type="number"
                    value={settings?.iftarCapacity || 100}
                    onChange={(e) => setSettings({ ...settings!, iftarCapacity: Number.parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Is Active</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings?.isActive || false}
                      onCheckedChange={(checked) => setSettings({ ...settings!, isActive: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {settings?.isActive ? "This is the active Ramadan year" : "Activate this Ramadan year"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ramadan Period</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          id="start-date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {settings?.startDate ? format(new Date(settings.startDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={settings?.startDate ? new Date(settings.startDate) : undefined}
                          onSelect={(date) => setSettings({ ...settings!, startDate: date! })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal" id="end-date">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {settings?.endDate ? format(new Date(settings.endDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={settings?.endDate ? new Date(settings.endDate) : undefined}
                          onSelect={(date) => setSettings({ ...settings!, endDate: date! })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-title">Hero Title</Label>
                <Input
                  id="hero-title"
                  value={settings?.heroTitle || ""}
                  onChange={(e) => setSettings({ ...settings!, heroTitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
                <Input
                  id="hero-subtitle"
                  value={settings?.heroSubtitle || ""}
                  onChange={(e) => setSettings({ ...settings!, heroSubtitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about-title">About Section Title</Label>
                <Input
                  id="about-title"
                  value={settings?.aboutTitle || ""}
                  onChange={(e) => setSettings({ ...settings!, aboutTitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about-description">About Section Description</Label>
                <Textarea
                  id="about-description"
                  rows={4}
                  value={settings?.aboutDescription || ""}
                  onChange={(e) => setSettings({ ...settings!, aboutDescription: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iftar-description">Iftar Description</Label>
                <Textarea
                  id="iftar-description"
                  rows={4}
                  value={settings?.iftarDescription || ""}
                  onChange={(e) => setSettings({ ...settings!, iftarDescription: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <Label>Additional Information Points</Label>
                <div className="space-y-2">
                  {additionalInfo.map((info, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={info} readOnly className="flex-1" />
                      <Button variant="outline" size="icon" onClick={() => handleRemoveInfo(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add new information point..."
                    value={newInfo}
                    onChange={(e) => setNewInfo(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddInfo}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving} className="ml-auto">
                {saving ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="dates" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Ramadan {settings?.year} Dates</CardTitle>
                  <CardDescription>Manage the dates for Ramadan {settings?.year}</CardDescription>
                </div>
                <Button onClick={() => setRegenerateDialogOpen(true)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Dates
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No dates found for Ramadan {settings?.year}. Click "Generate Dates" to create them.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Sponsor</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dates.map((date) => (
                          <TableRow key={date._id} className={date.available ? "" : "bg-muted/50"}>
                            <TableCell>{format(new Date(date.date), "MMMM d, yyyy")}</TableCell>
                            <TableCell>
                              {date.available ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Available
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  Sponsored
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{date.sponsorName || "None"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleDateSelect(date)}>
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleToggleDateAvailability(date)}>
                                  {date.available ? "Mark Unavailable" : "Mark Available"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setDateToDelete(date._id)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    {editingDate ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Edit Date</CardTitle>
                          <CardDescription>{format(new Date(editingDate.date), "MMMM d, yyyy")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={editingDate.available}
                                onCheckedChange={(checked) => setEditingDate({ ...editingDate, available: checked })}
                              />
                              <span>{editingDate.available ? "Available" : "Unavailable"}</span>
                            </div>
                          </div>

                          {!editingDate.available && (
                            <div className="space-y-2">
                              <Label htmlFor="sponsor-name">Sponsor Name</Label>
                              <Input
                                id="sponsor-name"
                                value={editingDate.sponsorName || ""}
                                onChange={(e) => setEditingDate({ ...editingDate, sponsorName: e.target.value })}
                                placeholder="Enter sponsor name"
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="date-notes">Notes</Label>
                            <Textarea
                              id="date-notes"
                              value={dateNotes}
                              onChange={(e) => setDateNotes(e.target.value)}
                              placeholder="Add notes about this date..."
                              rows={4}
                            />
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingDate(null)
                              setSelectedDate(null)
                              setDateNotes("")
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateDate}>Save Changes</Button>
                        </CardFooter>
                      </Card>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-muted-foreground">
                          <p>Select a date to edit</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Date Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this date from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDate}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Regenerate Dates Confirmation Dialog */}
      <AlertDialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Ramadan Dates</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate dates for Ramadan {settings?.year} based on the start and end dates you've set.
              {dates.length > 0 && (
                <p className="mt-2 font-semibold text-destructive">
                  Warning: This will replace all existing dates for Ramadan {settings?.year}.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerateDates} disabled={generating}>
              {generating ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Generating...
                </>
              ) : (
                "Generate Dates"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import { ImageUpload } from "@/components/ui/image-upload"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import * as z from "zod"
import { eventFormSchema } from "@/lib/validations/event"

interface EventFormProps {
  initialData?: {
    _id?: string
    title: string
    description: string
    date: string
    endDate: string
    location: string
    image: string
    category: string[]
    organizer: string
    contactEmail: string
    additionalDetails: string
    isVisible: boolean
  }
  isEditing?: boolean
}

export default function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      date: initialData?.date || today.toISOString(),
      endDate: initialData?.endDate || tomorrow.toISOString(),
      location: initialData?.location || "",
      category: initialData?.category || [],
      organizer: initialData?.organizer || "",
      contactEmail: initialData?.contactEmail || "",
      image: initialData?.image || "",
      isVisible: initialData?.isVisible ?? true,
      additionalDetails: initialData?.additionalDetails || "",
    },
  })

  const watchedValues = form.watch()

  const handleDateChange = (name: "date" | "endDate", date: Date | undefined) => {
    if (date) {
      form.setValue(name, date.toISOString())
    }
  }

  const handleCategoryChange = (category: string) => {
    const currentCategories = form.getValues("category") || []
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category]
    form.setValue("category", newCategories)
  }

  const onSubmit = async (data: z.infer<typeof eventFormSchema>) => {
    try {
      setIsSubmitting(true)
      const url = isEditing ? `/api/events/${initialData?._id}` : "/api/events"
      
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to save event")
      }

      router.push("/admin/events")
      router.refresh()
    } catch (error) {
      console.error("Error saving event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = ["Worship", "Community", "Education", "Youth", "Charity", "Family", "Other"]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Event" : "Create New Event"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      onRemove={() => field.onChange("")}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={() => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          type="button"
                          variant={watchedValues.category?.includes(category) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleCategoryChange(category)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time</FormLabel>
                    <div className="flex gap-4 flex-wrap md:flex-nowrap">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => handleDateChange("date", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        type="time"
                        value={field.value ? format(new Date(field.value), "HH:mm") : "00:00"}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":")
                          const date = field.value ? new Date(field.value) : new Date()
                          date.setHours(Number(hours), Number(minutes))
                          handleDateChange("date", date)
                        }}
                        className="w-24"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time</FormLabel>
                    <div className="flex gap-4 flex-wrap md:flex-nowrap">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => handleDateChange("endDate", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        type="time"
                        value={field.value ? format(new Date(field.value), "HH:mm") : "00:00"}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":")
                          const date = field.value ? new Date(field.value) : new Date()
                          date.setHours(Number(hours), Number(minutes))
                          handleDateChange("endDate", date)
                        }}
                        className="w-24"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizer</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isVisible"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>Event Visible</FormLabel>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/events")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditing ? "Update Event" : "Create Event"}</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

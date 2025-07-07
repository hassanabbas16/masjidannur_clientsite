"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle, Phone, Mail, User, FileText, MessageSquare, ArrowLeft } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(50, {
      message: "Name must not exceed 50 characters.",
    }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
    message: "Please enter a valid phone number.",
  }),
  heading: z
    .string()
    .min(2, {
      message: "Heading must be at least 2 characters.",
    })
    .max(100, {
      message: "Heading must not exceed 100 characters.",
    }),
  description: z
    .string()
    .min(10, {
      message: "Description must be at least 10 characters.",
    })
    .max(500, {
      message: "Description must not exceed 500 characters.",
    }),
  image: z.string().optional(),
})

export default function BecomeResourcePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [image, setImage] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      heading: "",
      description: "",
      image: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    const googleUrl = process.env.NEXT_PUBLIC_2_GOOGLE_APPS_SCRIPT_WEB_APP_URL

    // Also save to our database for admin management
    const saveToDatabase = async () => {
      try {
        const response = await fetch("/api/resources", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name,
            title: values.heading,
            description: values.description,
            email: values.email,
            phone: values.phone,
            isApproved: false,
            image: values.image,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to save to database")
        }
      } catch (error) {
        console.error("Error saving to database:", error)
        // Continue with Google submission even if database save fails
      }
    }

    // Send to Google Apps Script if URL is available
    const sendToGoogle = async () => {
      if (!googleUrl) {
        console.warn("Google Apps Script URL is not defined")
        return
      }

      const data = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        heading: values.heading,
        description: values.description,
        image: values.image,
      }

      try {
        await fetch(googleUrl, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
      } catch (error) {
        console.error("Error sending to Google:", error)
        // Continue even if Google submission fails
      }
    }

    // Send confirmation emails
    const sendEmails = async () => {
      try {
        const response = await fetch("/api/send-resource-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            phone: values.phone,
            heading: values.heading,
            description: values.description,
          }),
        })

        if (!response.ok) {
          console.error("Failed to send emails")
        }
      } catch (error) {
        console.error("Error sending emails:", error)
        // Continue even if email sending fails
      }
    }

    // Execute all operations
    Promise.all([saveToDatabase(), sendToGoogle(), sendEmails()])
      .then(() => {
        setIsSubmitting(false)
        setIsSubmitted(true)
        toast({
          title: "Resource Submitted",
          description: "Your information has been sent for review.",
          variant: "default",
        })
        form.reset()
      })
      .catch((error) => {
        console.error("Error:", error)
        setIsSubmitting(false)
        toast({
          title: "Error",
          description: "There was an error submitting your resource. Please try again.",
          variant: "destructive",
        })
      })
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
        <section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">Thank You!</h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              Your submission has been received and is pending approval.
            </p>
          </div>
        </section>

        <section className="container px-4 md:px-6 py-12 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-6" />
            <h2 className="text-2xl font-bold mb-4">Submission Successful</h2>
            <p className="text-muted-foreground mb-8">
              We appreciate your interest in becoming a community resource. Our team will review your information and
              get back to you soon.
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/resources">Return to Resources</Link>
            </Button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
      <section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">
            Become a Community Resource
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Share your expertise and support our community. Fill out this form to be listed as a valuable resource.
          </p>
        </div>
      </section>

      <section className="container px-4 md:px-6 py-12 md:py-24">
        <Link href="/resources" className="inline-flex items-center text-green-600 hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Resources
        </Link>

        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Submit Your Resource</CardTitle>
              <CardDescription>
                Provide your details below. Our team will review your submission before publishing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <Input placeholder="Your full name" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <Input type="email" placeholder="your.email@example.com" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <Input placeholder="+1 (555) 000-0000" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="heading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resource Title</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FileText
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <Input placeholder="e.g., Financial Advisor, Arabic Tutor" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description of Services</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
                            <Textarea
                              placeholder="Describe your expertise, services, or how you can help the community"
                              className="min-h-[150px] pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image (Optional)</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value || ""}
                            onChange={(url) => {
                              setImage(url)
                              field.onChange(url)
                            }}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Submit Resource
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}


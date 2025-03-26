"use client"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Mail, Phone, MapPin, Clock, Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
})

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Send to Google Apps Script if URL is available
    const sendToGoogle = async () => {
      const url = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_WEB_APP_URL
      if (!url) {
        console.warn("Google Apps Script URL is not defined")
        return
      }

      const data = {
        name: values.name,
        email: values.email,
        subject: values.subject,
        message: values.message,
        phone: values.phone || "Not provided",
      }

      try {
        await fetch(url, {
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
        const response = await fetch("/api/send-contact-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            phone: values.phone || "Not provided",
            subject: values.subject,
            message: values.message,
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
    Promise.all([sendToGoogle(), sendEmails()])
      .then(() => {
        setIsSubmitting(false)
        toast({
          title: "Message Sent",
          description: "Thank you for your message. We will get back to you soon.",
        })
        form.reset()
      })
      .catch((error) => {
        console.error("Error:", error)
        setIsSubmitting(false)
        toast({
          title: "Error",
          description: "There was an error submitting your message. Please try again.",
        })
      })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative bg-[#0D7A3B] text-white overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">Contact Us</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Get in touch with Masjid AnNoor for inquiries, event bookings, or general information
          </p>
        </div>
      </section>

      <section className="container px-4 md:px-6 py-12 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 grid-cols-1">
          {/* Contact Form */}
          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Your email" {...field} />
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
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Message subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Your message" className="min-h-[150px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="border-0 shadow-elegant overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">Address</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        1800 S. Albert Pike Ave, Fort Smith, AR 72903
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">Phone</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">479-783-2914</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">Email</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">Sunnie.islamic.center@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">Office Hours</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">Monday - Friday: 9:00 AM - 5:00 PM</p>
                      <p className="text-muted-foreground text-xs sm:text-sm">Saturday - Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Maps iframe with Padding */}
            <Card className="border-0 shadow-elegant overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="mapouter" style={{ padding: "20px", overflow: "hidden", margin: "auto" }}>
                  <div className="gmap_canvas" style={{ borderRadius: "10px", overflow: "hidden" }}>
                    <iframe
                      width="100%" // Use percentage to adjust size based on the container width
                      height="500" // Set height as per your design
                      id="gmap_canvas"
                      className="h-64 md:h-96"
                      src="https://maps.google.com/maps?q=Masjid+A1800+S.+Albert+Pike+Ave%2C+Fort+Smith%2C+AR+72903&t=&z=13&ie=UTF8&iwloc=&output=embed"
                      style={{ borderRadius: "10px" }}
                    ></iframe>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}


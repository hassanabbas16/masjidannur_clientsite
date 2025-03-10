  "use client"

  import { useState, useEffect } from "react"
  import { useRouter } from "next/navigation"
  import { zodResolver } from "@hookform/resolvers/zod"
  import { useForm, FormProvider } from "react-hook-form"
  import * as z from "zod"
  import { format } from "date-fns"
  import { Calendar } from "@/components/ui/calendar"
  import { Button } from "@/components/ui/button"
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
  import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
  import { Input } from "@/components/ui/input"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { Badge } from "@/components/ui/badge"
  import { InfoIcon } from "lucide-react"
  import { loadStripe } from "@stripe/stripe-js"
  import { Elements } from "@stripe/react-stripe-js"
  import PaymentForm from "@/components/PaymentForm"

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)



  interface RamadanDate {
    _id: string
    date: Date | string
    available: boolean
    sponsorId: string | null
    sponsorName: string | null
    notes: string
    year: number
  }

  interface RamadanSettings {
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
  }

  export default function SponsorIftarPage() {
    const router = useRouter()
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [ramadanDates, setRamadanDates] = useState<RamadanDate[]>([])
    const [settings, setSettings] = useState<RamadanSettings | null>(null)
    const [clientSecret, setClientSecret] = useState("")
    const [showPaymentForm, setShowPaymentForm] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const formSchema = z.object({
      name: z
        .string()
        .min(2, { message: "Name must be at least 2 characters." })
        .regex(/^[a-zA-Z\s]+$/, "Name must only contain letters and spaces."),
      email: z.string().email({ message: "Please enter a valid email address." }),
      phone: z
        .string()
        .min(10, { message: "Please enter a valid phone number." })
        .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number."),
      amount: z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid amount (e.g., 10 or 10.50)")
        .refine(
          (val) => Number.parseFloat(val) >= (settings?.iftarCost ?? 500),
          (val) => ({
            message: `Amount must be $${settings?.iftarCost ?? 500} or more`,
          })
        ),
      coverFees: z.boolean().default(false),
    })

    const [confirmationDetails, setConfirmationDetails] = useState<{
      name: string
      email: string
      amount: string
      date: Date
    } | null>(null)

    const formMethods = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        email: "",
        phone: "",
        amount: "",
        coverFees: false,
      },
    })

    useEffect(() => {
      fetchSettings()
    }, [])

    useEffect(() => {
      if (settings) {
        fetchDates()
      }
    }, [settings])

    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/ramadan-settings")
        const data = await response.json()

        if (data.startDate) data.startDate = new Date(data.startDate)
        if (data.endDate) data.endDate = new Date(data.endDate)

        setSettings(data)

        if (data.iftarCost) {
          formMethods.setValue("amount", data.iftarCost.toString())
        }
      } catch (error) {
        console.error("Error fetching Ramadan settings:", error)
      }
    }

    const fetchDates = async () => {
      try {
        const response = await fetch(`/api/ramadan-dates?year=${settings?.year}`)
        const data = await response.json()

        data.forEach((date: RamadanDate) => {
          date.date = new Date(date.date)
        })

        setRamadanDates(data)
      } catch (error) {
        console.error("Error fetching Ramadan dates:", error)
      } finally {
        setLoading(false)
      }
    }

    const handleDateSelect = (date: Date | undefined) => {
      if (!date) return

      const selectedDay = ramadanDates.find((day) => new Date(day.date).toDateString() === date.toDateString())

      if (selectedDay && selectedDay.available) {
        setSelectedDate(date)
        setIsDialogOpen(true)
      }
    }

    const calculateTotal = (amount: string) => {
      const donationAmount = Number.parseFloat(amount)
      if (isNaN(donationAmount) || donationAmount <= 0) return 0
      if (!formMethods.watch("coverFees")) return donationAmount
      const totalWithFees = (donationAmount + 0.3) / (1 - 0.029)
      return totalWithFees
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
      if (!selectedDate) return

      setIsSubmitting(true)

      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            donationType: "Iftar Sponsorship",
            amount: values.amount,
            name: values.name,
            email: values.email,
            phone: values.phone,
            anonymous: false,
            coverFees: values.coverFees,
            date: selectedDate.toISOString(),
          }),
        })

        const data = await response.json()

        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
          setIsDialogOpen(false)
          setShowPaymentForm(true)
        } else {
          throw new Error("Failed to create payment intent")
        }
      } catch (error) {
        console.error("Error:", error)
        setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
      }

      setIsSubmitting(false)
    }

    function handlePaymentSuccess() {
      const formValues = formMethods.getValues()
      if (selectedDate) {
        updateDateSponsorship(selectedDate, formValues.name)

        setConfirmationDetails({
          name: formValues.name,
          email: formValues.email,
          amount: formValues.amount,
          date: selectedDate,
        })

        fetch("/api/send-iftar-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formValues.name,
            email: formValues.email,
            amount: formValues.amount,
            date: selectedDate.toISOString(),
          }),
        }).catch((error) => console.error("Failed to send confirmation email:", error))
      }

      formMethods.reset()
      setSelectedDate(undefined)
      setShowPaymentForm(false)
      fetchDates()
    }

    const updateDateSponsorship = async (date: Date, sponsorName: string) => {
      try {
        const selectedDay = ramadanDates.find((day) => new Date(day.date).toDateString() === date.toDateString())

        if (!selectedDay) return

        await fetch(`/api/ramadan-dates/${selectedDay._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...selectedDay,
            available: false,
            sponsorName: sponsorName,
          }),
        })
      } catch (error) {
        console.error("Error updating date sponsorship:", error)
      }
    }

    if (loading) {
      return (
        <div className="flex flex-col min-h-screen">
          <section className="relative bg-[#0D7A3B] text-white overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-5"></div>
            <div className="container relative py-16 md:py-28 flex flex-col items-center text-center px-4">
              <h1 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl max-w-4xl mb-4">
                Sponsor an Iftar
              </h1>
              <p className="text-base md:text-xl text-white/90 max-w-2xl">
                Join us in providing iftar meals for our community during the blessed month of Ramadan
              </p>
            </div>
          </section>
          <div className="container px-4 md:px-6 py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D7A3B]"></div>
          </div>
        </div>
      )
    }

    return (
      <FormProvider {...formMethods}>
        <div className="flex flex-col min-h-screen">
          {/* Hero Section */}
          <section className="relative bg-[#0D7A3B] text-white overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-5"></div>
            <div className="container relative py-16 md:py-28 flex flex-col items-center text-center px-4">
              <h1 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl max-w-4xl mb-4">
                {settings?.heroTitle || "Sponsor an Iftar"}
              </h1>
              <p className="text-base md:text-xl text-white/90 max-w-2xl">
                {settings?.heroSubtitle ||
                  "Join us in providing iftar meals for our community during the blessed month of Ramadan"}
              </p>
            </div>
          </section>

          {/* Main Content */}
          <section className="container px-4 md:px-6 py-12 md:py-24">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                {/* Calendar Card */}
                <Card className="border-0 shadow-elegant overflow-hidden">
                  <CardHeader className="bg-primary text-primary-foreground">
                    <CardTitle className="text-lg md:text-xl">Ramadan {settings?.year} Iftar Sponsorship</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <p className="mb-4 md:mb-6 text-center text-sm md:text-base">
                      Select an available date to sponsor an iftar meal. Sponsored dates show the sponsor's name.
                    </p>

                    <div className="flex justify-center mb-4 md:mb-6">
                      <div className="grid grid-cols-2 gap-2 md:flex md:gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 md:w-4 md:h-4 bg-[#0D7A3B] rounded-full"></div>
                          <span className="text-sm">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-300 rounded-full"></div>
                          <span className="text-sm">Sponsored</span>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto pb-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        className="mx-auto border rounded-md p-2 md:p-4 min-w-[280px]"
                        modifiers={{
                          available: ramadanDates.filter((day) => day.available).map((day) => new Date(day.date)),
                          unavailable: ramadanDates.filter((day) => !day.available).map((day) => new Date(day.date)),
                        }}
                        modifiersClassNames={{
                          available: "bg-[#0D7A3B]/20 hover:bg-[#0D7A3B]/40 relative",
                          unavailable: "bg-gray-200 text-gray-500 cursor-not-allowed",
                        }}
                        fromDate={settings?.startDate ? new Date(settings.startDate) : undefined}
                        toDate={settings?.endDate ? new Date(settings.endDate) : undefined}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Sponsored Days Card */}
                <Card className="border-0 shadow-elegant overflow-hidden">
                  <CardHeader className="bg-primary text-primary-foreground">
                    <CardTitle className="text-lg md:text-xl">Already Sponsored Days</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-3">
                      {ramadanDates
                        .filter((day) => !day.available)
                        .map((day) => (
                          <div key={day._id} className="flex flex-col xs:flex-row justify-between items-start gap-2">
                            <span className="text-sm">{format(new Date(day.date), "MMM d, yyyy")}</span>
                            <Badge variant="secondary" className="text-xs md:text-sm">
                              {day.sponsorName}
                            </Badge>
                          </div>
                        ))}

                      {ramadanDates.filter((day) => !day.available).length === 0 && (
                        <p className="text-center text-muted-foreground text-sm">
                          No sponsored days yet. Be the first to sponsor!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="border-0 shadow-elegant overflow-hidden">
                  <CardHeader className="bg-primary text-primary-foreground">
                    <CardTitle className="text-lg md:text-xl">
                      {settings?.aboutTitle || "About Iftar Sponsorship"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-3">
                      <p className="text-sm md:text-base">
                        {settings?.aboutDescription ||
                          "Sponsoring an iftar is a beautiful way to contribute to our community during the blessed month of Ramadan. Your generosity helps provide a nutritious meal for those breaking their fast at the masjid."}
                      </p>

                      {settings?.additionalInfo &&
                        settings.additionalInfo.map((info, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <InfoIcon className="h-4 w-4 mt-0.5 text-primary" />
                            <p className="text-xs md:text-sm">{info}</p>
                          </div>
                        ))}

                      {(!settings?.additionalInfo || settings?.additionalInfo?.length === 0) && (
                        <>
                          <div className="flex items-start gap-2">
                            <InfoIcon className="h-4 w-4 mt-0.5 text-primary" />
                            <p className="text-xs md:text-sm">
                              The cost to sponsor an iftar is ${settings?.iftarCost || 500}, which covers food and drinks
                              for approximately {settings?.iftarCapacity || 100} people.
                            </p>
                          </div>

                          <div className="flex items-start gap-2">
                            <InfoIcon className="h-4 w-4 mt-0.5 text-primary" />
                            <p className="text-xs md:text-sm">
                              Sponsors are welcome to attend the iftar they've sponsored and may bring family members to
                              help serve the meal.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-elegant overflow-hidden bg-secondary">
                  <CardContent className="p-4 md:p-6">
                    <h3 className="text-lg font-heading font-bold mb-2">Questions?</h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                      If you have any questions about sponsoring an iftar, please don't hesitate to contact us.
                    </p>
                    <Button className="w-full text-sm" onClick={() => (window.location.href = "/contact")}>
                      Contact Us
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Sponsorship Form Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-[95vw] rounded-lg sm:max-w-md md:max-w-lg w-full">
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl">Sponsor Iftar</DialogTitle>
                <DialogDescription className="text-sm">
                  {selectedDate && (
                    <span>
                      You are sponsoring iftar for{" "}
                      <span className="font-medium text-foreground">
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <Form {...formMethods}>
                <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4 grid-cols-1">
                    <FormField
                      control={formMethods.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" className="text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formMethods.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" className="text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formMethods.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(479) 123-4567" className="text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formMethods.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Amount ($)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                min={settings?.iftarCost || 500}
                                placeholder={(settings?.iftarCost || 500).toString()}
                                className="pl-8 text-sm"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formMethods.control}
                      name="coverFees"
                      render={({ field }) => {
                        const baseAmount = Number.parseFloat(formMethods.watch("amount") || "0")
                        const withFees = baseAmount > 0 ? (baseAmount + 0.3) / (1 - 0.029) : 0
                        const feesAmount = withFees - baseAmount

                        return (
                          <FormItem className="space-y-4 pt-2 pb-2">
                            <div className="bg-secondary/50 p-3 rounded-lg border border-border/50">
                              <div className="flex items-start gap-3">
                                <div className="flex h-5 items-center">
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                      checked={field.value}
                                      onChange={(e) => field.onChange(e.target.checked)}
                                      id="cover-fees"
                                    />
                                  </FormControl>
                                </div>
                                <div className="flex-1">
                                  <FormLabel htmlFor="cover-fees" className="text-sm font-medium cursor-pointer">
                                    Cover Transaction Fees
                                  </FormLabel>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Stripe charges 2.9% + $0.30 per transaction.
                                  </p>
                                </div>
                              </div>

                              {baseAmount > 0 && (
                                <div className="mt-3 space-y-2 text-xs">
                                  <div className="flex justify-between">
                                    <span>Base donation:</span>
                                    <span className="font-medium">${baseAmount.toFixed(2)}</span>
                                  </div>
                                  {field.value && (
                                    <>
                                      <div className="flex justify-between text-muted-foreground">
                                        <span>Transaction fees:</span>
                                        <span>+${feesAmount.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between font-medium pt-2 border-t">
                                        <span>Total amount:</span>
                                        <span className="text-primary">${withFees.toFixed(2)}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )
                      }}
                    />
                  </div>

                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-sm px-4 py-2"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#0D7A3B] hover:bg-[#0A6331] text-sm px-4 py-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          Processing...
                        </span>
                      ) : (
                        "Proceed to Payment"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Payment Form Dialog */}
          {showPaymentForm && clientSecret && (
            <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
              <DialogContent className="max-w-[95vw] rounded-lg sm:max-w-md md:max-w-lg w-full">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl">Complete Payment</DialogTitle>
                  <DialogDescription className="text-sm">
                    Please complete your payment to confirm sponsorship.
                  </DialogDescription>
                </DialogHeader>

                <div className="bg-secondary/50 p-3 rounded-lg border border-border/50 mb-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Sponsorship amount:</span>
                      <span className="font-medium">
                        ${Number.parseFloat(formMethods.getValues().amount || "0").toFixed(2)}
                      </span>
                    </div>
                    {formMethods.getValues().coverFees && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Transaction fees:</span>
                        <span>
                          +$
                          {(
                            calculateTotal(formMethods.getValues().amount) -
                            Number.parseFloat(formMethods.getValues().amount || "0")
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Total payment:</span>
                      <span className="text-primary">${calculateTotal(formMethods.getValues().amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs" role="alert">
                    {errorMessage}
                  </div>
                )}

                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm setErrorMessage={setErrorMessage} onPaymentSuccess={handlePaymentSuccess} />
                </Elements>
              </DialogContent>
            </Dialog>
          )}

          {/* Success Confirmation */}
          {confirmationDetails && (
            <Dialog open={!!confirmationDetails} onOpenChange={() => setConfirmationDetails(null)}>
              <DialogContent className="max-w-[95vw] rounded-lg sm:max-w-md md:max-w-lg w-full">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl text-green-600">Confirmed!</DialogTitle>
                  <DialogDescription className="text-sm">
                    Thank you for your generous sponsorship.
                  </DialogDescription>
                </DialogHeader>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium">Date:</span>
                      <span>
                        {confirmationDetails.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Sponsor:</span>
                      <span>{confirmationDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Amount:</span>
                      <span>${Number.parseFloat(confirmationDetails.amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mb-4">
                  Confirmation sent to {confirmationDetails.email}
                </p>

                <DialogFooter>
                  <Button onClick={() => setConfirmationDetails(null)} className="w-full text-sm px-4 py-2">
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </FormProvider>
    )
  }
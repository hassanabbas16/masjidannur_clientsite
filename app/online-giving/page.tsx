"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import PaymentForm from "@/components/PaymentForm"
import { parsePhoneNumberWithError } from "libphonenumber-js"
import { ArrowLeft, ArrowRight, Heart, DollarSign, Mail, User, CheckCircle2, Phone } from "lucide-react"
import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface DonationType {
  _id: string
  name: string
  description: string
  isActive: boolean
  icon: string
}

interface PaymentIntentResponse {
  clientSecret: string
}

interface ConfirmationDetails {
  amount: number
  name: string
  email: string
  donationType: string
}

const formSchema = z
  .object({
    donationType: z.string({
      required_error: "Please select a donation type.",
    }),
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid amount (e.g., 10 or 10.50)"),
    name: z.string().optional(),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.string().refine(
  (value) => {
    const phoneRegex = /^[+]?[0-9\s()-]*$/; // Allow numbers with optional spaces, parentheses, and country code (+)
    return phoneRegex.test(value); // Test the value against the regex
  },
  {
    message: "Please enter a valid phone number. Example: 123-456-7890 or +1 123 456 7890.",
  }
),
    
    anonymous: z.boolean().default(false),
    coverFees: z.boolean().default(true),
  })
  .refine((data) => data.anonymous || (data.name && data.name.trim() !== ""), {
    message: "Name is required if not anonymous",
    path: ["name"],
  })

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

export default function OnlineGivingPage() {
  const [step, setStep] = useState(1)
  const [clientSecret, setClientSecret] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [confirmationDetails, setConfirmationDetails] = useState<ConfirmationDetails | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      name: "",
      email: "",
      phone: "",
      anonymous: false,
      coverFees: true,
    },
  })

  useEffect(() => {
    const fetchDonationTypes = async () => {
      try {
        const response = await fetch("/api/donation-types")
        if (response.ok) {
          let data: DonationType[] = await response.json()
          // Filter only active donation types
          data = data.filter((donationType) => donationType.isActive)
          setDonationTypes(data)
          if (data.length > 0) {
            form.setValue("donationType", data[0].name)
          }
        } else {
          console.error("Failed to fetch donation types")
        }
      } catch (error) {
        console.error("Error fetching donation types:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDonationTypes()
  }, [form])

  const handleNextStep1 = async () => {
    const isValid = await form.trigger(["donationType", "amount"])
    if (isValid) setStep(2)
  }

  const calculateTotal = (amount: string) => {
    const donationAmount = Number.parseFloat(amount)
    if (isNaN(donationAmount) || donationAmount <= 0) return 0
    if (!form.watch("coverFees")) return donationAmount
    const totalWithFees = (donationAmount + 0.3) / (1 - 0.029)
    return totalWithFees
  }

  const calculateFees = (amount: string) => {
    const donationAmount = Number.parseFloat(amount)
    if (isNaN(donationAmount) || donationAmount <= 0) return 0
    const totalWithFees = calculateTotal(amount)
    return totalWithFees - donationAmount
  }

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    if (step === 2) {
      try {
        setSubmitting(true)
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (response.status === 429) {
          toast.error("Too many payment attempts. Please wait 5 minutes before trying again.")
          return
        }

        if (!response.ok) throw new Error("Error processing the payment. Please try again.")

        const responseData: PaymentIntentResponse = await response.json()
        if (!responseData.clientSecret) throw new Error("Invalid response from payment API.")

        setClientSecret(responseData.clientSecret)
        setStep(3)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred. Please try again.")
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const response = await fetch(`/api/payment-status?payment_intent=${paymentIntentId}`)
      const data = await response.json()

      if (data.status === "succeeded") {
        // Get the donation amount
        const amount = calculateTotal(form.getValues("amount")).toFixed(2)

        // Redirect to the confirmation page with payment intent and amount
        window.location.href = `/donation-confirmation?payment_intent=${paymentIntentId}&amount=${amount}`
      } else {
        setErrorMessage("Payment was not successful. Please try again.")
      }
    } catch (error) {
      console.error("Error verifying payment:", error)
      setErrorMessage("An error occurred while processing your payment.")
    }
  }

  // Handle dialog close - reset form and return to step 1
  const handleConfirmationClose = () => {
    setConfirmationDetails(null)
    form.reset()
    setStep(1)
    setClientSecret("")
  }

  const donationTypeIcons = {
    DollarSign: <DollarSign className="h-5 w-5 text-emerald-600" />,
    Heart: <Heart className="h-5 w-5 text-rose-600" />,
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section - Matching the prayer times page */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white overflow-hidden py-20">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">
            Support Our Mission
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Your generosity helps us continue our work and make a difference in our community.
          </p>
        </div>
      </section>

      <div className="container px-4 md:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="relative mb-8">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= i ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                    } mb-2`}
                  >
                    {i}
                  </div>
                  <span className={`text-xs ${step >= i ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                    {i === 1 ? "Donation" : i === 2 ? "Details" : "Payment"}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px] bg-muted -z-10">
              <div
                className={`h-full bg-green-600 transition-all duration-300 ${
                  step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"
                }`}
              ></div>
            </div>
          </div>

          <Card className="shadow-lg border-slate-200">
            <CardHeader className="pb-4 bg-green-50">
              <CardTitle className="text-2xl text-green-800">
                {step === 1
                  ? "Choose Donation Type & Amount"
                  : step === 2
                    ? "Your Information"
                    : "Complete Your Donation"}
              </CardTitle>
              <CardDescription>
                {step === 1
                  ? "Select where you would like your donation to go"
                  : step === 2
                    ? "Tell us a bit about yourself"
                    : "Secure payment processing"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {step === 1 && (
                    <>
                      <FormField
                        control={form.control}
                        name="donationType"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="text-base font-medium">Donation Type</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-1 md:grid-cols-2 gap-3"
                              >
                                {donationTypes.map((type) => (
                                  <FormItem key={type._id} className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value={type.name} id={type.name} className="peer sr-only" />
                                    </FormControl>
                                    <label
                                      htmlFor={type.name}
                                      className={`flex items-center justify-between w-full p-4 bg-white border rounded-lg cursor-pointer transition-all ${
                                        field.value === type.name
                                          ? "border-green-600 ring-2 ring-offset-2 ring-green-600/50 bg-green-50"
                                          : "border-slate-200 hover:bg-slate-50"
                                      }`}
                                    >
                                      <div className="flex items-center">
                                        <div className="mr-3">
                                          {donationTypeIcons[type.icon as keyof typeof donationTypeIcons] ||
                                            donationTypeIcons["DollarSign"]}
                                        </div>
                                        <div className="font-medium">{type.name}</div>
                                      </div>
                                      <CheckCircle2
                                        className={`h-5 w-5 text-green-600 ${
                                          field.value === type.name ? "opacity-100" : "opacity-0"
                                        }`}
                                      />
                                    </label>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Amount ($)</FormLabel>
                            <div className="grid grid-cols-4 gap-2 mb-3">
                              {["10", "25", "50", "100"].map((amount) => (
                                <Button
                                  key={amount}
                                  type="button"
                                  variant={field.value === amount ? "default" : "outline"}
                                  onClick={() => form.setValue("amount", amount)}
                                  className={`h-12 ${field.value === amount ? "bg-green-600 hover:bg-green-700" : ""}`}
                                >
                                  ${amount}
                                </Button>
                              ))}
                            </div>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <span className="text-slate-500">$</span>
                                </div>
                                <Input placeholder="Other amount" {...field} className="pl-8 h-12" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end pt-4">
                        <Button
                          type="button"
                          onClick={handleNextStep1}
                          className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                          disabled={!form.watch("donationType") || !form.watch("amount")}
                        >
                          Continue to Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="bg-green-50 p-4 rounded-lg mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-600">Selected donation:</span>
                          <span className="font-medium">{form.watch("donationType")}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Amount:</span>
                          <span className="font-medium">{formatCurrency(Number(form.watch("amount")))}</span>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="anonymous"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-base">Make this donation anonymous</FormLabel>
                              <p className="text-sm text-muted-foreground">Your name will not be displayed publicly</p>
                            </div>
                          </FormItem>
                        )}
                      />

                      {!form.watch("anonymous") && (
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <User className="h-4 w-4 text-slate-500" />
                                  </div>
                                  <Input placeholder="Your name" {...field} className="pl-10" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <Mail className="h-4 w-4 text-slate-500" />
                                </div>
                                <Input placeholder="your.email@example.com" {...field} className="pl-10" />
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
                            <FormLabel className="text-base font-medium">Phone</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <Phone className="h-4 w-4 text-slate-500" />
                                </div>
                                <Input placeholder="123-456-7890" {...field} className="pl-10" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="coverFees"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-base">Cover transaction fees (2.9% + $0.30)</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                This allows us to receive your full donation amount
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-700">Your donation:</span>
                          <span className="font-medium">{formatCurrency(Number(form.watch("amount")))}</span>
                        </div>

                        {form.watch("coverFees") && (
                          <>
                            <div className="flex justify-between items-center mb-2 text-sm text-slate-600">
                              <span>Processing fees:</span>
                              <span>{formatCurrency(calculateFees(form.watch("amount")))}</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between items-center font-medium">
                              <span>Total charge:</span>
                              <span className="text-lg">{formatCurrency(calculateTotal(form.watch("amount")))}</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="w-full xs:w-auto justify-center xs:justify-start"
                        >
                          <ArrowLeft className="mr-1 xs:mr-2 h-4 w-4 shrink-0" />
                          <span className="truncate">Back</span>
                        </Button>

                        <Button
                          type="submit"
                          disabled={submitting}
                          className="w-full xs:w-auto justify-center xs:justify-end bg-green-600 hover:bg-green-700"
                        >
                          <span className="truncate">{submitting ? "Processing..." : "Proceed to Payment"}</span>
                          <ArrowRight className="ml-1 xs:ml-2 h-4 w-4 shrink-0" />
                        </Button>
                      </div>
                    </>
                  )}

                  {step === 3 && clientSecret && (
                    <>
                      <div className="bg-green-50 p-4 rounded-lg mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-600">Donation type:</span>
                          <span className="font-medium">{form.watch("donationType")}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-600">Amount:</span>
                          <span className="font-medium">{formatCurrency(Number(form.watch("amount")))}</span>
                        </div>
                        {form.watch("coverFees") && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-600">Processing fees:</span>
                            <span className="text-sm">{formatCurrency(calculateFees(form.watch("amount")))}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 mt-2 flex justify-between items-center font-medium">
                          <span>Total:</span>
                          <span className="text-lg">{formatCurrency(calculateTotal(form.watch("amount")))}</span>
                        </div>
                      </div>

                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PaymentForm setErrorMessage={setErrorMessage} onPaymentSuccess={handlePaymentSuccess} />
                      </Elements>

                      <Button type="button" variant="outline" onClick={() => setStep(2)} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Details
                      </Button>
                    </>
                  )}

                  {errorMessage && step !== 3 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm" role="alert">
                      <div className="flex">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 flex-shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        {errorMessage}
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-slate-500">
            <p>Need help? Contact our support team at info@emergitechsolutions.com</p>
            <p className="mt-2">© {new Date().getFullYear()} Masjid Annoor. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Success Confirmation Dialog */}
      {confirmationDetails && (
        <Dialog open={!!confirmationDetails} onOpenChange={handleConfirmationClose}>
          <DialogContent className="max-w-[95vw] rounded-lg sm:max-w-md md:max-w-lg w-full">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl text-green-600">Thank You!</DialogTitle>
              <DialogDescription className="text-sm">Your donation has been successfully processed.</DialogDescription>
            </DialogHeader>

            <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-medium">Donation type:</span>
                  <span>{confirmationDetails.donationType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Donor:</span>
                  <span>{confirmationDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span>{formatCurrency(confirmationDetails.amount)}</span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mb-4">
              A receipt has been sent to {confirmationDetails.email}
            </p>

            <DialogFooter>
              <Button
                onClick={handleConfirmationClose}
                className="w-full text-sm px-4 py-2 bg-green-600 hover:bg-green-700"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}


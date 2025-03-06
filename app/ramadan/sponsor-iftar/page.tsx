"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "@/components/PaymentForm";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Define the form schema for validation
const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .regex(/^[a-zA-Z\s]+$/, "Name must only contain letters and spaces."), // Ensuring the name contains only letters and spaces.
  
  email: z
    .string()
    .email({ message: "Please enter a valid email address." }),

    phone: z
    .string()
    .min(13, { message: "Please enter a valid phone number." })
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number, including country code."),
  

  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid amount (e.g., 10 or 10.50)")
    .refine((val) => Number.parseFloat(val) >= 500, {
      message: "Amount must be $500 or more",
    }),

  coverFees: z
    .boolean()
    .default(false),
});

// Sample Ramadan days for 2025 (March 2025, adjust as needed)
const ramadanDays = [
  { date: new Date(2025, 2, 11), available: true, sponsor: null },
  { date: new Date(2025, 2, 12), available: true, sponsor: null },
  { date: new Date(2025, 2, 13), available: true, sponsor: null },
  { date: new Date(2025, 2, 14), available: true, sponsor: null },
  { date: new Date(2025, 2, 15), available: true, sponsor: null },
  { date: new Date(2025, 2, 16), available: false, sponsor: "Ahmed Family" },
  { date: new Date(2025, 2, 17), available: false, sponsor: "Ali Family" },
  { date: new Date(2025, 2, 18), available: true, sponsor: null },
  { date: new Date(2025, 2, 19), available: true, sponsor: null },
  { date: new Date(2025, 2, 20), available: true, sponsor: null },
  // Add more days as needed for the full month
];

export default function SponsorIftarPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sponsoredDays, setSponsoredDays] = useState(ramadanDays);
  const [clientSecret, setClientSecret] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [confirmationDetails, setConfirmationDetails] = useState<
    { name: string; email: string; amount: string; date: Date } | null
  >(null);

  // Initialize the form with default values and validation
  const formMethods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      amount: "",
      coverFees: false,
    },
  });

  // Handle date selection from the calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const selectedDay = sponsoredDays.find((day) => day.date.toDateString() === date.toDateString());
    if (selectedDay && selectedDay.available) {
      setSelectedDate(date);
      setIsDialogOpen(true);
    }
  };

  // Calculate total amount including fees if selected
  const calculateTotal = (amount: string) => {
    const donationAmount = Number.parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) return 0;
    if (!formMethods.watch("coverFees")) return donationAmount;
    const totalWithFees = (donationAmount + 0.3) / (1 - 0.029); // Stripe fee calculation
    return totalWithFees;
  };

  // Handle form submission and API call
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedDate) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: values.amount,
          email: values.email,
          name: values.name,
          phone:values.phone,
          donationType: "Iftar Sponsorship",
          coverFees: values.coverFees,
          date: selectedDate.toISOString(), // Included for potential future use
        }),
      });

      const data = await response.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setIsDialogOpen(false);
        setShowPaymentForm(true);
      } else {
        throw new Error("Failed to create payment intent");
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setIsSubmitting(false);
  }

  function handlePaymentSuccess() {
    const formValues = formMethods.getValues();
    if (selectedDate) {
      // Update sponsored days (existing logic)
      setSponsoredDays((prevDays) =>
        prevDays.map((day) =>
          day.date.toDateString() === selectedDate.toDateString()
            ? { ...day, available: false, sponsor: formValues.name }
            : day
        )
      );
      // Set confirmation details for display
      setConfirmationDetails({
        name: formValues.name,
        email: formValues.email,
        amount: formValues.amount,
        date: selectedDate,
      });
      // Send confirmation email via API
      fetch('/api/send-donation-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formValues.name,
          email: formValues.email,
          amount: formValues.amount,
          date: selectedDate.toISOString(),
        }),
      }).catch((error) => console.error('Failed to send confirmation email:', error));
    }
    // Reset form and close payment dialog (existing logic)
    formMethods.reset();
    setSelectedDate(undefined);
    setShowPaymentForm(false);
  }

  return (
    <FormProvider {...formMethods}>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-[#0D7A3B] text-white overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-5"></div>
          <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">
              Sponsor an Iftar
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              Join us in providing iftar meals for our community during the blessed month of Ramadan
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="container px-4 md:px-6 py-12 md:py-24">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="md:col-span-2 space-y-8">
              {/* Calendar Card */}
              <Card className="border-0 shadow-elegant overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle>Ramadan 2025 Iftar Sponsorship</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="mb-6 text-center">
                    Select an available date to sponsor an iftar meal for the community. Days with a sponsor already
                    assigned will show the sponsor's name.
                  </p>

                  <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#0D7A3B] rounded-full"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <span>Sponsored</span>
                      </div>
                    </div>
                  </div>

                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="mx-auto border rounded-md p-4"
                    modifiers={{
                      available: sponsoredDays.filter((day) => day.available).map((day) => day.date),
                      unavailable: sponsoredDays.filter((day) => !day.available).map((day) => day.date),
                    }}
                    modifiersClassNames={{
                      available: "bg-[#0D7A3B]/20 hover:bg-[#0D7A3B]/40 relative",
                      unavailable: "bg-gray-200 text-gray-500 cursor-not-allowed",
                    }}
                  />
                </CardContent>
              </Card>

              {/* Sponsored Days Card */}
              <Card className="border-0 shadow-elegant overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle>Already Sponsored Days</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {sponsoredDays
                      .filter((day) => !day.available)
                      .map((day) => (
                        <div key={day.date.toISOString()} className="flex justify-between items-center">
                          <span>{format(day.date, "MMMM d, yyyy")}</span>
                          <Badge variant="secondary">{day.sponsor}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <Card className="border-0 shadow-elegant overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle>About Iftar Sponsorship</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p>
                      Sponsoring an iftar is a beautiful way to contribute to our community during the blessed month of
                      Ramadan. Your generosity helps provide a nutritious meal for those breaking their fast at the
                      masjid.
                    </p>
                    <div className="flex items-start gap-2">
                      <InfoIcon className="h-5 w-5 mt-0.5 text-primary" />
                      <p className="text-sm">
                        The cost to sponsor an iftar is $500, which covers food and drinks for approximately 100 people.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <InfoIcon className="h-5 w-5 mt-0.5 text-primary" />
                      <p className="text-sm">
                        Sponsors are welcome to attend the iftar they've sponsored and may bring family members to help
                        serve the meal.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant overflow-hidden bg-secondary">
                <CardContent className="p-6">
                  <h3 className="text-xl font-heading font-bold mb-2">Questions?</h3>
                  <p className="text-muted-foreground mb-4">
                    If you have any questions about sponsoring an iftar, please don't hesitate to contact us.
                  </p>
                  <Button className="w-full" onClick={() => (window.location.href = "/contact")}>
                    Contact Us
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Sponsorship Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md md:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Sponsor Iftar</DialogTitle>
              <DialogDescription>
                {selectedDate && (
                  <span>
                    You are sponsoring iftar for{" "}
                    <span className="font-medium text-foreground">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <Form {...formMethods}>
              <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={formMethods.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name or family name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formMethods.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={formMethods.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(479) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formMethods.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Donation Amount ($)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input type="number" step="0.01" min="500" placeholder="500.00" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formMethods.control}
                  name="coverFees"
                  render={({ field }) => {
                    const baseAmount = Number.parseFloat(formMethods.watch("amount") || "0");
                    const withFees = baseAmount > 0 ? (baseAmount + 0.3) / (1 - 0.029) : 0;
                    const feesAmount = withFees - baseAmount;

                    return (
                      <FormItem className="space-y-4 pt-2 pb-2">
                        <div className="bg-secondary/50 p-4 rounded-lg border border-border/50">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex h-5 items-center">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  checked={field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  ref={field.ref}
                                  id="cover-fees"
                                />
                              </FormControl>
                            </div>
                            <div className="flex-1">
                              <FormLabel htmlFor="cover-fees" className="text-base font-medium cursor-pointer">
                                Cover Transaction Fees
                              </FormLabel>
                              <p className="text-sm text-muted-foreground mt-1">
                                Stripe charges 2.9% + $0.30 per transaction. Cover these fees so 100% of your donation
                                goes to the iftar.
                              </p>
                            </div>
                          </div>

                          {baseAmount > 0 && (
                            <div className="mt-3 space-y-2 text-sm">
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
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#0D7A3B] hover:bg-[#0A6331]" disabled={isSubmitting}>
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
            <DialogContent className="sm:max-w-md md:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl">Complete Your Iftar Sponsorship</DialogTitle>
                <DialogDescription>Please complete your payment to confirm your iftar sponsorship.</DialogDescription>
              </DialogHeader>

              <div className="bg-secondary/50 p-4 rounded-lg border border-border/50 mb-4">
                <div className="space-y-2 text-sm">
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
                          calculateTotal(formMethods.getValues().amount) - Number.parseFloat(formMethods.getValues().amount || "0")
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
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600" role="alert">
                  {errorMessage}
                </div>
              )}

              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm setErrorMessage={setErrorMessage} onPaymentSuccess={handlePaymentSuccess} />
              </Elements>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </FormProvider>
  );
}

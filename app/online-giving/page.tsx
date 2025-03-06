"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "@/components/PaymentForm";
import { ArrowLeft, ArrowRight, Heart, DollarSign, Mail, User, CheckCircle2 } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const formSchema = z.object({
  donationType: z.enum(["Zakat-ul-Maal", "Sadaqah", "General Fund", "Prison Dawah"], {
    required_error: "Please select a donation type.",
  }),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid amount (e.g., 10 or 10.50)"),
  name: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z
  .string()
  .optional()
  .refine(
    (value) => !value || /^\d{3}[-\s]?\d{3}[-\s]?\d{4}$/.test(value),
    { message: "Please enter a valid phone number (e.g., 123-456-7890)" }
  ),
  anonymous: z.boolean().default(false),
  coverFees: z.boolean().default(false),
}).refine((data) => data.anonymous || (data.name && data.name.trim() !== ""), {
  message: "Name is required if not anonymous",
  path: ["name"],
});

  

export default function OnlineGivingPage() {
  const [step, setStep] = useState(1);
  const [clientSecret, setClientSecret] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      name: "",
      email: "",
      anonymous: false,
      coverFees: true,
    },
  });

  const handleNextStep1 = async () => {
    const isValid = await form.trigger(["donationType", "amount"]);
    if (isValid) setStep(2);
  };

  const calculateTotal = (amount: string) => {
    const donationAmount = Number.parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) return 0;
    if (!form.watch("coverFees")) return donationAmount;
    const totalWithFees = (donationAmount + 0.3) / (1 - 0.029);
    return totalWithFees;
  };

  const calculateFees = (amount: string) => {
    const donationAmount = Number.parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) return 0;
    const totalWithFees = calculateTotal(amount);
    return totalWithFees - donationAmount;
  };
  const handlePaymentSuccess = async () => {
    try {
      // Assume `form` has all necessary data
      const formValues = form.getValues();
  
      // Send the donation confirmation details to your server or email service
      await fetch("/api/send-donation-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donationType: formValues.donationType,
          amount: formValues.amount,
          name: formValues.name,
          email: formValues.email,
          anonymous: formValues.anonymous,
          coverFees: formValues.coverFees,
        }),
      });
  
      // Optionally, you can display a success message or update UI to indicate the donation was successful
      setStep(4); // This will allow you to display a "Thank You" page or confirmation view.
    } catch (error) {
      console.error("Error during payment success handling:", error);
      setErrorMessage("There was an error processing your donation. Please try again later.");
    }
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (step === 2) {
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!response.ok) throw new Error("Error processing the payment. Please try again.");
        const data = await response.json();
        if (!data.clientSecret) throw new Error("Invalid response from payment API.");

        setClientSecret(data.clientSecret);
        setStep(3);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred. Please try again.");
      }
    }
  }

  const donationTypeIcons = {
    "Zakat-ul-Maal": <DollarSign className="h-5 w-5 text-emerald-600" />,
    Sadaqah: <Heart className="h-5 w-5 text-rose-600" />,
    "General Fund": <DollarSign className="h-5 w-5 text-blue-600" />,
    "Prison Dawah": <Heart className="h-5 w-5 text-purple-600" />,
  };


  return (
    <div className="container px-4 md:px-6 py-12 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-slate-900">Support Our Mission</h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            Your generosity helps us continue our work and make a difference in our community.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  } mb-2`}
                >
                  {i}
                </div>
                <span className={`text-xs ${step >= i ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {i === 1 ? "Donation" : i === 2 ? "Details" : "Payment"}
                </span>
              </div>
            ))}
            <div
              className={`h-1 w-24 ${step >= 2 ? "bg-primary" : "bg-muted"} absolute left-1/2 -translate-x-24 top-5 -z-10`}
            ></div>
            <div
              className={`h-1 w-24 ${step >= 3 ? "bg-primary" : "bg-muted"} absolute left-1/2 translate-x-0 top-5 -z-10`}
            ></div>
          </div>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">
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
          <CardContent>
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
                              {["Zakat-ul-Maal", "Sadaqah", "General Fund", "Prison Dawah"].map((option) => (
                                <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value={option} id={option} className="peer sr-only" />
                                  </FormControl>
                                  <label
                                    htmlFor={option}
                                    className={`flex items-center justify-between w-full p-4 bg-white border rounded-lg cursor-pointer transition-all ${
                                      field.value === option
                                        ? "border-primary ring-2 ring-offset-2 ring-primary/50 bg-primary/5"
                                        : "border-slate-200 hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <div className="mr-3">
                                        {donationTypeIcons[option as keyof typeof donationTypeIcons]}
                                      </div>
                                      <div className="font-medium">{option}</div>
                                    </div>
                                    <CheckCircle2
                                      className={`h-5 w-5 text-primary ${
                                        field.value === option ? "opacity-100" : "opacity-0"
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
                                className="h-12"
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
                        className="w-full sm:w-auto"
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
                    <div className="bg-slate-50 p-4 rounded-lg mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Selected donation:</span>
                        <span className="font-medium">{form.watch("donationType")}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Amount:</span>
                        <span className="font-medium">${form.watch("amount")}</span>
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
                              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
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
                      name="coverFees"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
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

                    <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-700">Your donation:</span>
                        <span className="font-medium">${form.watch("amount")}</span>
                      </div>

                      {form.watch("coverFees") && (
                        <>
                          <div className="flex justify-between items-center mb-2 text-sm text-slate-600">
                            <span>Processing fees:</span>
                            <span>${calculateFees(form.watch("amount")).toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-2 mt-2 flex justify-between items-center font-medium">
                            <span>Total charge:</span>
                            <span className="text-lg">${calculateTotal(form.watch("amount")).toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button type="submit">
                        Proceed to Payment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}

                {step === 3 && clientSecret && (
                  <>
                    <div className="bg-slate-50 p-4 rounded-lg mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Donation type:</span>
                        <span className="font-medium">{form.watch("donationType")}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Amount:</span>
                        <span className="font-medium">${form.watch("amount")}</span>
                      </div>
                      {form.watch("coverFees") && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-600">Processing fees:</span>
                          <span className="text-sm">${calculateFees(form.watch("amount")).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 mt-2 flex justify-between items-center font-medium">
                        <span>Total:</span>
                        <span className="text-lg">${calculateTotal(form.watch("amount")).toFixed(2)}</span>
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
          <p>Need help? Contact our support team at support@example.com</p>
          <p className="mt-2">© {new Date().getFullYear()} Your Organization. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";

export default function DonationConfirmationPage() {
  const [status, setStatus] = useState<"success" | "pending" | "failed" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState<string | null>(null);
  const [donationType, setDonationType] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const paymentIntentId = searchParams.get("payment_intent");
    const donationAmount = searchParams.get("amount");

    if (donationAmount) {
      setAmount(donationAmount);
    }

    if (!paymentIntentId) {
      setStatus("failed");
      setIsLoading(false);
      return;
    }

    async function fetchPaymentStatus(paymentIntentId: string) {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/payment-status?payment_intent=${paymentIntentId}`);
        if (!res.ok) throw new Error("Failed to fetch payment status");
        const data = await res.json();

        if (data.metadata) {
          if (data.metadata.donationType === "Iftar Sponsorship" && data.metadata.date) {
            setDonationType(
              `Iftar Sponsorship for ${new Date(data.metadata.date).toLocaleDateString()}`
            );
          } else {
            setDonationType(data.metadata.donationType || "General Donation");
          }
        }

        if (!amount && data.amount_received) {
          setAmount(data.amount_received.toFixed(2));
        }

        if (data.status === "succeeded") {
          setStatus("success");
        } else if (data.status === "processing" || data.status === "requires_capture") {
          setStatus("pending");
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Error fetching payment status:", error);
        setStatus("failed");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPaymentStatus(paymentIntentId);
  }, [searchParams, amount]);

  const backLink = donationType === "Iftar Sponsorship" ? "/ramadan/sponsor-iftar" : "/online-giving";
  const backText = donationType === "Iftar Sponsorship" ? "Sponsor Iftar" : "Online Giving";
  const statusConfig = {
    success: {
      icon: <CheckCircle className="w-16 h-16 text-green-500 mb-4" />,
      title: "Thank You for Your Donation!",
      description:
        "Your generosity makes a difference. We've received your donation and truly appreciate your support.",
      color: "text-green-600",
    },
    pending: {
      icon: <Clock className="w-16 h-16 text-yellow-500 mb-4" />,
      title: "Processing Your Donation",
      description:
        "Your payment is being processed. This may take a few moments. Please check back later for confirmation.",
      color: "text-yellow-600",
    },
    failed: {
      icon: <AlertCircle className="w-16 h-16 text-red-500 mb-4" />,
      title: "Donation Unsuccessful",
      description:
        "We encountered an issue processing your donation. Please try again or contact our support team for assistance.",
      color: "text-red-600",
    },
  };

  return (
    <div className="container px-4 py-12 min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <Card className="max-w-2xl w-full mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">Donation Confirmation</CardTitle>
          <CardDescription>Thank you for your support</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {isLoading ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
              <p className="text-lg text-slate-600">Checking payment status...</p>
            </div>
          ) : (
            status && (
              <div className="text-center py-8">
                {statusConfig[status].icon}
                <h2 className={`text-2xl font-semibold mb-2 ${statusConfig[status].color}`}>
                  {statusConfig[status].title}
                </h2>
                <p className="text-slate-600 mb-6">{statusConfig[status].description}</p>
                {amount && status === "success" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    {donationType && (
                      <p className="text-green-800 mb-2">
                        Donation Type: <span className="font-bold">{donationType}</span>
                      </p>
                    )}
                    <p className="text-green-800">
                      Donation Amount: <span className="font-bold">${amount}</span>
                    </p>
                  </div>
                )}
                <div className="space-y-4">
                  <Button asChild className="w-full">
                    <Link href="/">Return to Home</Link>
                  </Button>
                  <Button asChild className="w-full mt-4">
                    <Link href={backLink}>
                      Back to {backText}
                    </Link>
                  </Button>
                  {status === "failed" && (
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/online-giving">Try Again</Link>
                    </Button>
                  )}
                </div>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
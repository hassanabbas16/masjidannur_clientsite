"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

interface PaymentFormProps {
  setErrorMessage: (message: string | undefined) => void;
  onPaymentSuccess: () => void;
}

export default function PaymentForm({ setErrorMessage }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);
  const [paymentMethodValid, setPaymentMethodValid] = useState(false);
  const [localErrorMessage, setLocalErrorMessage] = useState<string | undefined>();

  async function handlePaymentSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      const errorMsg = "Payment system not initialized. Please refresh the page.";
      setErrorMessage(errorMsg);
      setLocalErrorMessage(errorMsg);
      return;
    }

    if (!paymentMethodValid) {
      const errorMsg = "Please select a valid payment method before submitting.";
      setErrorMessage(errorMsg);
      setLocalErrorMessage(errorMsg);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(undefined);
    setLocalErrorMessage(undefined);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donation-confirmation`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Payment confirmation error:", error);
        const errorMsg = error.message || "An error occurred while processing your payment.";
        setErrorMessage(errorMsg);
        setLocalErrorMessage(errorMsg);
      } else if (paymentIntent) {
        if (paymentIntent.status === "succeeded") {
          window.location.href = `${window.location.origin}/donation-confirmation?payment_intent=${paymentIntent.id}`;
        } else if (paymentIntent.status === "requires_action") {
          const errorMsg = "Additional action required. Please follow the prompts.";
          setErrorMessage(errorMsg);
          setLocalErrorMessage(errorMsg);
        } else {
          const errorMsg = `Unexpected payment status: ${paymentIntent.status}`;
          setErrorMessage(errorMsg);
          setLocalErrorMessage(errorMsg);
        }
      }
    } catch (err) {
      console.error("Unexpected error in confirmPayment:", err);
      const errorMsg = "An unexpected error occurred. Please try again.";
      setErrorMessage(errorMsg);
      setLocalErrorMessage(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="min-h-[200px]">
        <PaymentElement
          options={{ layout: "tabs" }}
          onReady={() => {
            setIsPaymentElementReady(true);
          }}
          onChange={(e) => {
            if (e.error) {
              setPaymentMethodValid(false);
            } else {
              setPaymentMethodValid(e.complete);
            }
          }}
        />
        {!isPaymentElementReady && (
          <div className="text-gray-600 mt-2">Loading payment options...</div>
        )}
      </div>
      <div className="text-sm text-red-500 mt-2 font-medium">
        {paymentMethodValid ? "Your payment method is ready." : "Please select a payment method before proceeding."}
      </div>
      <Button
        onClick={handlePaymentSubmit}
        disabled={!stripe || !isPaymentElementReady || isProcessing || !paymentMethodValid}
        className="w-full"
        aria-busy={isProcessing}
      >
        {isProcessing ? "Processing..." : paymentMethodValid ? "Complete Donation" : "Select a payment method"}
      </Button>
      {localErrorMessage && (
        <div className="text-red-500 mt-2" role="alert">
          {localErrorMessage}
        </div>
      )}
    </div>
  );
}
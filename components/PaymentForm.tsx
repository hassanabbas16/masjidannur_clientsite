"use client"

import type React from "react"

import { useState } from "react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { type StripePaymentElementChangeEvent } from "@stripe/stripe-js"

interface PaymentFormProps {
  setErrorMessage: (message: string | undefined) => void
  onPaymentSuccess: (paymentIntentId: string) => void
}

export default function PaymentForm({ setErrorMessage, onPaymentSuccess }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false)
  const [paymentMethodValid, setPaymentMethodValid] = useState(false)
  const [localErrorMessage, setLocalErrorMessage] = useState<string>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setLocalErrorMessage(undefined)
    setErrorMessage(undefined)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/donation-confirmation`,
        },
      })

      if (error) {
        setLocalErrorMessage(error.message)
        setErrorMessage(error.message)
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onPaymentSuccess(paymentIntent.id)
      }
    } catch (error) {
      console.error("Payment error:", error)
      setLocalErrorMessage("An error occurred while processing your payment.")
      setErrorMessage("An error occurred while processing your payment.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="min-h-[200px]">
        <PaymentElement
          options={{ layout: "tabs" }}
          onReady={() => {
            setIsPaymentElementReady(true)
          }}
          onChange={(e: StripePaymentElementChangeEvent) => {
            if (!e.complete) {
              setPaymentMethodValid(false)
            } else {
              setPaymentMethodValid(e.complete)
            }
          }}
        />
        {!isPaymentElementReady && <div className="text-gray-600 mt-2">Loading payment options...</div>}
      </div>
      <div className="text-sm mt-2 font-medium">
        {paymentMethodValid ? (
          <span className="text-green-600">Your payment method is ready.</span>
        ) : (
          <span className="text-amber-600">Please select a payment method before proceeding.</span>
        )}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!stripe || !isPaymentElementReady || isProcessing || !paymentMethodValid}
        className="w-full"
        aria-busy={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : paymentMethodValid ? (
          "Complete Donation"
        ) : (
          "Select a payment method"
        )}
      </Button>
      {localErrorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm" role="alert">
          {localErrorMessage}
        </div>
      )}
    </div>
  )
}


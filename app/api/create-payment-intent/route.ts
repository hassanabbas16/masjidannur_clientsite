import { NextResponse } from "next/server"
import Stripe from "stripe"
import { randomUUID } from "crypto"
import dbConnect from "@/lib/db"
import Donation from "@/models/donation"
import DonationType from "@/models/donationType"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

export async function POST(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()
    const { donationType: donationTypeName, amount, name, email, phone, anonymous, coverFees } = body

    if (!amount || !email || !donationTypeName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find donation type
    const donationType = await DonationType.findOne({ name: donationTypeName })
    if (!donationType) {
      return NextResponse.json({ error: "Invalid donation type" }, { status: 400 })
    }

    const donationAmount = Number.parseFloat(amount)
    if (isNaN(donationAmount) || donationAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    let paymentAmount = Math.round(donationAmount * 100) // Convert to cents
    let totalAmount = donationAmount

    if (coverFees) {
      const totalWithFees = (donationAmount + 0.3) / (1 - 0.029)
      paymentAmount = Math.ceil(totalWithFees * 100)
      totalAmount = paymentAmount / 100
    }

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: paymentAmount,
        currency: "usd",
        receipt_email: email,
        metadata: {
          donationType: donationTypeName,
          donationAmount: donationAmount.toFixed(2),
          coverFees: coverFees.toString(),
          name: anonymous ? "Anonymous" : name || "",
          phone: phone || "",
          anonymous: anonymous.toString(),
          email:email,
        },
        automatic_payment_methods: { enabled: true },
      },
      {
        idempotencyKey: `${email}-${randomUUID()}`,
      },
    )

    // Create donation record
    await Donation.create({
      donationType: donationType._id,
      amount: donationAmount,
      totalAmount,
      name: anonymous ? "Anonymous" : name || undefined,
      email,
      phone: phone || undefined,
      anonymous,
      coverFees,
      status: "pending",
      stripePaymentIntentId: paymentIntent.id,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: donationAmount.toFixed(2),
    })
  } catch (error: any) {
    console.error("Error creating PaymentIntent:", error)
    return NextResponse.json({ error: error.message || "Error creating PaymentIntent" }, { status: 500 })
  }
}


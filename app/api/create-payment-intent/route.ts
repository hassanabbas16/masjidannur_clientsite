import { NextResponse } from "next/server"
import Stripe from "stripe"
import { randomUUID } from "crypto"
import dbConnect from "@/lib/db"
import Donation from "@/models/donation"
import DonationType from "@/models/donationType"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

// Simple in-memory store for rate limiting
const rateLimit = new Map()

// Rate limit function
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 5 * 60 * 1000 // 5 minutes
  const maxRequests = 3 // 3 requests per window

  const userRequests = rateLimit.get(ip) || []
  const recentRequests = userRequests.filter((timestamp: number) => now - timestamp < windowMs)

  if (recentRequests.length >= maxRequests) {
    return false
  }

  recentRequests.push(now)
  rateLimit.set(ip, recentRequests)
  return true
}

export async function POST(req: Request) {
  try {
    // Get IP address from request
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1"
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please try again in 5 minutes." },
        { status: 429 }
      )
    }

    await dbConnect()

    const body = await req.json()
    const { donationType: donationTypeName, amount, name, email, phone, anonymous, coverFees, dateId } = body

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
          email: email,
          dateId: dateId,
          sponsorName: name,
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
    if (error.message.includes('Too many')) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 } // Too Many Requests
      )
    }
    console.error("Error creating PaymentIntent:", error)
    return NextResponse.json({ error: error.message || "Error creating PaymentIntent" }, { status: 500 })
  }
}


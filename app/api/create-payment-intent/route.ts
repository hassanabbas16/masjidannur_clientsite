import { NextResponse } from "next/server";
import Stripe from "stripe";
import { randomUUID } from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, email, donationType, coverFees,name,phone } = body;

    if (!amount || !email || !donationType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    let paymentAmount = Math.round(donationAmount * 100); // Convert to cents
    if (coverFees) {
      const totalWithFees = (donationAmount + 0.30) / (1 - 0.029);
      paymentAmount = Math.ceil(totalWithFees * 100);
    }

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: paymentAmount,
        currency: "usd",
        receipt_email: email,
        metadata: {
          donationType,
          donationAmount: donationAmount.toFixed(2),
          coverFees: coverFees.toString(),
          name,
          phone,
        },
        automatic_payment_methods: { enabled: true }, // ✅ Enable all available payment methods
      },
      {
        idempotencyKey: `${email}-${randomUUID()}`, // Stable idempotency key
      }
    );

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error: any) {
    console.error("Error creating PaymentIntent:", error);
    return NextResponse.json(
      { error: error.message || "Error creating PaymentIntent" },
      { status: 500 }
    );
  }
}

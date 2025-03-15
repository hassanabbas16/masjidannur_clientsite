import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import Donation from "@/models/donation";
import RamadanDate from "@/models/ramadanDate"; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const paymentIntentId = url.searchParams.get("payment_intent");

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing payment_intent parameter" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded" && paymentIntent.id) {
      // Update Donation status for all payments
      await Donation.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: "completed" }
      );

      // Handle Iftar Sponsorship updates
      if (
        paymentIntent.metadata?.donationType === "Iftar Sponsorship" &&
        paymentIntent.metadata?.dateId
      ) {
        const dateId = paymentIntent.metadata.dateId;
        const sponsorName = paymentIntent.metadata.sponsorName || "Anonymous";

        await RamadanDate.findByIdAndUpdate(dateId, {
          available: false,
          sponsorName,
        });
      }
    } else if (
      paymentIntent.status === "canceled" ||
      paymentIntent.status === "requires_payment_method"
    ) {
      await Donation.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: "failed" }
      );
    }

    return NextResponse.json({
      status: paymentIntent.status,
      amount_received: paymentIntent.amount_received / 100,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    });
  } catch (error: any) {
    console.error("Error fetching payment status:", error);
    return NextResponse.json(
      { error: error.message || "Error fetching payment status" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
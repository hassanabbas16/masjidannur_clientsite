import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import Donation from "@/models/donation";
import RamadanDate from "@/models/ramadanDate";
import Mailgun from "mailgun.js";
import FormData from "form-data";

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

      // Send confirmation email after successful payment
      if (paymentIntent.receipt_email) {
        try {
          await sendConfirmationEmail(
            paymentIntent.receipt_email,
            paymentIntent.amount_received / 100, // Convert amount from cents to dollars
            paymentIntent.metadata.donationType || "Donation",
            new Date().toLocaleDateString() // Use today's date for the donation date
          );
          console.log("Confirmation email sent successfully.");
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Email failure is logged but doesn’t block the response—good!
        }
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

// Send confirmation email function using Mailgun
async function sendConfirmationEmail(email: string, amount: number, donationType: string, date: string) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.EMAIL_API, 
  });

  const domain = process.env.MAILGUN_DOMAIN || "www.masjidannoorfs.com"; 

  const data = {
    from: "Masjid Annoor <transactions@www.masjidannoorfs.com>",
    to: email,
    subject: `Confirmation of your ${donationType}`,
    text: `Dear Donor,\n\nWe have received your ${donationType} of \$${amount}. Your support is greatly appreciated. The donation was made on ${date}.\n\nBest regards,\nMasjid Annoor`,
    html: `<p>Dear Donor,</p><p> We have received your ${donationType} of \$${amount}. Your support is greatly appreciated. The donation was made on ${date}.</p><p>Best regards,<br>Masjid Annoor</p>`,
  };

  try {
    console.log("Sending email using Mailgun...");
    const response = await mg.messages.create(domain, data);
    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw new Error("Error sending confirmation email");
  }
}

export const dynamic = "force-dynamic";

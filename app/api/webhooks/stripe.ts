import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { format } from "date-fns";
import dbConnect from "@/lib/db";
import RamadanDate from "@/models/ramadanDate";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia", // Note: This is a future version; ensure it’s supported when you deploy
});

// Get the webhook secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use an App Password if Gmail’s 2FA is enabled
  },
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;
  let event;

  // Verify the webhook signature
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Error constructing event:', err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      await dbConnect();

      const { dateId, sponsorName } = paymentIntent.metadata;

      // Validate metadata
      if (!dateId) {
        console.error("No dateId found in payment metadata:", paymentIntent.metadata);
        throw new Error("No date ID found in payment metadata");
      }

      // Update the database
      const updatedDate = await RamadanDate.findByIdAndUpdate(
        dateId,
        {
          available: false,
          sponsorId: paymentIntent.customer,
          sponsorName: sponsorName || "Anonymous",
        },
        { new: true }
      );

      if (!updatedDate) {
        console.error("Failed to update Ramadan date with ID:", dateId);
        throw new Error("Failed to update Ramadan date");
      }

      // Send confirmation email
      if (paymentIntent.receipt_email) {
        try {
          await sendConfirmationEmail(
            paymentIntent.receipt_email,
            paymentIntent.amount / 100, // Convert cents to dollars
            "Iftar",
            format(new Date(), "MMMM dd, yyyy") // This uses today’s date—see below
          );
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Email failure is logged but doesn’t block the response—good!
        }
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return NextResponse.json({ error: "Error processing webhook" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

// Email sending function
async function sendConfirmationEmail(email: string, amount: number, donationType: string, date: string) {
  const msg = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Confirmation of your ${donationType}`,
    text: `Dear Donor,\n\nWe have received your ${donationType} of $${amount}. Your support is greatly appreciated. The donation was made on ${date}.\n\nBest regards,\nMasjid Annoor`,
    html: `<p>Dear Donor,</p><p>We have received your ${donationType} of $${amount}. Your support is greatly appreciated. The donation was made on ${date}.</p><p>Best regards,<br>Masjid Annoor</p>`,
  };

  try {
    await transporter.sendMail(msg);
  } catch (emailError) {
    console.error("Error sending confirmation email:", emailError);
    throw new Error("Error sending confirmation email");
  }
}
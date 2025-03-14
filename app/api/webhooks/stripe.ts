import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { format } from "date-fns";
import dbConnect from "@/lib/db";
import RamadanDate from "@/models/ramadanDate";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Get the webhook secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Change to your email service or SMTP server
  auth: {
    user: process.env.EMAIL_USER, // Your email address (e.g., your-email@gmail.com)
    pass: process.env.EMAIL_PASS, // Your email password (use environment variables for security)
  },
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      await dbConnect();

      // Extract the date ID and sponsor name from metadata
      const { dateId, sponsorName } = paymentIntent.metadata;

      if (!dateId) {
        console.error("No dateId found in payment metadata:", paymentIntent.metadata);
        throw new Error("No date ID found in payment metadata");
      }

      // Update the RamadanDate document
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

      // Send confirmation email if email is available
      if (paymentIntent.receipt_email) {
        await sendConfirmationEmail(
          paymentIntent.receipt_email,
          paymentIntent.amount / 100,
          "Iftar",
          format(new Date(), "MMMM dd, yyyy")
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return NextResponse.json(
        { error: "Error processing webhook" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

// Function to send a thank you email to the donor
async function sendThankYouEmail(email: string, amount: string, donationType: string, coverFees: boolean, date: number) {
  const formattedDate = format(new Date(date * 1000), 'MMMM d, yyyy');
  const msg = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Thank you for your ${donationType} Sponsorship`,
    text: `Dear Donor,\n\nThank you for your generous ${donationType} sponsorship of $${amount}. Your support is greatly appreciated. The donation was made on ${formattedDate}.\n\nBest regards,\nMasjid Annoor`,
    html: `<p>Dear Donor,</p><p>Thank you for your generous ${donationType} sponsorship of $${amount}. Your support is greatly appreciated. The donation was made on ${formattedDate}.</p><p>Best regards,<br>Masjid Annoor</p>`,
  };

  // Send the email
  await transporter.sendMail(msg);
}

// Function to send a confirmation email
async function sendConfirmationEmail(email: string, amount: number, donationType: string, date: string) {
  const msg = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Confirmation of your ${donationType} Sponsorship`,
    text: `Dear Donor,\n\nWe have received your ${donationType} sponsorship of $${amount}. Your support is greatly appreciated. The donation was made on ${date}.\n\nBest regards,\nMasjid Annoor`,
    html: `<p>Dear Donor,</p><p>We have received your ${donationType} sponsorship of $${amount}. Your support is greatly appreciated. The donation was made on ${date}.</p><p>Best regards,<br>Masjid Annoor</p>`,
  };

  // Send the email
  await transporter.sendMail(msg);
}

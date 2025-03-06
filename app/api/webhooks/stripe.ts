import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { format } from "date-fns";

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
  const sig = req.headers.get("Stripe-Signature")!;
  const body = await req.text(); // Stripe sends the payload as text (not JSON)

  let event;

  // Verify the webhook signature to ensure it’s from Stripe
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;

      // Retrieve necessary information from payment intent metadata
      const email = paymentIntent.receipt_email || 'defaultemail@example.com';  // Provide a fallback email

      const { amount, donationType, coverFees } = paymentIntent.metadata;

      // Convert coverFees to boolean
      const coverFeesBoolean = coverFees === 'true'; // Converts 'true' string to boolean true

      // Send a thank you email to the donor
      await sendThankYouEmail(email, amount, donationType, coverFeesBoolean, paymentIntent.created);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a response indicating that the webhook was successfully received
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

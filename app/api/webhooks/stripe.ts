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
    console.error('Error constructing event:', err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      await dbConnect();

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
        try {
          await sendConfirmationEmail(
            paymentIntent.receipt_email,
            paymentIntent.amount / 100,
            "Iftar",
            format(new Date(), "MMMM dd, yyyy")
          );
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
        }
      }

      // Return a successful response immediately after processing
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return NextResponse.json({ error: "Error processing webhook" }, { status: 500 });
    }
  }

  // Handle other webhook types if necessary
  return NextResponse.json({ received: true });
}

// Function to send a confirmation email
async function sendConfirmationEmail(email: string, amount: number, donationType: string, date: string) {
  const msg = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Confirmation of your ${donationType}`,
    text: `Dear Donor,\n\nWe have received your ${donationType} of $${amount}. Your support is greatly appreciated. The donation was made on ${date}.\n\nBest regards,\nMasjid Annoor`,
    html: `<p>Dear Donor,</p><p>We have received your ${donationType}  of $${amount}. Your support is greatly appreciated. The donation was made on ${date}.</p><p>Best regards,<br>Masjid Annoor</p>`,
  };

  try {
    // Send the email
    await transporter.sendMail(msg);
  } catch (emailError) {
    console.error("Error sending confirmation email:", emailError);
    throw new Error("Error sending confirmation email");
  }
}

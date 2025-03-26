import { NextResponse } from "next/server"
import Stripe from "stripe"
import dbConnect from "@/lib/db"
import Donation from "@/models/donation"
import RamadanDate from "@/models/ramadanDate"
import nodemailer from "nodemailer"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

export async function GET(req: Request) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const paymentIntentId = url.searchParams.get("payment_intent")

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing payment_intent parameter" }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === "succeeded" && paymentIntent.id) {
      // Fetch the donation record to check if email has already been sent
      const donation = await Donation.findOne({ stripePaymentIntentId: paymentIntent.id })

      // If email hasn't been sent yet, send the confirmation email
      if (donation && !donation.emailSent) {
        // Send the confirmation email
        if (paymentIntent.receipt_email) {
          try {
            const sponsorName = paymentIntent.metadata.sponsorName || "Donor"
            const donationType = paymentIntent.metadata.donationType || "Donation"
            const amount = paymentIntent.amount_received / 100 // Convert amount from cents to dollars
            const date = new Date().toLocaleDateString() // Use today's date for the donation date
            const sponsorEmail = paymentIntent.receipt_email
            const sponsorPhone = paymentIntent.metadata.phone || "Not provided"

            // Send the relevant email based on donation type
            if (donationType === "Iftar Sponsorship") {
              await sendIftarSponsorshipEmails(sponsorName, sponsorEmail, sponsorPhone)
            } else {
              await sendConfirmationEmail(sponsorEmail, amount, donationType, date)
            }

            // Update the `emailSent` flag in the donation record to true
            donation.emailSent = true
            await donation.save()
            console.log("Confirmation email sent successfully.")
          } catch (emailError) {
            console.error("Error sending confirmation email:", emailError)
          }
        }
      } else {
        console.log("Email already sent for this payment.")
      }

      // Update the donation status if necessary
      await Donation.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: "completed" }
      )

    } else if (paymentIntent.status === "canceled" || paymentIntent.status === "requires_payment_method") {
      await Donation.findOneAndUpdate({ stripePaymentIntentId: paymentIntent.id }, { status: "failed" })
    }

    return NextResponse.json({
      status: paymentIntent.status,
      amount_received: paymentIntent.amount_received / 100,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    })
  } catch (error: any) {
    console.error("Error fetching payment status:", error)
    return NextResponse.json({ error: error.message || "Error fetching payment status" }, { status: 500 })
  }
}


// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_TEAM,
    pass: process.env.EMAIL_TEAM_PASSWORD,
  },
})

// Send regular confirmation email function using Nodemailer
async function sendConfirmationEmail(email: string, amount: number, donationType: string, date: string) {
  const mailOptions = {
    from: `Masjid Annoor <${process.env.EMAIL_TEAM}>`,
    to: email,
    subject: `Confirmation of your ${donationType}`,
    text: `Dear Donor,\n\nWe have received your ${donationType} of \$${amount}. Your support is greatly appreciated. The donation was made on ${date}.\n\nBest regards,\nMasjid Annoor`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333333;">
        <!-- Header -->
        <div style="background-color: #d3f8d3; padding: 20px; text-align: center;">
          <h1 style="color: #4CAF50;">Masjid Annoor</h1>
          <p style="font-size: 16px; color: #666;">Thank you for your support!</p>
        </div>

        <!-- Body -->
        <div style="padding: 20px;">
          <p>Dear Donor,</p>
          <p>We have received your ${donationType} of <strong>$${amount}</strong>. Your support is greatly appreciated. The donation was made on <strong>${date}</strong>.</p>
          <p>May Allah (SWT) accept your contribution.</p>

          <p>Best regards,</p>
          <p><strong>Masjid Annoor</strong></p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center;">
          <p style="font-size: 14px; color: #888;">Masjid Annoor Team | <a href="mailto:${process.env.EMAIL_ADMIN}" style="color: #4CAF50;">${process.env.EMAIL_ADMIN}</a> | +1 479-783-2914</p>
          <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} Masjid Annoor. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  try {
    console.log("Sending email using Nodemailer...");
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw new Error("Error sending confirmation email");
  }
}

// Send Iftar Sponsorship specific emails
async function sendIftarSponsorshipEmails(sponsorName: string, sponsorEmail: string, sponsorPhone: string) {
  // Email to Client (Confirmation of Iftar Sponsorship)
  const clientMailOptions = {
    from: `Masjid Annoor <${process.env.EMAIL_TEAM}>`,
    to: sponsorEmail,
    subject: "Thank You for Sponsoring an Iftar at Masjid Annoor",
    text: `Assalamu Alaikum ${sponsorName},\n\nJazakAllah Khair for your generous commitment to sponsor an Iftar at Masjid Annoor. We are grateful for your support in helping our community break their fast together during this blessed month.\n\nOur team will review your submission and reach out shortly to confirm the date and any additional details. May Allah (SWT) accept your contribution and multiply your rewards.\n\nSincerely,\nMasjid Annoor Team\n${process.env.EMAIL_ADMIN} | 479-783-2914`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333333;">
        <!-- Header -->
        <div style="background-color: #d3f8d3; padding: 20px; text-align: center;">
          <h1 style="color: #4CAF50;">Masjid Annoor</h1>
          <p style="font-size: 16px; color: #666;">Thank you for your support!</p>
        </div>

        <!-- Body -->
        <div style="padding: 20px;">
          <p>Assalamu Alaikum ${sponsorName},</p>
          <p>JazakAllah Khair for your generous commitment to sponsor an Iftar at Masjid Annoor. We are grateful for your support in helping our community break their fast together during this blessed month.</p>
          <p>Our team will review your submission and reach out shortly to confirm the date and any additional details.</p>
          <p>May Allah (SWT) accept your contribution and multiply your rewards.</p>
          <p>Sincerely,<br><strong>Masjid Annoor Team</strong></p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center;">
          <p style="font-size: 14px; color: #888;">Masjid Annoor Team | <a href="mailto:${process.env.EMAIL_ADMIN}" style="color: #4CAF50;">${process.env.EMAIL_ADMIN}</a> | +1 479-783-2914</p>
          <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} Masjid Annoor. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  // Email to Mosque Admin (Internal Notification of Iftar Sponsor Submission)
  const adminMailOptions = {
    from: `Masjid Annoor <${process.env.EMAIL_TEAM}>`,
    to: process.env.EMAIL_ADMIN,
    subject: "New Iftar Sponsorship Submitted",
    text: `Assalamu Alaikum,\n\nA new Iftar sponsorship request has been submitted.\n\nSponsor Details:\nName: ${sponsorName}\nEmail: ${sponsorEmail}\nPhone: ${sponsorPhone}\n\nPlease review and follow up with the sponsor accordingly.\n\nJazakum Allahu Khair,\nAutomated Notification System`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333333;">
        <!-- Header -->
        <div style="background-color: #d3f8d3; padding: 20px; text-align: center;">
          <h1 style="color: #4CAF50;">Masjid Annoor</h1>
          <p style="font-size: 16px; color: #666;">New Iftar Sponsorship Request</p>
        </div>

        <!-- Body -->
        <div style="padding: 20px;">
          <p>Assalamu Alaikum,</p>
          <p>A new Iftar sponsorship request has been submitted.</p>
          <p><strong>Sponsor Details:</strong><br>Name: ${sponsorName}<br>Email: ${sponsorEmail}<br>Phone: ${sponsorPhone}</p>
          <p>Please review and follow up with the sponsor accordingly.</p>
          <p>Jazakum Allahu Khair,<br>Automated Notification System</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center;">
          <p style="font-size: 14px; color: #888;">Masjid Annoor Team | <a href="mailto:${process.env.EMAIL_ADMIN}" style="color: #4CAF50;">${process.env.EMAIL_ADMIN}</a> | +1 479-783-2914</p>
          <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} Masjid Annoor. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  try {
    console.log("Sending Iftar sponsorship emails using Nodemailer...");
    // Send email to client
    await transporter.sendMail(clientMailOptions);
    console.log("Client email sent successfully");

    // Send email to admin
    await transporter.sendMail(adminMailOptions);
    console.log("Admin email sent successfully");
  } catch (error) {
    console.error("Error sending Iftar sponsorship emails:", error);
    throw new Error("Error sending Iftar sponsorship emails");
  }
}

export const dynamic = "force-dynamic"


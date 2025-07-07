import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, date } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Format the date
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_TEAM,
        pass: process.env.EMAIL_TEAM_PASSWORD?.replace(/\s+/g, ""), // Remove any spaces
      },
      debug: true, // Enable debug output
    });

    // Send email to client
    try {
      await sendClientEmail(transporter, name, email, formattedDate);
      console.log("Client email sent successfully");
    } catch (error) {
      console.error("Error sending client email:", error);
      // Continue to admin email even if client email fails
    }
    
    // Send email to admin
    try {
      await sendAdminEmail(transporter, name, email, phone, formattedDate);
      console.log("Admin email sent successfully");
    } catch (error) {
      console.error("Error sending admin email:", error);
      // Continue even if admin email fails
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in send-free-iftar-email API:", error);
    return NextResponse.json(
      { error: error.message || "Error sending emails" },
      { status: 500 }
    );
  }
}

// Send confirmation email to client
async function sendClientEmail(
  transporter: nodemailer.Transporter, 
  clientName: string, 
  clientEmail: string, 
  date: string
) {
  const mailOptions = {
    from: `"Masjid Annoor" <${process.env.EMAIL_TEAM}>`,
    to: clientEmail,
    subject: "Thank You for Sponsoring an Iftar at Masjid Annoor",
    text: `Assalamu Alaikum ${clientName},\n\nJazakAllah Khair for your generous commitment to sponsor an Iftar at Masjid Annoor. We are grateful for your support in helping our community break their fast together during this blessed month.\n\nOur team will review your submission and reach out shortly to confirm the date and any additional details. May Allah (SWT) accept your contribution and multiply your rewards.\n\nSincerely,\nMasjid Annoor Team\nSunnie.islamic.center@gmail.com | 479-783-2914`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333333;">
        <!-- Header -->
        <div style="background-color: #d3f8d3; padding: 20px; text-align: center;">
          <h1 style="color: #4CAF50;">Masjid Annoor</h1>
          <p style="font-size: 16px; color: #666;">Thank you for your support!</p>
        </div>

        <!-- Body -->
        <div style="padding: 20px;">
          <p>Assalamu Alaikum ${clientName},</p>
          <p>JazakAllah Khair for your generous commitment to sponsor an Iftar at Masjid Annoor. We are grateful for your support in helping our community break their fast together during this blessed month.</p>
          <p>Our team will review your submission and reach out shortly to confirm the date and any additional details. May Allah (SWT) accept your contribution and multiply your rewards.</p>
          <p>Sincerely,<br><strong>Masjid Annoor Team</strong><br>Sunnie.islamic.center@gmail.com | 479-783-2914</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center;">
          <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} Masjid Annoor. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

// Send notification email to admin
async function sendAdminEmail(
  transporter: nodemailer.Transporter,
  clientName: string,
  clientEmail: string,
  clientPhone: string,
  date: string
) {
  const mailOptions = {
    from: `"Masjid Annoor" <${process.env.EMAIL_TEAM}>`,
    to: process.env.EMAIL_ADMIN,
    subject: "New Iftar Sponsorship Submitted",
    text: `Assalamu Alaikum,\n\nA new Iftar sponsorship request has been submitted.\n\nSponsor Details:\nName: ${clientName}\nEmail: ${clientEmail}\nPhone: ${clientPhone}\n\nPlease review and follow up with the sponsor accordingly.\n\nJazakum Allahu Khair,\nAutomated Notification System`,
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
          
          <div style="background-color: #f9f9f9; border-left: 4px solid #4CAF50; padding: 15px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #4CAF50;">Sponsor Details:</h3>
            <p><strong>Name:</strong> ${clientName}</p>
            <p><strong>Email:</strong> ${clientEmail}</p>
            <p><strong>Phone:</strong> ${clientPhone}</p>
          </div>
          
          <p>Please review and follow up with the sponsor accordingly.</p>
          <p>Jazakum Allahu Khair,<br>Automated Notification System</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center;">
          <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} Masjid Annoor. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

export const dynamic = "force-dynamic";

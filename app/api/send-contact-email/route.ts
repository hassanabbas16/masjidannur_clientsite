import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_TEAM,
    pass: process.env.EMAIL_TEAM_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message, phone = "Not provided" } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Send email to client
    await sendClientEmail(name, email);
    
    // Send email to admin
    await sendAdminEmail(name, email, phone, subject, message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending contact emails:", error);
    return NextResponse.json(
      { error: error.message || "Error sending emails" },
      { status: 500 }
    );
  }
}

// Send confirmation email to client
async function sendClientEmail(clientName: string, clientEmail: string) {
  const mailOptions = {
    from: `Masjid Annoor <${process.env.EMAIL_TEAM}>`,
    to: clientEmail,
    subject: "Thank You for Contacting Masjid Annoor",
    text: `Assalamu Alaikum ${clientName},\n\nThank you for reaching out to Masjid Annoor. We've received your message and a member of our team will get back to you shortly, In Sha Allah.\n\nIf your inquiry is urgent, feel free to contact us directly at 479-783-2914.\n\nWe appreciate your patience and support.\n\nWarm Regards,\nMasjid Annoor Team`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333333;">
        <!-- Header -->
        <div style="background-color: #d3f8d3; padding: 20px; text-align: center;">
          <h1 style="color: #4CAF50;">Masjid Annoor</h1>
          <p style="font-size: 16px; color: #666;">Thank you for contacting us!</p>
        </div>

        <!-- Body -->
        <div style="padding: 20px;">
          <p>Assalamu Alaikum ${clientName},</p>
          <p>Thank you for reaching out to Masjid Annoor. We've received your message and a member of our team will get back to you shortly, In Sha Allah.</p>
          <p>If your inquiry is urgent, feel free to contact us directly at <strong>479-783-2914</strong>.</p>
          <p>We appreciate your patience and support.</p>
          <p>Warm Regards,<br><strong>Masjid Annoor Team</strong></p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center;">
          <p style="font-size: 14px; color: #888;">Masjid Annoor Team | <a href="mailto:${process.env.EMAIL_ADMIN}" style="color: #4CAF50;">${process.env.EMAIL_ADMIN}</a> | +1 479-783-2914</p>
          <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} Masjid Annoor. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Client email sent successfully");
  } catch (error) {
    console.error("Error sending client email:", error);
    throw new Error("Error sending client email");
  }
}

// Send notification email to admin
async function sendAdminEmail(
  clientName: string,
  clientEmail: string,
  clientPhone: string,
  subject: string,
  message: string
) {
  const mailOptions = {
    from: `Masjid Annoor <${process.env.EMAIL_TEAM}>`,
    to: process.env.EMAIL_ADMIN,
    subject: "New Contact Form Submission",
    text: `Assalamu Alaikum,\n\nA visitor has submitted a message via the Contact Us form on the mosque website.\n\nContact Details:\nName: ${clientName}\nEmail: ${clientEmail}\nPhone: ${clientPhone}\nSubject: ${subject}\n\nMessage:\n${message}\n\nPlease review and follow up as needed.\n\nJazakum Allahu Khair,\nAutomated Notification System`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333333;">
        <!-- Header -->
        <div style="background-color: #d3f8d3; padding: 20px; text-align: center;">
          <h1 style="color: #4CAF50;">Masjid Annoor</h1>
          <p style="font-size: 16px; color: #666;">New Contact Form Submission</p>
        </div>

        <!-- Body -->
        <div style="padding: 20px;">
          <p>Assalamu Alaikum,</p>
          <p>A visitor has submitted a message via the Contact Us form on the mosque website.</p>
          
          <div style="background-color: #f9f9f9; border-left: 4px solid #4CAF50; padding: 15px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #4CAF50;">Contact Details:</h3>
            <p><strong>Name:</strong> ${clientName}</p>
            <p><strong>Email:</strong> ${clientEmail}</p>
            <p><strong>Phone:</strong> ${clientPhone}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #f9f9f9; border-left: 4px solid #4CAF50; padding: 15px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #4CAF50;">Message:</h3>
            <p style="white-space: pre-line;">${message}</p>
          </div>
          
          <p>Please review and follow up as needed.</p>
          <p>Jazakum Allahu Khair,<br>Automated Notification System</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center;">
          <p style="font-size: 14px; color: #888;">Masjid Annoor Team | <a href="mailto:${process.env.EMAIL_ADMIN}" style="color: #4CAF50;">${process.env.EMAIL_ADMIN}</a> | +1 479-783-2914</p>
          <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} Masjid Annoor. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Admin email sent successfully");
  } catch (error) {
    console.error("Error sending admin email:", error);
    throw new Error("Error sending admin email");
  }
}

export const dynamic = "force-dynamic";

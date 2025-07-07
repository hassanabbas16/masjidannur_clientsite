import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_TEAM,
    pass: process.env.EMAIL_TEAM_PASSWORD,
  },
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, heading, description } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Send email to client
    await sendClientEmail(name, email)

    // Send email to admin
    await sendAdminEmail(name, email, phone, heading, description)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error sending resource emails:", error)
    return NextResponse.json({ error: error.message || "Error sending emails" }, { status: 500 })
  }
}

// Send confirmation email to client
async function sendClientEmail(clientName: string, clientEmail: string) {
  const mailOptions = {
    from: `Masjid Annoor <${process.env.EMAIL_TEAM}>`,
    to: clientEmail,
    subject: "Thank You for Applying to Be a Resource",
    text: `Assalamu Alaikum ${clientName},\n\nThank you for your interest in becoming a resource for Masjid Annoor. We appreciate your willingness to share your skills and time to support our community.\n\nYour application has been submitted for review. Once approved by the mosque team, your profile will be featured on our website under the Resources section.\n\nWe will be in touch if further information is needed.\n\nBarakAllahu Feek,\nMasjid Annoor Team`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333333;">
        <!-- Header -->
        <div style="background-color: #d3f8d3; padding: 20px; text-align: center;">
          <h1 style="color: #4CAF50;">Masjid Annoor</h1>
          <p style="font-size: 16px; color: #666;">Thank you for your application!</p>
        </div>

        <!-- Body -->
        <div style="padding: 20px;">
          <p>Assalamu Alaikum ${clientName},</p>
          <p>Thank you for your interest in becoming a resource for Masjid Annoor. We appreciate your willingness to share your skills and time to support our community.</p>
          <p>Your application has been submitted for review. Once approved by the mosque team, your profile will be featured on our website under the Resources section.</p>
          <p>We will be in touch if further information is needed.</p>
          <p>BarakAllahu Feek,<br><strong>Masjid Annoor Team</strong></p>
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
    await transporter.sendMail(mailOptions)
    console.log("Client email sent successfully")
  } catch (error) {
    console.error("Error sending client email:", error)
    throw new Error("Error sending client email")
  }
}

// Send notification email to admin
async function sendAdminEmail(
  clientName: string,
  clientEmail: string,
  clientPhone: string,
  heading: string,
  description: string,
) {
  const mailOptions = {
    from: `Masjid Annoor <${process.env.EMAIL_TEAM}>`,
    to: process.env.EMAIL_ADMIN,
    subject: "New Resource Application Submitted",
    text: `Assalamu Alaikum,\n\nA community member has submitted an application to become a resource for the mosque.\n\nResource Details:\nName: ${clientName}\nEmail: ${clientEmail}\nPhone: ${clientPhone}\nTitle: ${heading}\nDescription: ${description}\n\nPlease review and approve to publish the profile on the website.\n\nJazakum Allahu Khair,\nAutomated Notification System`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333333;">
        <!-- Header -->
        <div style="background-color: #d3f8d3; padding: 20px; text-align: center;">
          <h1 style="color: #4CAF50;">Masjid Annoor</h1>
          <p style="font-size: 16px; color: #666;">New Resource Application</p>
        </div>

        <!-- Body -->
        <div style="padding: 20px;">
          <p>Assalamu Alaikum,</p>
          <p>A community member has submitted an application to become a resource for the mosque.</p>
          
          <div style="background-color: #f9f9f9; border-left: 4px solid #4CAF50; padding: 15px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #4CAF50;">Resource Details:</h3>
            <p><strong>Name:</strong> ${clientName}</p>
            <p><strong>Email:</strong> ${clientEmail}</p>
            <p><strong>Phone:</strong> ${clientPhone}</p>
            <p><strong>Title:</strong> ${heading}</p>
            <p><strong>Description:</strong> ${description}</p>
          </div>
          
          <p>Please review and approve to publish the profile on the website.</p>
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
    await transporter.sendMail(mailOptions)
    console.log("Admin email sent successfully")
  } catch (error) {
    console.error("Error sending admin email:", error)
    throw new Error("Error sending admin email")
  }
}

export const dynamic = "force-dynamic"


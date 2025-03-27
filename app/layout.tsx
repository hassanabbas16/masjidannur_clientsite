import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

// ✅ SEO Metadata for Masjid Annoor - Fort Smith, AR
export const metadata: Metadata = {
  title: "Masjid Annoor | Fort Smith, Arkansas",
  description: "Masjid Annoor is a mosque in Fort Smith, Arkansas dedicated to providing a place of worship, community, education, and interfaith dialogue for Muslims and the broader public.",
  icons: {
    icon: "/webicon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  keywords: [
    "Masjid Annoor",
    "Fort Smith Mosque",
    "Mosque in Arkansas",
    "Islamic Center Fort Smith",
    "Muslim prayer Fort Smith",
    "Friday prayer Fort Smith",
    "Masjid Annoor prayer times",
    "Islam in Arkansas",
  ],
  openGraph: {
    title: "Masjid Annoor | Fort Smith, Arkansas",
    description: "Discover Masjid Annoor — a welcoming Islamic center in Fort Smith, Arkansas serving the Muslim community through worship, education, and outreach.",
    url: "https://www.masjidannoorfs.com",
    siteName: "Masjid Annoor",
    type: "website",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq7vkpg9tQTwxbLHjAYAhl9N54xg_GbAlYfg&s",
        width: 1200,
        height: 630,
        alt: "Masjid Annoor in Fort Smith, Arkansas",
      },
    ],
  },
  authors: [{ name: "Masjid Annoor Team", url: "https://www.masjidannoorfs.com" }],
  category: "Religious Organization",
  generator: "Next.js",
  applicationName: "Masjid Annoor Website",
}

// ✅ Separate export for viewport configuration
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* 🌐 Additional SEO and UX Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-title" content="MasjidAnnoor" />
        <link rel="canonical" href="https://www.masjidannoorfs.com" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Favicon and Icon Declarations */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </head>
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Mail, MapPin, Phone, Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react'

interface SiteSettings {
  siteName?: string
  footerLogo: string
  footerTagline: string
  socialLinks: {
    platform: string
    url: string
    icon: string
    enabled: boolean
  }[]
  quickLinks: {
    id: string
    name: string
    href: string
    enabled: boolean
    order: number
  }[]
  contactInfo: {
    address: string
    phone: string
    email: string
  }
  copyrightText: string
  developerInfo: {
    name: string
    url: string
    enabled: boolean
  }
}

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/site-settings")
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error("Error fetching site settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case "Facebook": return <Facebook className="h-5 w-5" />
      case "Instagram": return <Instagram className="h-5 w-5" />
      case "Twitter": return <Twitter className="h-5 w-5" />
      case "Youtube": return <Youtube className="h-5 w-5" />
      case "Linkedin": return <Linkedin className="h-5 w-5" />
      case "Mail": return <Mail className="h-5 w-5" />
      default: return <Facebook className="h-5 w-5" />
    }
  }

  // Sort quick links by order
  const sortedQuickLinks = settings?.quickLinks
    .filter(link => link.enabled)
    .sort((a, b) => a.order - b.order) || []

  // Filter enabled social links
  const enabledSocialLinks = settings?.socialLinks.filter(link => link.enabled) || []

  // Replace {year} in copyright text with current year
  const copyrightText = settings?.copyrightText.replace('{year}', new Date().getFullYear().toString()) || 
    `© ${new Date().getFullYear()} Masjid AnNoor. All rights reserved.`

  return (
    <footer className="bg-gradient-to-br from-[#0D7A3B] to-[#085C2C] text-white">
      <div className="container py-16 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white/20 shadow-md">
                <Image
                  src={settings?.footerLogo || "/placeholder.svg?height=48&width=48"}
                  alt="Masjid Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-2xl font-heading font-bold">
                {settings?.siteName || "Masjid AnNoor"}
              </span>
            </div>
            <p className="max-w-md text-white/80 leading-relaxed">
              {settings?.footerTagline || 
                "Serving the spiritual, educational, and social needs of the Muslim community since 1993. A beacon of faith and service in our community."}
            </p>
            <div className="flex gap-4">
              {enabledSocialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  {getSocialIcon(link.icon)}
                  <span className="sr-only">{link.platform}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xl font-heading font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {sortedQuickLinks.map((link) => (
                <li key={link.id}>
                  <Link href={link.href} className="text-white/80 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xl font-heading font-bold mb-6">Our Office</h3>
            <address className="not-italic space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-1 text-white/70" />
                <span className="text-white/80">{settings?.contactInfo?.address || "1800 S. Albert Pike Ave, Fort Smith, AR 72903"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-white/70" />
                <span className="text-white/80">{settings?.contactInfo?.phone || "479-783-2914"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-white/70" />
                <a
                  href={`mailto:${settings?.contactInfo?.email || "sunnie.islamic.center@gmail.com"}`}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {settings?.contactInfo?.email || "sunnie.islamic.center@gmail.com"}
                </a>
              </div>
            </address>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-sm text-white/60">
        <div className="container">
          <p>
            {copyrightText}
            {settings?.developerInfo?.enabled && (
              <>
                {" Designed and Developed by "}
                <a
                  href={settings.developerInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  {settings.developerInfo.name}
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  )
}

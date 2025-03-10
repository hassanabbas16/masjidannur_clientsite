import mongoose, { Schema, type Document } from "mongoose"

export interface ISiteSettings extends Document {
  // Header Settings
  logo: string
  siteName: string
  siteLocation: string
  headerMenuItems: {
    id: string
    name: string
    href: string
    enabled: boolean
    dropdown: boolean
    order: number
    items?: {
      id: string
      name: string
      href: string
      order: number
    }[]
  }[]
  
  // Footer Settings
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
  
  // General
  isActive: boolean
  updatedAt: Date
  createdAt: Date
}

const SiteSettingsSchema: Schema = new Schema(
  {
    // Header Settings
    logo: { 
      type: String, 
      default: "/placeholder.svg?height=48&width=48" 
    },
    siteName: { 
      type: String, 
      default: "Masjid AnNoor" 
    },
    siteLocation: { 
      type: String, 
      default: "Fort Smith, AR" 
    },
    headerMenuItems: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      href: { type: String, default: "#" },
      enabled: { type: Boolean, default: true },
      dropdown: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
      items: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        href: { type: String, required: true },
        order: { type: Number, default: 0 }
      }]
    }],
    
    // Footer Settings
    footerLogo: { 
      type: String, 
      default: "/placeholder.svg?height=48&width=48" 
    },
    footerTagline: { 
      type: String, 
      default: "Serving the spiritual, educational, and social needs of the Muslim community since 1993. A beacon of faith and service in our community." 
    },
    socialLinks: [{
      platform: { type: String, required: true },
      url: { type: String, default: "#" },
      icon: { type: String, required: true },
      enabled: { type: Boolean, default: true }
    }],
    quickLinks: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      href: { type: String, required: true },
      enabled: { type: Boolean, default: true },
      order: { type: Number, default: 0 }
    }],
    contactInfo: {
      address: { 
        type: String, 
        default: "1800 S. Albert Pike Ave, Fort Smith, AR 72903" 
      },
      phone: { 
        type: String, 
        default: "479-783-2914" 
      },
      email: { 
        type: String, 
        default: "sunnie.islamic.center@gmail.com" 
      }
    },
    copyrightText: { 
      type: String, 
      default: "© {year} Masjid AnNoor. All rights reserved." 
    },
    developerInfo: {
      name: { 
        type: String, 
        default: "Emergitech Solutions" 
      },
      url: { 
        type: String, 
        default: "https://emergitechsolutions.com" 
      },
      enabled: { 
        type: Boolean, 
        default: true 
      }
    },
    
    // General
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export default mongoose.models.SiteSettings || mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema)

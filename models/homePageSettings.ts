import mongoose, { Schema, type Document } from "mongoose"

export interface IHomePageSettings extends Document {
  // Hero Section
  heroTitle: string
  heroSubtitle: string
  heroButtonPrimary: {
    text: string
    link: string
    isVisible: boolean
  }
  heroButtonSecondary: {
    text: string
    link: string
    isVisible: boolean
  }
  
  // Widget Visibility
  showPrayerTimesWidget: boolean
  showZakatCalculator: boolean
  showHijriCalendar: boolean
  showSpecialIslamicDays: boolean
  
  // Events Section
  showEventsSection: boolean
  featuredEventIds: string[]
  eventsTitle: string
  eventsSubtitle: string
  
  // Main Buttons
  mainButtons: {
    id: string
    title: string
    description: string
    icon: string
    link: string
    isVisible: boolean
  }[]
  
  // General
  isActive: boolean
  updatedAt: Date
  createdAt: Date
}

const HomePageSettingsSchema: Schema = new Schema(
  {
    // Hero Section
    heroTitle: { 
      type: String, 
      required: true, 
      default: "Welcome to Masjid AnNoor" 
    },
    heroSubtitle: { 
      type: String, 
      required: true, 
      default: "A place of worship, learning, and community for Muslims in Fort Smith, Arkansas" 
    },
    heroButtonPrimary: {
      text: { type: String, default: "View Prayer Times" },
      link: { type: String, default: "/prayer-times" },
      isVisible: { type: Boolean, default: true }
    },
    heroButtonSecondary: {
      text: { type: String, default: "Learn More" },
      link: { type: String, default: "/about" },
      isVisible: { type: Boolean, default: true }
    },
    
    // Widget Visibility
    showPrayerTimesWidget: { type: Boolean, default: true },
    showZakatCalculator: { type: Boolean, default: true },
    showHijriCalendar: { type: Boolean, default: true },
    showSpecialIslamicDays: { type: Boolean, default: true },
    
    // Events Section
    showEventsSection: { type: Boolean, default: true },
    featuredEventIds: [{ type: String }],
    eventsTitle: { 
      type: String, 
      default: "Upcoming Events" 
    },
    eventsSubtitle: { 
      type: String, 
      default: "Join us for these special occasions at Masjid AnNoor" 
    },
    
    // Main Buttons
    mainButtons: [{
      id: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      icon: { type: String, required: true },
      link: { type: String, required: true },
      isVisible: { type: Boolean, default: true }
    }],
    
    // General
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export default mongoose.models.HomePageSettings || mongoose.model<IHomePageSettings>("HomePageSettings", HomePageSettingsSchema)

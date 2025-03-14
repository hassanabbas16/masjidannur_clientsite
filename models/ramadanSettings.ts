import mongoose, { Schema, type Document } from "mongoose"

export interface IRamadanSettings extends Document {
  year: number
  startDate: Date
  endDate: Date
  iftarEnabled: boolean
  iftarCost: number
  iftarDescription: string
  iftarCapacity: number
  heroTitle: string
  heroSubtitle: string
  aboutTitle: string
  aboutDescription: string
  additionalInfo: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const RamadanSettingsSchema: Schema = new Schema(
  {
    year: { type: Number, required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    iftarEnabled: {
      type: Boolean,
      default: true
    },
    iftarCost: { 
      type: Number, 
      required: false,
      default: 500 
    },
    iftarCapacity: { type: Number, required: true, default: 100 },
    iftarDescription: {
      type: String,
      required: true,
      default:
        "Sponsoring an iftar is a beautiful way to contribute to our community during the blessed month of Ramadan. Your generosity helps provide a nutritious meal for those breaking their fast at the masjid.",
    },
    heroTitle: {
      type: String,
      required: true,
      default: "Sponsor an Iftar",
    },
    heroSubtitle: {
      type: String,
      required: true,
      default: "Join us in providing iftar meals for our community during the blessed month of Ramadan",
    },
    aboutTitle: {
      type: String,
      required: true,
      default: "About Iftar Sponsorship",
    },
    aboutDescription: {
      type: String,
      required: true,
      default:
        "Sponsoring an iftar is a beautiful way to contribute to our community during the blessed month of Ramadan. Your generosity helps provide a nutritious meal for those breaking their fast at the masjid.",
    },
    additionalInfo: [
      {
        type: String,
        default: [
          "The cost to sponsor an iftar is $500, which covers food and drinks for approximately 100 people.",
          "Sponsors are welcome to attend the iftar they've sponsored and may bring family members to help serve the meal.",
        ],
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.RamadanSettings ||
  mongoose.model<IRamadanSettings>("RamadanSettings", RamadanSettingsSchema)


import mongoose, { Schema, type Document } from "mongoose"

export interface IRamadanResource extends Document {
  title: string
  description: string
  resourceType: "pdf" | "link" | "video" | "image"
  url: string
  fileSize?: string
  category: "prayer" | "fasting" | "charity" | "quran" | "dua" | "other"
  isVisible: boolean
  order: number
  year: number
  createdAt: Date
  updatedAt: Date
}

const RamadanResourceSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    resourceType: {
      type: String,
      enum: ["pdf", "link", "video", "image"],
      default: "link",
    },
    url: { type: String, required: true },
    fileSize: { type: String },
    category: {
      type: String,
      enum: ["prayer", "fasting", "charity", "quran", "dua", "other"],
      default: "other",
    },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    year: { type: Number, required: true },
  },
  { timestamps: true },
)

export default mongoose.models.RamadanResource ||
  mongoose.model<IRamadanResource>("RamadanResource", RamadanResourceSchema)


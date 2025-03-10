import mongoose, { Schema, type Document } from "mongoose"

export interface IRamadanEvent extends Document {
  title: string
  description: string
  date: Date
  time: string
  location: string
  isRecurring: boolean
  recurringDays: string[] // e.g., ["Monday", "Wednesday", "Friday"]
  eventType: "lecture" | "taraweeh" | "iftar" | "qiyam" | "other"
  speaker?: string
  imageUrl?: string
  isVisible: boolean
  year: number
  createdAt: Date
  updatedAt: Date
}

const RamadanEventSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date },
    time: { type: String, required: true },
    location: { type: String, required: true },
    isRecurring: { type: Boolean, default: false },
    recurringDays: [{ type: String }],
    eventType: {
      type: String,
      enum: ["lecture", "taraweeh", "iftar", "qiyam", "other"],
      default: "other",
    },
    speaker: { type: String },
    imageUrl: { type: String },
    isVisible: { type: Boolean, default: true },
    year: { type: Number, required: true },
  },
  { timestamps: true },
)

export default mongoose.models.RamadanEvent || mongoose.model<IRamadanEvent>("RamadanEvent", RamadanEventSchema)


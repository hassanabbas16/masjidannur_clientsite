import mongoose, { Schema, type Document } from "mongoose"

export interface IEvent extends Document {
  title: string
  description: string
  date: Date
  endDate: Date
  location: string
  image: string
  category: string[]
  organizer: string
  contactEmail: string
  additionalDetails: string
  isVisible: boolean
  createdAt: Date
  updatedAt: Date
}

const EventSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    image: { type: String, default: "/placeholder.svg?height=400&width=600" },
    category: { type: [String], required: true },
    organizer: { type: String, required: true },
    contactEmail: { type: String, required: true },
    additionalDetails: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema)


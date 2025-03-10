import mongoose, { Schema, type Document } from "mongoose"

export interface IDonationType extends Document {
  name: string
  description: string
  isActive: boolean
  icon: string
  createdAt: Date
  updatedAt: Date
}

const DonationTypeSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    icon: { type: String, default: "DollarSign" }, // Lucide icon name
  },
  { timestamps: true },
)

export default mongoose.models.DonationType || mongoose.model<IDonationType>("DonationType", DonationTypeSchema)


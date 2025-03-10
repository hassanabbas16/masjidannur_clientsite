import mongoose, { Schema, type Document } from "mongoose"

export interface IRamadanDate extends Document {
  date: Date
  available: boolean
  sponsorId: mongoose.Types.ObjectId | null
  sponsorName: string | null
  notes: string
  year: number
  createdAt: Date
  updatedAt: Date
}

const RamadanDateSchema: Schema = new Schema(
  {
    date: { type: Date, required: true },
    available: { type: Boolean, default: true },
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: "IftarSponsorship", default: null },
    sponsorName: { type: String, default: null },
    notes: { type: String, default: "" },
    year: { type: Number, required: true },
  },
  { timestamps: true },
)

// Create a compound index to ensure uniqueness of date within a year
RamadanDateSchema.index({ date: 1, year: 1 }, { unique: true })

export default mongoose.models.RamadanDate || mongoose.model<IRamadanDate>("RamadanDate", RamadanDateSchema)


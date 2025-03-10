import mongoose, { Schema, type Document } from "mongoose"

export interface IDonation extends Document {
  donationType: mongoose.Types.ObjectId
  amount: number
  totalAmount: number
  name: string
  email: string
  phone: string
  anonymous: boolean
  coverFees: boolean
  status: "pending" | "completed" | "failed" | "refunded"
  stripePaymentIntentId: string
  stripeCustomerId: string
  notes: string
  createdAt: Date
  updatedAt: Date
}

const DonationSchema: Schema = new Schema(
  {
    donationType: { type: mongoose.Schema.Types.ObjectId, ref: "DonationType", required: true },
    amount: { type: Number, required: true },
    totalAmount: { type: Number, required: true }, // Including fees if covered
    name: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    anonymous: { type: Boolean, default: false },
    coverFees: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    stripePaymentIntentId: { type: String },
    stripeCustomerId: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
)

export default mongoose.models.Donation || mongoose.model<IDonation>("Donation", DonationSchema)


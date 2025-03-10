import mongoose, { Schema, type Document } from "mongoose"

export interface IResource extends Document {
  name: string
  title: string
  description: string
  email: string
  phone: string
  image: string
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

const ResourceSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    image: { type: String, default: "/placeholder.svg?height=200&width=200" },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.models.Resource || mongoose.model<IResource>("Resource", ResourceSchema)


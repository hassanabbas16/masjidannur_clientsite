import mongoose, { Schema, type Document } from "mongoose"

export interface IProgram extends Document {
  title: string
  description: string
  image: string
  fullDescription?: string
  schedule?: string
  contact?: string
  createdAt: Date
  updatedAt: Date
}

const ProgramSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: "/placeholder.svg?height=400&width=600" },
    fullDescription: { type: String },
    schedule: { type: String },
    contact: { type: String },
  },
  { timestamps: true },
)

export default mongoose.models.Program || mongoose.model<IProgram>("Program", ProgramSchema)


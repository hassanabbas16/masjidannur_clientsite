import mongoose, { Schema, type Document } from "mongoose"

export interface IAbout extends Document {
  hero: {
    title: string
    subtitle: string
  }
  sidebar: {
    image: string
    visitTitle: string
    visitDescription: string
    address: string
  }
  journey: {
    title: string
    content: string[]
  }
  mission: {
    title: string
    content: string
  }
  services: {
    title: string
    items: Array<{
      title: string
      description: string
    }>
  }
  join: {
    title: string
    content: string
  }
  createdAt: Date
  updatedAt: Date
}

const AboutSchema: Schema = new Schema(
  {
    hero: {
      title: { type: String, required: true, default: "About Masjid AnNoor" },
      subtitle: {
        type: String,
        required: true,
        default: "Our journey, mission, and commitment to the community",
      },
    },
    sidebar: {
      image: {
        type: String,
        required: true,
        default: "/placeholder.svg?height=800&width=600",
      },
      visitTitle: { type: String, required: true, default: "Visit Us" },
      visitDescription: {
        type: String,
        required: true,
        default: "We welcome you to visit Masjid AnNoor and be part of our growing community.",
      },
      address: {
        type: String,
        required: true,
        default: "1800 S. Albert Pike Ave\nFort Smith, AR 72903",
      },
    },
    journey: {
      title: { type: String, required: true, default: "Our Journey" },
      content: [{ type: String, required: true }],
    },
    mission: {
      title: { type: String, required: true, default: "Our Mission" },
      content: { type: String, required: true },
    },
    services: {
      title: { type: String, required: true, default: "Our Services" },
      items: [
        {
          title: { type: String, required: true },
          description: { type: String, required: true },
        },
      ],
    },
    join: {
      title: { type: String, required: true, default: "Join Us" },
      content: { type: String, required: true },
    },
  },
  { timestamps: true, collection: 'abouts' },
)

export default mongoose.models.About || mongoose.model<IAbout>("About", AboutSchema)


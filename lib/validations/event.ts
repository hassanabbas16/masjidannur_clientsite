import * as z from "zod"

export const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  endDate: z.string().min(1, "End date is required"),
  location: z.string().min(1, "Location is required"),
  category: z.array(z.string()).min(1, "At least one category is required"),
  organizer: z.string().min(1, "Organizer is required"),
  contactEmail: z.string().email("Invalid email address"),
  image: z.string().min(1, "Image is required"),
  isVisible: z.boolean().default(true),
  additionalDetails: z.string().optional(),
}) 
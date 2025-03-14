export interface Event {
  _id: string
  title: string
  description: string
  date: string
  endDate: string
  location: string
  image: string
  category: string[]
  organizer: string
  contactEmail: string
  isVisible: boolean
  additionalDetails?: string
} 
import DonationTypeForm from "@/components/admin/donation-type-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewDonationTypePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create New Donation Type</h1>
        <Button 
            variant="secondary"
            className="text-foreground"
            asChild
          >
          <Link href="/admin/donations/types" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Types
          </Link>
        </Button>
      </div>
      <DonationTypeForm />
    </div>
  )
}


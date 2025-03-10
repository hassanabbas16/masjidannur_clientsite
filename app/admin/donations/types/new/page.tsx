import DonationTypeForm from "@/components/admin/donation-type-form"

export default function NewDonationTypePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create New Donation Type</h1>
      <DonationTypeForm />
    </div>
  )
}


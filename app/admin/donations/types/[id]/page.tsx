"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import DonationTypeForm from "@/components/admin/donation-type-form"

export default function EditDonationTypePage() {
  const params = useParams()
  const [donationType, setDonationType] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDonationType = async () => {
      try {
        const response = await fetch(`/api/donation-types/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setDonationType(data)
        } else {
          console.error("Failed to fetch donation type")
        }
      } catch (error) {
        console.error("Error fetching donation type:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchDonationType()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!donationType) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-800">Donation Type Not Found</h1>
        <p className="mt-4 text-gray-600">The donation type you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Donation Type</h1>
      <DonationTypeForm initialData={donationType} isEditing />
    </div>
  )
}


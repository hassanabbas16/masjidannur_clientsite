"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import RamadanResourceForm from "@/components/admin/ramadan-resource-form"

export default function EditRamadanResourcePage() {
  const params = useParams()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetch(`/api/ramadan/resources/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setResource(data)
        } else {
          console.error("Failed to fetch resource")
        }
      } catch (error) {
        console.error("Error fetching resource:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchResource()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-800">Resource Not Found</h1>
        <p className="mt-4 text-gray-600">The resource you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Ramadan Resource</h1>
      <RamadanResourceForm initialData={resource} isEditing />
    </div>
  )
}


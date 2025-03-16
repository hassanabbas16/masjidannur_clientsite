"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import ProgramForm from "@/components/admin/program-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function EditProgramPage() {
  const params = useParams()
  const router = useRouter() 
  const [program, setProgram] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await fetch(`/api/programs/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProgram(data)
        } else {
          console.error("Failed to fetch program")
        }
      } catch (error) {
        console.error("Error fetching program:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProgram()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-800">Program Not Found</h1>
        <p className="mt-4 text-gray-600">The program you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <h1 className="text-3xl font-bold sm:text-4xl">Edit Program</h1>
      <ProgramForm initialData={program} isEditing />
    </div>
  )
}

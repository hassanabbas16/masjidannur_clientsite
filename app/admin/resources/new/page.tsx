"use client"
import { useRouter } from "next/navigation"
import ResourceForm from "@/components/admin/resource-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function NewResourcePage() {
  const router = useRouter() 

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <h1 className="text-3xl font-bold sm:text-4xl">Create New Resource</h1>
      <ResourceForm />
    </div>
  )
}

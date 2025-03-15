"use client"

import { useRouter } from "next/navigation"
import RamadanResourceForm from "@/components/admin/ramadan-resource-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NewRamadanResourcePage() {
  const router = useRouter() // Initialize the router

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <h1 className="text-3xl font-bold sm:text-4xl">Create New Ramadan Resource</h1>
      <RamadanResourceForm />
    </div>
  )
}

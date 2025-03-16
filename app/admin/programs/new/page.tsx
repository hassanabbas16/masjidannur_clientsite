"use client"
import { useRouter } from "next/navigation"
import ProgramForm from "@/components/admin/program-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function NewProgramPage() {
  const router = useRouter() 

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <h1 className="text-3xl font-bold">Create New Program</h1>
      <ProgramForm />
    </div>
  )
}

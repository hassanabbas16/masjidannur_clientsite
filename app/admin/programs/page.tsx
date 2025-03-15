"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Edit, Plus, Search, Trash2, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Program {
  _id: string
  title: string
  description: string
  image: string
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [programToDelete, setProgramToDelete] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/programs")
      const data = await response.json()
      setPrograms(data)
    } catch (error) {
      console.error("Error fetching programs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setProgramToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!programToDelete) return

    try {
      const response = await fetch(`/api/programs/${programToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPrograms(programs.filter((program) => program._id !== programToDelete))
      } else {
        console.error("Failed to delete program")
      }
    } catch (error) {
      console.error("Error deleting program:", error)
    } finally {
      setDeleteDialogOpen(false)
      setProgramToDelete(null)
    }
  }

  const filteredPrograms = programs.filter(
    (program) =>
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Back Button Section */}
      <div className="flex items-center gap-4 flex-col sm:flex-row sm:items-center sm:gap-6">
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Programs Management</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/programs/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Program
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                className="pl-10 w-full sm:w-96"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No programs found. Create your first program!</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrograms.map((program) => (
                    <TableRow key={program._id}>
                      <TableCell className="font-medium">{program.title}</TableCell>
                      <TableCell>{program.description.substring(0, 100)}...</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/admin/programs/${program._id}`)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteClick(program._id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the program.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

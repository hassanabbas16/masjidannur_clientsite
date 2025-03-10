"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Edit, Plus, Trash2, DollarSign, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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

interface DonationType {
  _id: string
  name: string
  description: string
  isActive: boolean
  icon: string
}

export default function DonationTypesPage() {
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [typeToDelete, setTypeToDelete] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchDonationTypes()
  }, [])

  const fetchDonationTypes = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/donation-types")
      const data = await response.json()
      setDonationTypes(data)
    } catch (error) {
      console.error("Error fetching donation types:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setTypeToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!typeToDelete) return

    try {
      const response = await fetch(`/api/donation-types/${typeToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setDonationTypes(donationTypes.filter((type) => type._id !== typeToDelete))
      } else {
        console.error("Failed to delete donation type")
      }
    } catch (error) {
      console.error("Error deleting donation type:", error)
    } finally {
      setDeleteDialogOpen(false)
      setTypeToDelete(null)
    }
  }

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/donation-types/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        setDonationTypes(donationTypes.map((type) => (type._id === id ? { ...type, isActive: !currentStatus } : type)))
      } else {
        console.error("Failed to update donation type status")
      }
    } catch (error) {
      console.error("Error updating donation type status:", error)
    }
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "DollarSign":
        return <DollarSign className="h-5 w-5" />
      case "Heart":
        return <Heart className="h-5 w-5" />
      default:
        return <DollarSign className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Donation Types</h1>
        <Button asChild>
          <Link href="/admin/donations/types/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Type
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Donation Types</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : donationTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No donation types found. Create your first type!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Icon</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donationTypes.map((type) => (
                    <TableRow key={type._id}>
                      <TableCell>
                        <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-primary">
                          {getIconComponent(type.icon)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>{type.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={type.isActive}
                            onCheckedChange={() => handleStatusToggle(type._id, type.isActive)}
                          />
                          <Badge variant={type.isActive ? "default" : "outline"}>
                            {type.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/admin/donations/types/${type._id}`)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteClick(type._id)}>
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
              This action cannot be undone. This will permanently delete the donation type.
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


"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  Phone,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react"
import { format } from "date-fns"

interface Donation {
  _id: string
  donationType: {
    _id: string
    name: string
  }
  amount: number
  totalAmount: number
  name: string
  email: string
  phone: string
  anonymous: boolean
  coverFees: boolean
  status: "pending" | "completed" | "failed" | "refunded"
  stripePaymentIntentId: string
  stripeCustomerId: string
  notes: string
  createdAt: string
  updatedAt: string
}

export default function DonationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [donation, setDonation] = useState<Donation | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [stripeDetails, setStripeDetails] = useState<any>(null)
  const [newStatus, setNewStatus] = useState<string>("")

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/donations/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setDonation(data)
          setNewStatus(data.status)

          // If there's a Stripe payment intent ID, fetch additional details
          if (data.stripePaymentIntentId) {
            fetchStripeDetails(data.stripePaymentIntentId)
          }
        } else {
          console.error("Failed to fetch donation")
        }
      } catch (error) {
        console.error("Error fetching donation:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchDonation()
    }
  }, [params.id])

  const fetchStripeDetails = async (paymentIntentId: string) => {
    try {
      const response = await fetch(`/api/payment-status?payment_intent=${paymentIntentId}`)
      if (response.ok) {
        const data = await response.json()
        setStripeDetails(data)
      }
    } catch (error) {
      console.error("Error fetching Stripe details:", error)
    }
  }

  const updateDonationStatus = async () => {
    if (!donation || newStatus === donation.status) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/donations/${donation._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedDonation = await response.json()
        setDonation(updatedDonation)
      } else {
        console.error("Failed to update donation status")
      }
    } catch (error) {
      console.error("Error updating donation status:", error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Pending
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "refunded":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Refunded
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "refunded":
        return <AlertCircle className="h-5 w-5 text-blue-600" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!donation) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-800">Donation Not Found</h1>
        <p className="mt-4 text-gray-600">The donation you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-6" onClick={() => router.push("/admin/donations")}>
          Return to Donations
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="icon" className="mr-4" onClick={() => router.push("/admin/donations")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Donation Details</h1>
        </div>
        {donation.stripePaymentIntentId && (
          <Button variant="outline" asChild>
            <a
              href={`https://dashboard.stripe.com/payments/${donation.stripePaymentIntentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View in Stripe
            </a>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Donation Information</CardTitle>
              <CardDescription>Details about this donation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-2xl font-bold">${donation.amount.toFixed(2)}</p>
                    {donation.coverFees && (
                      <p className="text-sm text-muted-foreground">
                        Total with fees: ${donation.totalAmount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(donation.status)}
                  <div className="ml-3">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(donation.status)}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Donation Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Donation Type</p>
                    <p className="font-medium">{donation.donationType.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{format(new Date(donation.createdAt), "PPP 'at' p")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Processing Fees</p>
                    <p className="font-medium">
                      {donation.coverFees
                        ? `Covered by donor ($${(donation.totalAmount - donation.amount).toFixed(2)})`
                        : "Not covered"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Payment ID</p>
                    <p className="font-medium text-sm truncate">{donation.stripePaymentIntentId || "N/A"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Donor Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-muted-foreground mr-2" />
                      <p className="text-sm text-muted-foreground">Name</p>
                    </div>
                    <p className="font-medium">
                      {donation.anonymous ? "Anonymous Donor" : donation.name || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                      <p className="text-sm text-muted-foreground">Email</p>
                    </div>
                    <p className="font-medium">{donation.email}</p>
                  </div>
                  {donation.phone && (
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                        <p className="text-sm text-muted-foreground">Phone</p>
                      </div>
                      <p className="font-medium">{donation.phone}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Anonymous</p>
                    <p className="font-medium">{donation.anonymous ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>

              {donation.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Notes</h3>
                    <p>{donation.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {stripeDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Stripe Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Stripe Status</p>
                    <p className="font-medium capitalize">{stripeDetails.status}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Amount Received</p>
                    <p className="font-medium">
                      ${stripeDetails.amount_received?.toFixed(2) || "0.00"} {stripeDetails.currency?.toUpperCase()}
                    </p>
                  </div>
                  {stripeDetails.payment_method_types && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium capitalize">{stripeDetails.payment_method_types.join(", ")}</p>
                    </div>
                  )}
                  {stripeDetails.charges?.data?.[0]?.payment_method_details?.card && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Card</p>
                      <p className="font-medium">
                        {stripeDetails.charges.data[0].payment_method_details.card.brand.toUpperCase()} ••••
                        {stripeDetails.charges.data[0].payment_method_details.card.last4}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={updateDonationStatus}
                disabled={updating || newStatus === donation.status}
              >
                {updating ? "Updating..." : "Update Status"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Download, Filter, Search, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import Link from "next/link"

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
  anonymous: boolean
  status: "pending" | "completed" | "failed" | "refunded"
  createdAt: string
}

interface DonationType {
  _id: string
  name: string
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [date, setDate] = useState<DateRange | undefined>()
  const router = useRouter()

  useEffect(() => {
    Promise.all([fetchDonations(), fetchDonationTypes()])
  }, [])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      let url = "/api/donations"

      const params = new URLSearchParams()
      if (selectedType) params.append("donationType", selectedType)
      if (selectedStatus) params.append("status", selectedStatus)
      if (date?.from) params.append("startDate", date.from.toISOString())
      if (date?.to) params.append("endDate", date.to.toISOString())

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      const data = await response.json()
      setDonations(data)
    } catch (error) {
      console.error("Error fetching donations:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDonationTypes = async () => {
    try {
      const response = await fetch("/api/donation-types")
      const data = await response.json()
      setDonationTypes(data)
    } catch (error) {
      console.error("Error fetching donation types:", error)
    }
  }

  const handleFilter = () => {
    fetchDonations()
  }

  const handleClearFilters = () => {
    setSelectedType("all")
    setSelectedStatus("all")
    setDate(undefined)
    fetchDonations()
  }

  const exportToCsv = () => {
    // Filter donations based on search term
    const filteredDonations = donations.filter(
      (donation) =>
        donation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donation.name && donation.name.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    // Create CSV content
    const headers = ["Date", "Name", "Email", "Type", "Amount", "Total Amount", "Status"]
    const rows = filteredDonations.map((donation) => [
      new Date(donation.createdAt).toLocaleDateString(),
      donation.anonymous ? "Anonymous" : donation.name,
      donation.email,
      donation.donationType.name,
      donation.amount.toFixed(2),
      donation.totalAmount.toFixed(2),
      donation.status,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `donations-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

  const getFilteredDonations = () => {
    return donations.filter((donation) => {
      const matchesSearch =
        donation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donation.name && donation.name.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesType = true;
      if (selectedType !== "all") {
        matchesType = donation.donationType._id === selectedType;
      }

      let matchesStatus = true;
      if (selectedStatus !== "all") {
        matchesStatus = donation.status === selectedStatus;
      }

      const matchesDate = !date?.from || (
        new Date(donation.createdAt) >= date.from &&
        (!date.to || new Date(donation.createdAt) <= date.to)
      );

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  };

  const filteredDonations = getFilteredDonations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Donations</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="secondary"
            className="text-foreground"
            onClick={exportToCsv}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            variant="secondary"
            className="text-foreground"
            asChild
          >
            <Link href="/admin/donations/types">
              Manage Donation Types
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Donation Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedType} onValueChange={setSelectedType} defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {donationTypes.map((type) => (
                    <SelectItem key={type._id} value={type._id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus} defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Date Range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Button onClick={handleFilter}>
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>

              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No donations found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.map((donation) => (
                    <TableRow key={donation._id}>
                      <TableCell>{new Date(donation.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div>
                          {donation.anonymous ? (
                            <span className="font-medium">Anonymous</span>
                          ) : (
                            <span className="font-medium">{donation.name}</span>
                          )}
                          <div className="text-sm text-muted-foreground">{donation.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{donation.donationType.name}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">${donation.amount.toFixed(2)}</div>
                          {donation.totalAmount > donation.amount && (
                            <div className="text-sm text-muted-foreground">
                              Total: ${donation.totalAmount.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(donation.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/donations/${donation._id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


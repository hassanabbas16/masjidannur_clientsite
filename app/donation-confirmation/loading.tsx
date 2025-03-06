import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container px-4 py-12 min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <Card className="max-w-2xl w-full mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">Donation Confirmation</CardTitle>
          <CardDescription>Thank you for your support</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-12">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
          <p className="text-lg text-slate-600 animate-pulse">Processing your donation...</p>
          <div className="mt-8 w-full max-w-md space-y-4">
            <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse w-4/6"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

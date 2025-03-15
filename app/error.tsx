"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw, Home, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-red-100">
        <CardHeader className="space-y-1 pb-2">
          <div className="flex justify-center mb-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              <div className="rounded-full bg-red-50 p-3 text-red-600">
                <AlertCircle size={32} />
              </div>
            </motion.div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-red-600">Something went wrong</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            We encountered an error while processing your request
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4 pt-2">
          <div className="bg-muted/50 rounded-md p-3 text-sm">
            <p className="font-mono text-xs text-muted-foreground">Error ID: {error.digest || "Unknown"}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            This could be due to a temporary issue or something that needs our attention. You can try again or return to
            the home page.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => (window.location.href = "/")}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => window.open("mailto:info@emergitechsolutions.com", "_blank")}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Get Help
          </Button>
          <Button
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => reset()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

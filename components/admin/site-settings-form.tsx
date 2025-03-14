"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SiteSettingsFormProps {
  initialData: {
    logo: string
    siteName: string
    siteLocation: string
    // ... other fields
  }
}

export default function SiteSettingsForm({ initialData }: SiteSettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState(initialData)

  const handleImageUpload = (imageUrl: string) => {
    setSettings({
      ...settings,
      logo: imageUrl
    })
  }

  const handleImageRemove = () => {
    setSettings({
      ...settings,
      logo: "/placeholder.svg"
    })
  }

  // ... rest of your form logic

  return (
    <form>
      <Tabs defaultValue="header" className="space-y-4">
        <TabsList>
          <TabsTrigger value="header">Header</TabsTrigger>
          {/* ... other tabs */}
        </TabsList>

        <TabsContent value="header">
          <Card>
            <CardHeader>
              <CardTitle>Header Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Logooooooooo</Label>
                  <ImageUpload 
                    value={settings.logo}
                    onChange={handleImageUpload}
                    onRemove={handleImageRemove}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteLocation">Site Location</Label>
                  <Input
                    id="siteLocation"
                    value={settings.siteLocation}
                    onChange={(e) => setSettings({ ...settings, siteLocation: e.target.value })}
                    disabled={loading}
                  />
                </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                disabled={loading}
                className="ml-auto"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* ... other tabs content */}
      </Tabs>
    </form>
  )
} 
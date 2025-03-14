"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Save, Plus, Trash2, Edit, Check, X, GripVertical, Facebook, Instagram, Twitter, Youtube, Linkedin, Mail, Phone, MapPin, ImageIcon, LinkIcon, MenuIcon, ExternalLink } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ImageUpload } from "@/components/ui/image-upload"

interface SiteSettings {
  _id?: string
  // Header Settings
  logo: string
  siteName: string
  siteLocation: string
  headerMenuItems: {
    id: string
    name: string
    href: string
    enabled: boolean
    dropdown: boolean
    order: number
    items?: {
      id: string
      name: string
      href: string
      order: number
    }[]
  }[]
  
  // Footer Settings
  footerLogo: string
  footerTagline: string
  socialLinks: {
    platform: string
    url: string
    icon: string
    enabled: boolean
  }[]
  quickLinks: {
    id: string
    name: string
    href: string
    enabled: boolean
    order: number
  }[]
  contactInfo: {
    address: string
    phone: string
    email: string
  }
  copyrightText: string
  developerInfo: {
    name: string
    url: string
    enabled: boolean
  }
  
  // General
  isActive: boolean
}

export default function SiteSettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("header")
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Header editing states
  const [editingMenuItem, setEditingMenuItem] = useState<string | null>(null)
  const [editingSubmenuItem, setEditingSubmenuItem] = useState<{menuId: string, itemId: string} | null>(null)
  const [menuItemForm, setMenuItemForm] = useState({
    id: "",
    name: "",
    href: "",
    enabled: true,
    dropdown: false
  })
  const [submenuItemForm, setSubmenuItemForm] = useState({
    id: "",
    name: "",
    href: ""
  })
  
  // Footer editing states
  const [editingSocialLink, setEditingSocialLink] = useState<string | null>(null)
  const [socialLinkForm, setLinkForm] = useState({
    platform: "",
    url: "",
    icon: "",
    enabled: true
  })
  const [editingQuickLink, setEditingQuickLink] = useState<string | null>(null)
  const [quickLinkForm, setQuickLinkForm] = useState({
    id: "",
    name: "",
    href: "",
    enabled: true
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/site-settings")
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching site settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return
    
    try {
      setSaving(true)
      
      const response = await fetch("/api/site-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })
      
      if (response.ok) {
        alert("Settings saved successfully!")
      } else {
        alert("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("An error occurred while saving settings")
    } finally {
      setSaving(false)
    }
  }

  // Header menu item functions
  const handleAddMenuItem = () => {
    if (!settings) return
    
    const newItem = {
      id: uuidv4(),
      name: "New Item",
      href: "#",
      enabled: true,
      dropdown: false,
      order: settings.headerMenuItems.length,
      items: []
    }
    
    setSettings({
      ...settings,
      headerMenuItems: [...settings.headerMenuItems, newItem]
    })
    
    // Start editing the new item
    setMenuItemForm({
      id: newItem.id,
      name: newItem.name,
      href: newItem.href,
      enabled: newItem.enabled,
      dropdown: newItem.dropdown
    })
    setEditingMenuItem(newItem.id)
  }

  const handleEditMenuItem = (item: any) => {
    setMenuItemForm({
      id: item.id,
      name: item.name,
      href: item.href,
      enabled: item.enabled,
      dropdown: item.dropdown
    })
    setEditingMenuItem(item.id)
  }

  const handleSaveMenuItem = () => {
    if (!settings) return
    
    const updatedItems = settings.headerMenuItems.map(item => 
      item.id === menuItemForm.id ? {
        ...item,
        name: menuItemForm.name,
        href: menuItemForm.href,
        enabled: menuItemForm.enabled,
        dropdown: menuItemForm.dropdown,
        // If dropdown was turned off, keep the items array but they won't be displayed
      } : item
    )
    
    setSettings({
      ...settings,
      headerMenuItems: updatedItems
    })
    
    setEditingMenuItem(null)
  }

  const handleDeleteMenuItem = (id: string) => {
    if (!settings) return
    
    const updatedItems = settings.headerMenuItems.filter(item => item.id !== id)
    
    // Reorder remaining items
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      order: index
    }))
    
    setSettings({
      ...settings,
      headerMenuItems: reorderedItems
    })
  }

  const handleReorderMenuItems = (result: any) => {
    if (!result.destination || !settings) return
    
    const items = Array.from(settings.headerMenuItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    // Update order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }))
    
    setSettings({
      ...settings,
      headerMenuItems: updatedItems
    })
  }

  // Submenu item functions
  const handleAddSubmenuItem = (menuId: string) => {
    if (!settings) return
    
    const newItem = {
      id: uuidv4(),
      name: "New Submenu Item",
      href: "#",
      order: 0
    }
    
    const updatedItems = settings.headerMenuItems.map(item => {
      if (item.id === menuId) {
        const items = item.items || []
        newItem.order = items.length
        return {
          ...item,
          items: [...items, newItem]
        }
      }
      return item
    })
    
    setSettings({
      ...settings,
      headerMenuItems: updatedItems
    })
    
    // Start editing the new item
    setSubmenuItemForm({
      id: newItem.id,
      name: newItem.name,
      href: newItem.href
    })
    setEditingSubmenuItem({ menuId, itemId: newItem.id })
  }

  const handleEditSubmenuItem = (menuId: string, item: any) => {
    setSubmenuItemForm({
      id: item.id,
      name: item.name,
      href: item.href
    })
    setEditingSubmenuItem({ menuId, itemId: item.id })
  }

  const handleSaveSubmenuItem = () => {
    if (!settings || !editingSubmenuItem) return
    
    const { menuId, itemId } = editingSubmenuItem
    
    const updatedItems = settings.headerMenuItems.map(item => {
      if (item.id === menuId && item.items) {
        return {
          ...item,
          items: item.items.map(subItem => 
            subItem.id === itemId ? {
              ...subItem,
              name: submenuItemForm.name,
              href: submenuItemForm.href
            } : subItem
          )
        }
      }
      return item
    })
    
    setSettings({
      ...settings,
      headerMenuItems: updatedItems
    })
    
    setEditingSubmenuItem(null)
  }

  const handleDeleteSubmenuItem = (menuId: string, itemId: string) => {
    if (!settings) return
    
    const updatedItems = settings.headerMenuItems.map(item => {
      if (item.id === menuId && item.items) {
        return {
          ...item,
          items: item.items.filter(subItem => subItem.id !== itemId)
        }
      }
      return item
    })
    
    setSettings({
      ...settings,
      headerMenuItems: updatedItems
    })
  }

  const handleReorderSubmenuItems = (menuId: string, result: any) => {
    if (!result.destination || !settings) return
    
    const updatedItems = settings.headerMenuItems.map(item => {
      if (item.id === menuId && item.items) {
        const subItems = Array.from(item.items)
        const [reorderedItem] = subItems.splice(result.source.index, 1)
        subItems.splice(result.destination.index, 0, reorderedItem)
        
        // Update order property
        const updatedSubItems = subItems.map((subItem, index) => ({
          ...subItem,
          order: index
        }))
        
        return {
          ...item,
          items: updatedSubItems
        }
      }
      return item
    })
    
    setSettings({
      ...settings,
      headerMenuItems: updatedItems
    })
  }

  // Footer functions
  const handleAddSocialLink = () => {
    if (!settings) return
    
    const newLink = {
      platform: "New Platform",
      url: "#",
      icon: "Link",
      enabled: true
    }
    
    setSettings({
      ...settings,
      socialLinks: [...settings.socialLinks, newLink]
    })
    
    // Start editing the new link
    setLinkForm({
      platform: newLink.platform,
      url: newLink.url,
      icon: newLink.icon,
      enabled: newLink.enabled
    })
    setEditingSocialLink(newLink.platform)
  }

  const handleEditSocialLink = (link: any) => {
    setLinkForm({
      platform: link.platform,
      url: link.url,
      icon: link.icon,
      enabled: link.enabled
    })
    setEditingSocialLink(link.platform)
  }

  const handleSaveSocialLink = () => {
    if (!settings || !editingSocialLink) return
    
    const updatedLinks = settings.socialLinks.map(link => 
      link.platform === editingSocialLink ? socialLinkForm : link
    )
    
    setSettings({
      ...settings,
      socialLinks: updatedLinks
    })
    
    setEditingSocialLink(null)
  }

  const handleDeleteSocialLink = (platform: string) => {
    if (!settings) return
    
    const updatedLinks = settings.socialLinks.filter(link => link.platform !== platform)
    
    setSettings({
      ...settings,
      socialLinks: updatedLinks
    })
  }

  const handleToggleSocialLink = (platform: string) => {
    if (!settings) return
    
    const updatedLinks = settings.socialLinks.map(link => 
      link.platform === platform ? { ...link, enabled: !link.enabled } : link
    )
    
    setSettings({
      ...settings,
      socialLinks: updatedLinks
    })
  }

  // Quick links functions
  const handleAddQuickLink = () => {
    if (!settings) return
    
    const newLink = {
      id: uuidv4(),
      name: "New Link",
      href: "#",
      enabled: true,
      order: settings.quickLinks.length
    }
    
    setSettings({
      ...settings,
      quickLinks: [...settings.quickLinks, newLink]
    })
    
    // Start editing the new link
    setQuickLinkForm({
      id: newLink.id,
      name: newLink.name,
      href: newLink.href,
      enabled: newLink.enabled
    })
    setEditingQuickLink(newLink.id)
  }

  const handleEditQuickLink = (link: any) => {
    setQuickLinkForm({
      id: link.id,
      name: link.name,
      href: link.href,
      enabled: link.enabled
    })
    setEditingQuickLink(link.id)
  }

  const handleSaveQuickLink = () => {
    if (!settings || !editingQuickLink) return
    
    const updatedLinks = settings.quickLinks.map(link => 
      link.id === editingQuickLink ? {
        ...link,
        name: quickLinkForm.name,
        href: quickLinkForm.href,
        enabled: quickLinkForm.enabled
      } : link
    )
    
    setSettings({
      ...settings,
      quickLinks: updatedLinks
    })
    
    setEditingQuickLink(null)
  }

  const handleDeleteQuickLink = (id: string) => {
    if (!settings) return
    
    const updatedLinks = settings.quickLinks.filter(link => link.id !== id)
    
    // Reorder remaining links
    const reorderedLinks = updatedLinks.map((link, index) => ({
      ...link,
      order: index
    }))
    
    setSettings({
      ...settings,
      quickLinks: reorderedLinks
    })
  }

  const handleReorderQuickLinks = (result: any) => {
    if (!result.destination || !settings) return
    
    const links = Array.from(settings.quickLinks)
    const [reorderedLink] = links.splice(result.source.index, 1)
    links.splice(result.destination.index, 0, reorderedLink)
    
    // Update order property
    const updatedLinks = links.map((link, index) => ({
      ...link,
      order: index
    }))
    
    setSettings({
      ...settings,
      quickLinks: updatedLinks
    })
  }

  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case "Facebook": return <Facebook className="h-5 w-5" />
      case "Instagram": return <Instagram className="h-5 w-5" />
      case "Twitter": return <Twitter className="h-5 w-5" />
      case "Youtube": return <Youtube className="h-5 w-5" />
      case "Linkedin": return <Linkedin className="h-5 w-5" />
      case "Mail": return <Mail className="h-5 w-5" />
      default: return <LinkIcon className="h-5 w-5" />
    }
  }

  const handleSettingsChange = (field: string, value: string) => {
    if (!settings) return
    
    setSettings({
      ...settings,
      [field]: value
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-800">Settings Not Found</h1>
        <p className="mt-4 text-gray-600">Unable to load site settings.</p>
        <Button className="mt-6" onClick={fetchSettings}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>
        
        {/* Header Tab */}
        <TabsContent value="header" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Header Settings</CardTitle>
              <CardDescription>Manage the site logo, name, and navigation menu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <ImageUpload
                    value={settings.logo}
                    onChange={(url) => handleSettingsChange("logo", url)}
                    onRemove={() => handleSettingsChange("logo", "")}
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site-location">Site Location</Label>
                  <Input
                    id="site-location"
                    value={settings.siteLocation}
                    onChange={(e) => setSettings({ ...settings, siteLocation: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Navigation Menu</h3>
                  <Button onClick={handleAddMenuItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Menu Item
                  </Button>
                </div>
                
                <DragDropContext onDragEnd={handleReorderMenuItems}>
                  <Droppable droppableId="menu-items">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {settings.headerMenuItems.length === 0 ? (
                          <p className="text-center py-4 text-muted-foreground">No menu items added yet</p>
                        ) : (
                          settings.headerMenuItems.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="border rounded-md p-4 bg-background"
                                >
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                      <div {...provided.dragHandleProps} className="mr-2 cursor-grab">
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      {editingMenuItem === item.id ? (
                                        <div className="flex-1 space-y-3">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                              <Label htmlFor={`menu-name-${item.id}`}>Name</Label>
                                              <Input
                                                id={`menu-name-${item.id}`}
                                                value={menuItemForm.name}
                                                onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor={`menu-href-${item.id}`}>Link</Label>
                                              <Input
                                                id={`menu-href-${item.id}`}
                                                value={menuItemForm.href}
                                                onChange={(e) => setMenuItemForm({ ...menuItemForm, href: e.target.value })}
                                              />
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <div className="flex items-center space-x-2">
                                              <Switch
                                                id={`menu-enabled-${item.id}`}
                                                checked={menuItemForm.enabled}
                                                onCheckedChange={(checked) => setMenuItemForm({ ...menuItemForm, enabled: checked })}
                                              />
                                              <Label htmlFor={`menu-enabled-${item.id}`}>Enabled</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <Switch
                                                id={`menu-dropdown-${item.id}`}
                                                checked={menuItemForm.dropdown}
                                                onCheckedChange={(checked) => setMenuItemForm({ ...menuItemForm, dropdown: checked })}
                                              />
                                              <Label htmlFor={`menu-dropdown-${item.id}`}>Has Dropdown</Label>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex-1">
                                          <div className="flex items-center">
                                            <h4 className="font-medium">{item.name}</h4>
                                            {!item.enabled && (
                                              <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                                Hidden
                                              </span>
                                            )}
                                            {item.dropdown && (
                                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                Dropdown
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm text-muted-foreground">{item.href}</p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      {editingMenuItem === item.id ? (
                                        <>
                                          <Button variant="outline" size="sm" onClick={handleSaveMenuItem}>
                                            <Check className="h-4 w-4" />
                                          </Button>
                                          <Button variant="outline" size="sm" onClick={() => setEditingMenuItem(null)}>
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <Button variant="outline" size="sm" onClick={() => handleEditMenuItem(item)}>
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button variant="outline" size="sm" onClick={() => handleDeleteMenuItem(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Submenu Items */}
                                  {item.dropdown && (
                                    <div className="mt-4 pl-8 border-t pt-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <h5 className="text-sm font-medium">Dropdown Items</h5>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => handleAddSubmenuItem(item.id)}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Add Item
                                        </Button>
                                      </div>
                                      
                                      <DragDropContext onDragEnd={(result) => handleReorderSubmenuItems(item.id, result)}>
                                        <Droppable droppableId={`submenu-${item.id}`}>
                                          {(provided) => (
                                            <div
                                              {...provided.droppableProps}
                                              ref={provided.innerRef}
                                              className="space-y-2"
                                            >
                                              {!item.items || item.items.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No dropdown items added yet</p>
                                              ) : (
                                                item.items.map((subItem, subIndex) => (
                                                  <Draggable key={subItem.id} draggableId={subItem.id} index={subIndex}>
                                                    {(provided) => (
                                                      <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className="flex items-center justify-between p-2 border rounded-md bg-muted/40"
                                                      >
                                                        {editingSubmenuItem && 
                                                         editingSubmenuItem.menuId === item.id && 
                                                         editingSubmenuItem.itemId === subItem.id ? (
                                                          <div className="flex-1 flex gap-2">
                                                            <Input
                                                              value={submenuItemForm.name}
                                                              onChange={(e) => setSubmenuItemForm({ ...submenuItemForm, name: e.target.value })}
                                                              placeholder="Name"
                                                              className="h-8 text-sm"
                                                            />
                                                            <Input
                                                              value={submenuItemForm.href}
                                                              onChange={(e) => setSubmenuItemForm({ ...submenuItemForm, href: e.target.value })}
                                                              placeholder="Link"
                                                              className="h-8 text-sm"
                                                            />
                                                            <Button variant="outline" size="sm" onClick={handleSaveSubmenuItem}>
                                                              <Check className="h-3 w-3" />
                                                            </Button>
                                                            <Button variant="outline" size="sm" onClick={() => setEditingSubmenuItem(null)}>
                                                              <X className="h-3 w-3" />
                                                            </Button>
                                                          </div>
                                                        ) : (
                                                          <>
                                                            <div className="flex items-center">
                                                              <div {...provided.dragHandleProps} className="mr-2 cursor-grab">
                                                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                              </div>
                                                              <div>
                                                                <p className="text-sm font-medium">{subItem.name}</p>
                                                                <p className="text-xs text-muted-foreground">{subItem.href}</p>
                                                              </div>
                                                            </div>
                                                            <div className="flex gap-1">
                                                              <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => handleEditSubmenuItem(item.id, subItem)}
                                                              >
                                                                <Edit className="h-3 w-3" />
                                                              </Button>
                                                              <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => handleDeleteSubmenuItem(item.id, subItem.id)}
                                                              >
                                                                <Trash2 className="h-3 w-3" />
                                                              </Button>
                                                            </div>
                                                          </>
                                                        )}
                                                      </div>
                                                    )}
                                                  </Draggable>
                                                ))
                                              )}
                                              {provided.placeholder}
                                            </div>
                                          )}
                                        </Droppable>
                                      </DragDropContext>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving} className="ml-auto">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Footer Tab */}
        <TabsContent value="footer" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Footer Settings</CardTitle>
              <CardDescription>Manage the footer content, links, and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Footer Logo</Label>
                  <ImageUpload
                    value={settings.footerLogo}
                    onChange={(url) => handleSettingsChange("footerLogo", url)}
                    onRemove={() => handleSettingsChange("footerLogo", "")}
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="footer-tagline">Footer Tagline</Label>
                  <Textarea
                    id="footer-tagline"
                    value={settings.footerTagline}
                    onChange={(e) => setSettings({ ...settings, footerTagline: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Contact Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={settings.contactInfo.address}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      contactInfo: { 
                        ...settings.contactInfo, 
                        address: e.target.value 
                      } 
                    })}
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={settings.contactInfo.phone}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        contactInfo: { 
                          ...settings.contactInfo, 
                          phone: e.target.value 
                        } 
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={settings.contactInfo.email}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        contactInfo: { 
                          ...settings.contactInfo, 
                          email: e.target.value 
                        } 
                      })}
                    />
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Social Links</h3>
                  <Button onClick={handleAddSocialLink} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Social Link
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Icon</TableHead>
                      <TableHead>Visible</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settings.socialLinks.map((link) => (
                      <TableRow key={link.platform}>
                        {editingSocialLink === link.platform ? (
                          <>
                            <TableCell>
                              <Input
                                value={socialLinkForm.platform}
                                onChange={(e) => setLinkForm({ ...socialLinkForm, platform: e.target.value })}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={socialLinkForm.url}
                                onChange={(e) => setLinkForm({ ...socialLinkForm, url: e.target.value })}
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={socialLinkForm.icon}
                                onValueChange={(value) => setLinkForm({ ...socialLinkForm, icon: value })}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue placeholder="Select icon" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Facebook">Facebook</SelectItem>
                                  <SelectItem value="Instagram">Instagram</SelectItem>
                                  <SelectItem value="Twitter">Twitter</SelectItem>
                                  <SelectItem value="Youtube">Youtube</SelectItem>
                                  <SelectItem value="Linkedin">LinkedIn</SelectItem>
                                  <SelectItem value="Mail">Mail</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={socialLinkForm.enabled}
                                onCheckedChange={(checked) => setLinkForm({ ...socialLinkForm, enabled: checked })}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={handleSaveSocialLink}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setEditingSocialLink(null)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{link.platform}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="truncate max-w-[150px]">{link.url}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6" 
                                  onClick={() => window.open(link.url, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                                {getSocialIcon(link.icon)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={link.enabled}
                                onCheckedChange={() => handleToggleSocialLink(link.platform)}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditSocialLink(link)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDeleteSocialLink(link.platform)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Quick Links */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Quick Links</h3>
                  <Button onClick={handleAddQuickLink} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Quick Link
                  </Button>
                </div>
                
                <DragDropContext onDragEnd={handleReorderQuickLinks}>
                  <Droppable droppableId="quick-links">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {settings.quickLinks.length === 0 ? (
                          <p className="text-center py-4 text-muted-foreground">No quick links added yet</p>
                        ) : (
                          settings.quickLinks.map((link, index) => (
                            <Draggable key={link.id} draggableId={link.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center justify-between p-3 border rounded-md bg-background"
                                >
                                  {editingQuickLink === link.id ? (
                                    <div className="flex-1 flex gap-2">
                                      <div {...provided.dragHandleProps} className="flex items-center mr-2 cursor-grab">
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      <Input
                                        value={quickLinkForm.name}
                                        onChange={(e) => setQuickLinkForm({ ...quickLinkForm, name: e.target.value })}
                                        placeholder="Name"
                                        className="flex-1"
                                      />
                                      <Input
                                        value={quickLinkForm.href}
                                        onChange={(e) => setQuickLinkForm({ ...quickLinkForm, href: e.target.value })}
                                        placeholder="Link"
                                        className="flex-1"
                                      />
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id={`quick-link-enabled-${link.id}`}
                                          checked={quickLinkForm.enabled}
                                          onCheckedChange={(checked) => setQuickLinkForm({ ...quickLinkForm, enabled: checked })}
                                        />
                                        <Label htmlFor={`quick-link-enabled-${link.id}`} className="text-sm">Enabled</Label>
                                      </div>
                                      <Button variant="outline" size="sm" onClick={handleSaveQuickLink}>
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={() => setEditingQuickLink(null)}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center">
                                        <div {...provided.dragHandleProps} className="mr-2 cursor-grab">
                                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                          <div className="flex items-center">
                                            <p className="font-medium">{link.name}</p>
                                            {!link.enabled && (
                                              <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                                Hidden
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm text-muted-foreground">{link.href}</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEditQuickLink(link)}>
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDeleteQuickLink(link.id)}>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
              
              {/* Copyright & Developer Info */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Copyright & Credits</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="copyright-text">Copyright Text</Label>
                  <Input
                    id="copyright-text"
                    value={settings.copyrightText}
                    onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })}
                    placeholder="© {year} Your Organization. All rights reserved."
                  />
                  <p className="text-sm text-muted-foreground">
                    Use {'{year}'} to automatically insert the current year
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="developer-info">Developer Credit</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="developer-credit-enabled"
                        checked={settings.developerInfo.enabled}
                        onCheckedChange={(checked) => setSettings({ 
                          ...settings, 
                          developerInfo: { 
                            ...settings.developerInfo, 
                            enabled: checked 
                          } 
                        })}
                      />
                      <Label htmlFor="developer-credit-enabled" className="text-sm">Show Credit</Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      id="developer-name"
                      value={settings.developerInfo.name}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        developerInfo: { 
                          ...settings.developerInfo, 
                          name: e.target.value 
                        } 
                      })}
                      placeholder="Developer/Agency Name"
                    />
                    <Input
                      id="developer-url"
                      value={settings.developerInfo.url}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        developerInfo: { 
                          ...settings.developerInfo, 
                          url: e.target.value 
                        } 
                      })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving} className="ml-auto">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

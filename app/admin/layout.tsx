"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import {
  Calendar,
  Home,
  LogOut,
  Settings,
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Bot,
  Mail,
  Menu,
  X,
  Heart,
  FileText,
  Info,
  Moon,
  BookMarked,
  LayoutDashboard,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Check if user prefers dark mode
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/check-auth")
        if (!response.ok) {
          setIsLoggedIn(false)
          if (pathname !== "/admin/login") {
            router.push("/admin/login")
          }
        } else {
          setIsLoggedIn(true)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      }
    }

    checkAuth()
  }, [pathname, router])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" })
      if (response.ok) {
        setIsLoggedIn(false)
        router.push("/admin/login")
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Check if current path is active
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  // Don't show layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: Home
    },
    {
      label: "Events",
      path: "/admin/events",
      icon: Calendar
    },
    {
      label: "Programs",
      path: "/admin/programs",
      icon: BookOpen
    },
    {
      label: "Donations",
      path: "/admin/donations",
      icon: Heart
    },
    {
      label: "Resources",
      path: "/admin/resources",
      icon: FileText
    },
    {
      label: "About",
      path: "/admin/about",
      icon: Info
    },
    {
      label: "Ramadan Management",
      path: "/admin/ramadan-management",
      icon: Moon
    },
    {
      label: "Ramadan Events",
      path: "/admin/ramadan/events",
      icon: Users
    },
    {
      label: "Ramadan Resources",
      path: "/admin/ramadan/resources",
      icon: BookMarked
    },
    {
      label: "Site Settings",
      path: "/admin/site-settings",
      icon: Settings
    },
    {
      label: "Home Settings",
      path: "/admin/home-page",
      icon: LayoutDashboard
    }
  ]

  const sidebarBgColor ="bg-[#0D7A3B]"
  const sidebarTextColor = "text-white"
  const sidebarHoverColor = "hover:bg-[#0B6A34]"
  const sidebarActiveColor = "bg-[#0B6A34]"
  const sidebarBorderColor = "border-[#0A5A2D]"

  const mainBgColor = theme === "dark" ? "bg-gray-800" : "bg-gray-100"
  const mainTextColor = theme === "dark" ? "text-white" : "text-gray-900"

  return (
    <div className={cn("relative min-h-screen", mainBgColor, mainTextColor)}>
      {/* Mobile Navigation Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileNavOpen(false)} />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out shadow-xl z-50",
          sidebarBgColor,
          sidebarTextColor,
          sidebarBorderColor,
          isCollapsed ? "w-20" : "w-64",
          "hidden lg:block",
        )}
      >
        <div className={cn("p-4 flex items-center justify-between border-b", sidebarBorderColor)}>
          <h2
            className={cn(
              "font-bold text-xl transition-opacity duration-200",
              isCollapsed ? "opacity-0 hidden" : "opacity-100",
            )}
          >
            Admin Panel
          </h2>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 absolute -right-4 top-6 shadow-lg transform transition-transform duration-200 hover:scale-110",
              sidebarBgColor,
            )}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-white" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        <nav className="mt-6 h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
          <style jsx global>{`
            .scrollbar-thin::-webkit-scrollbar {
              width: 4px;
            }
            .scrollbar-thin::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.1);
            }
            .scrollbar-thin::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.2);
              border-radius: 2px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.3);
            }
          `}</style>

          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const isItemActive =
                isActive(item.path) &&
                (item.path === "/admin" ? !isActive("/admin/events") && !isActive("/admin/programs") : true)

              return (
                <li key={index}>
                  <Link
                    href={item.path}
                    className={cn(
                      "w-full flex items-center p-4 transition-all duration-200 group",
                      isCollapsed ? "justify-center" : "justify-start",
                      isItemActive ? sidebarActiveColor : "",
                      sidebarHoverColor,
                    )}
                    aria-label={item.label}
                  >
                    <item.icon className={cn("w-6 h-6", isCollapsed ? "mr-0" : "mr-4")} />
                    <span
                      className={cn(
                        "transition-opacity duration-200",
                        isCollapsed ? "opacity-0 hidden" : "opacity-100",
                      )}
                    >
                      {item.label}
                    </span>
                    {isCollapsed && (
                      <div className="absolute left-20 bg-[#0B6A34] text-white px-3 py-2 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
            <li>
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center text-white rounded-md p-3 w-full transition-all duration-200 group",
                  sidebarHoverColor,
                  isCollapsed ? "justify-center" : "justify-start",
                )}
              >
                <LogOut className="w-6 h-6" />
                <span
                  className={cn("ml-2 transition-opacity duration-200", 
                    isCollapsed ? "opacity-0 hidden" : "opacity-100"
                  )}
                >
                  Logout
                </span>
                {isCollapsed && (
                  <div className="absolute left-20 bg-[#0B6A34] text-white px-3 py-2 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    Logout
                  </div>
                )}
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar - Drawer style */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
          sidebarBgColor,
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn("p-4 flex items-center justify-between border-b", sidebarBorderColor)}>
            <h2 className="font-bold text-xl text-white">Admin Panel</h2>
            <button onClick={() => setIsMobileNavOpen(false)} className="p-2 rounded-full text-white hover:bg-[#0B6A34">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-2">
              {menuItems.map((item, index) => {
                const isItemActive =
                  isActive(item.path) &&
                  (item.path === "/admin" ? !isActive("/admin/events") && !isActive("/admin/programs") : true)

                return (
                  <li key={index}>
                    <Link
                      href={item.path}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={cn(
                        "flex items-center p-3 rounded-md transition-all duration-200",
                        isItemActive ? sidebarActiveColor : "",
                        sidebarHoverColor,
                      )}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className={cn("p-4 border-t", sidebarBorderColor)}>
            <button
              onClick={() => {
                setIsMobileNavOpen(false)
                handleLogout()
              }}
              className={cn("flex items-center w-full p-3 rounded-md", sidebarHoverColor)}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 h-16 border-b z-30 lg:hidden",
          theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
        )}
      >
        <div className="flex items-center justify-between px-4 h-full">
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className={cn("p-2 rounded-lg", theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100")}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className={cn("text-lg font-semibold", theme === "dark" ? "text-white" : "text-gray-900")}>
            Admin Dashboard
          </h1>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn("p-2 rounded-lg", theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100")}
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-yellow-300"
              >
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t",
          theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
        )}
      >
        <div className="grid grid-cols-5 h-16">
          {menuItems.slice(0, 5).map((item, index) => {
            const isItemActive =
              isActive(item.path) &&
              (item.path === "/admin" ? !isActive("/admin/events") && !isActive("/admin/programs") : true)

            return (
              <Link
                key={index}
                href={item.path}
                className={cn(
                  "flex flex-col items-center justify-center",
                  isItemActive
                    ? theme === "dark"
                      ? "text-blue-400"
                      : "text-blue-600"
                    : theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600",
                  "hover:bg-opacity-10 hover:bg-gray-500",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300 min-h-screen",
          "lg:ml-64", // Default for desktop expanded
          isCollapsed ? "lg:ml-20" : "", // Adjust for desktop collapsed
          "pb-16 lg:pb-0", // Add padding for mobile bottom nav
        )}
      >
        <div className="min-h-screen flex flex-col">
          {/* Content */}
          <div className="flex-1 p-4 pt-20 lg:pt-6 lg:p-8">{children}</div>
        </div>
      </main>
    </div>
  )
}


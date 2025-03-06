"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

type MenuItem = {
  name: string
  href?: string
  enabled: boolean
  dropdown?: boolean
  items?: { name: string; href: string }[]
}

const menuItems: MenuItem[] = [
  { name: "Home", href: "/", enabled: true },
  { name: "About", href: "/about", enabled: true },
  {
    name: "Programs",
    enabled: true,
    dropdown: true,
    href: "/programs",
    items: [
      { name: "Team Fajr", href: "/programs/team-fajr" },
      { name: "Tafsir Classes", href: "/programs/tafsir-classes" },
      { name: "Islamic School", href: "/programs/islamic-school" },
      { name: "Revert Tutoring", href: "/programs/revert-tutoring" },
    ],
  },
  {
    name: "Resources",
    enabled: true,
    dropdown: true,
    href: "/resources",
    items: [{ name: "Become A Resource", href: "/resources/become-resource" }],
  },
  { name: "Prayer Times", href: "/prayer-times", enabled: true },
  { name: "Online Giving", href: "/online-giving", enabled: true },
  {
    name: "Ramadan",
    enabled: true,
    dropdown: true,
    href: "/ramadan",
    items: [
      { name: "Iftar Times", href: "/ramadan/iftar-times" },
      { name: "Sponsor an Iftar", href: "/ramadan/sponsor-iftar" },
    ],
  },
]


export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name))
  }

  const handleLinkClick = (item: MenuItem) => {
    setMobileMenuOpen(false)
    setOpenDropdown(null)
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md border-b border-border/40 text-foreground"
          : "bg-[#0D7A3B] text-white",
      )}
    >
      <div className="container flex h-16 md:h-20 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/placeholder.svg?height=48&width=48"
            alt="Masjid AnNoor Logo"
            width={48}
            height={48}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 border-white/20 shadow-md object-cover"
          />
          <div>
            <span className="block text-lg sm:text-xl md:text-2xl font-heading font-bold">
              Masjid AnNoor
            </span>
            <span className="text-xs opacity-80">Fort Smith, AR</span>
          </div>
        </Link>

        {/* Desktop Menu - Only shows on 1024px+ */}
        <div className="hidden lg:flex space-x-4 xl:space-x-6">
          {menuItems.map((item) =>
            item.dropdown ? (
              <div key={item.name} className="relative">
                <div className="relative group flex items-center gap-1 font-medium px-3 xl:px-4 py-1.5 text-[15px]">
                  <Link
                    href={item.href || "#"}
                    className="relative group-hover:text-green-600 transition-colors"
                    onClick={() => handleLinkClick(item)}
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-green-600 transition-all group-hover:w-full" />
                  </Link>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className="p-1 hover:text-green-600"
                    aria-label={`Toggle ${item.name} dropdown`}
                  >
                    <ChevronDown className="h-4 w-4 opacity-80" />
                  </button>
                </div>
                {/* Dropdown Content */}
                <AnimatePresence>
                  {openDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="absolute top-10 left-0 w-56 bg-white shadow-xl rounded-xl border z-50"
                    >
                      <ul className="space-y-1">
                        {item.items?.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.href}
                              className="block px-4 py-2 text-[14px] rounded-md hover:bg-gray-100 font-medium text-gray-700"
                              onClick={() => {
                                setMobileMenuOpen(false)
                                setOpenDropdown(null)
                              }}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href || "#"}
                className="relative group font-medium px-3 xl:px-4 py-1.5 text-[15px]"
                onClick={() => handleLinkClick(item)}
              >
                <span className="relative group-hover:text-green-600 transition-colors">
                  {item.name}
                  <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-green-600 transition-all group-hover:w-full" />
                </span>
              </Link>
            ),
          )}
        </div>

        {/* Mobile Menu Button - Shows on screens <1024px */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "lg:hidden h-9 w-9 sm:h-10 sm:w-10",
            scrolled ? "hover:bg-accent" : "text-white hover:bg-white/10"
          )}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu - Enhanced for Tablet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-white text-foreground border-t"
          >
            <nav className="flex flex-col space-y-1 p-4">
              {menuItems.map((item) => (
                <div key={item.name} className="py-1">
                  <div className="flex justify-between items-center">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="flex-1 py-2 px-4 text-[16px] font-medium rounded-md hover:bg-gray-100"
                        onClick={() => handleLinkClick(item)}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <span className="flex-1 py-2 px-4 text-[16px] font-medium">
                        {item.name}
                      </span>
                    )}
                    {item.dropdown && (
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className="p-2"
                        aria-label={`Toggle ${item.name} submenu`}
                      >
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 transform transition-transform",
                            openDropdown === item.name && "rotate-180",
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Items */}
                  <AnimatePresence>
                    {item.dropdown && openDropdown === item.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pl-4 mt-1 space-y-1 overflow-hidden"
                      >
                        {item.items?.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block py-1.5 px-3 text-sm rounded-md hover:bg-gray-100"
                            onClick={() => {
                              setMobileMenuOpen(false)
                              setOpenDropdown(null)
                            }}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
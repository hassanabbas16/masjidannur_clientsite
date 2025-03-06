import Link from "next/link"
import Image from "next/image"
import { Mail, MapPin, Phone, Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#0D7A3B] to-[#085C2C] text-white">
      <div className="container py-16 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white/20 shadow-md">
                <Image
                  src="/placeholder.svg?height=48&width=48"
                  alt="Masjid AnNoor Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-2xl font-heading font-bold">Masjid AnNoor</span>
            </div>
            <p className="max-w-md text-white/80 leading-relaxed">
              Serving the spiritual, educational, and social needs of the Muslim community since 1993. A beacon of faith
              and service in our community.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xl font-heading font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-white/80 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/80 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/programs" className="text-white/80 hover:text-white transition-colors">
                  Programs
                </Link>
              </li>
              <li>
                <Link href="/event" className="text-white/80 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/prayer-times" className="text-white/80 hover:text-white transition-colors">
                  Prayer Times
                </Link>
              </li>
              <li>
                <Link href="/online-giving" className="text-white/80 hover:text-white transition-colors">
                  Donate
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xl font-heading font-bold mb-6">Our Office</h3>
            <address className="not-italic space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-1 text-white/70" />
                <span className="text-white/80">1800 S. Albert Pike Ave, Fort Smith, AR 72903</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-white/70" />
                <span className="text-white/80">479-783-2914</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-white/70" />
                <a
                  href="mailto:sunnie.islamic.center@gmail.com"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Sunnie.islamic.center@gmail.com
                </a>
              </div>
            </address>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-sm text-white/60">
        <div className="container">
          <p>
            © {new Date().getFullYear()} Masjid AnNoor. All rights reserved. Designed and Developed by{" "}
            <a
              href="https://emergitechsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 transition-colors"
            >
              Emergitech Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}


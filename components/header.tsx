"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-[#FBF8F3] py-4 px-4 md:px-6 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/critter-logo.png"
            alt="Critter Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="https://critter.pet" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Learn more
          </Link>
          <Link href="/how-to-use" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Professional Help Hub
          </Link>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden pt-4 pb-3 border-t border-gray-200 mt-4">
          <nav className="flex flex-col space-y-3">
            <Link
              href="https://critter.pet"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md text-sm font-medium"
            >
              Learn more
            </Link>
            <Link
              href="/how-to-use"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md text-sm font-medium"
            >
              Professional Help Hub
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

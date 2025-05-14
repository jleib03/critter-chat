"use client"
import Image from "next/image"
import Link from "next/link"
import BookingPage from "../components/booking-page"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      {/* Header with app links */}
      <header className="w-full py-4 px-6 flex justify-between items-center relative">
        <div className="flex space-x-4">
          <Link
            href="https://apps.apple.com/us/app/critter-pet-owners-pros/id1630023733"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#333] hover:text-[#E75837] transition-colors text-sm"
          >
            Download on iOS
          </Link>

          <Link
            href="https://play.google.com/store/apps/details?id=com.critterclient&pli=1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#333] hover:text-[#E75837] transition-colors text-sm"
          >
            Download on Android
          </Link>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Image src="/placeholder.svg?key=fi2nm" alt="Critter" width={180} height={60} className="h-12 w-auto" />
        </div>

        <Link
          href="https://critter.pet"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#333] hover:text-[#E75837] transition-colors text-sm"
        >
          Learn more
        </Link>
      </header>

      {/* Main content */}
      <main>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-serif text-center mb-6">Book pet care with Critter</h1>

          <p className="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
            Welcome to Critter's online booking portal, an extension of Critter's mobile app designed for fast and
            simple booking. If your pet services provider uses Critter, you can use this site to request bookings and
            answer questions about upcoming care and invoices.
          </p>

          <BookingPage />
        </div>
      </main>
    </div>
  )
}

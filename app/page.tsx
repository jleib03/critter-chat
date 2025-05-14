"use client"
import Image from "next/image"
import Link from "next/link"
import BookingPage from "../components/booking-page"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      {/* Header without border */}
      <header className="w-full py-5 px-6 flex justify-between items-center relative">
        <div className="flex space-x-6">
          <Link
            href="https://apps.apple.com/us/app/critter-pet-owners-pros/id1630023733"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#333] hover:text-[#E75837] transition-colors text-sm body-font"
          >
            Download on iOS
          </Link>

          <Link
            href="https://play.google.com/store/apps/details?id=com.critterclient&pli=1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#333] hover:text-[#E75837] transition-colors text-sm body-font"
          >
            Download on Android
          </Link>
        </div>

        <Link
          href="https://critter.pet"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-1/2 transform -translate-x-1/2"
        >
          <Image src="/images/critter-logo.png" alt="Critter" width={120} height={40} className="h-8 w-auto" />
        </Link>

        <Link
          href="https://critter.pet"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#333] hover:text-[#E75837] transition-colors text-sm body-font"
        >
          Learn more
        </Link>
      </header>

      {/* Main content with increased spacing */}
      <main className="pt-12 flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto px-4 flex flex-col page-content">
          <h1 className="text-5xl title-font text-center mb-6 font-sangbleu">Book pet care with Critter</h1>

          <p className="text-center text-gray-700 mb-12 max-w-3xl mx-auto body-font">
            Welcome to Critter's online booking portal, an extension of Critter's mobile app designed for fast and
            simple booking. If your pet services provider uses Critter, you can use this site to request bookings and
            answer questions about upcoming care and invoices.
          </p>

          {/* Booking page with adjusted columns */}
          <div className="flex-1 flex flex-col mb-16">
            <BookingPage />
          </div>
        </div>
      </main>
    </div>
  )
}

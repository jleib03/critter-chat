"use client"
import { useRouter } from "next/navigation"
import BookingPage from "../../components/booking-page"
import Header from "../../components/header"

export default function ExistingCustomerPage() {
  const router = useRouter()

  // Handler to go back to landing page
  const handleBackToLanding = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto px-4 flex flex-col page-content">
          <h1 className="text-4xl title-font text-center mb-4 font-sangbleu">Book pet care with Critter</h1>
          <p className="text-center text-gray-700 mb-8 max-w-3xl mx-auto body-font">
            Welcome to Critter's online booking portal, an extension of Critter's mobile app designed for fast and
            simple booking. If your pet services provider uses Critter, you can use this site to request bookings and
            answer questions about upcoming care and invoices.
          </p>
          <div className="flex-1 flex flex-col mb-12">
            <BookingPage />
          </div>
        </div>
      </main>
    </div>
  )
}

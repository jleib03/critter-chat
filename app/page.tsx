"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import BookingPage from "../components/booking-page"
import NewCustomerOnboarding from "../components/new-customer-onboarding"
import LandingPage from "../components/landing-page"

export default function Page() {
  const [currentView, setCurrentView] = useState<"landing" | "chat" | "onboarding">("landing")
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  // Use a more reliable webhook URL for testing
  const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook-test/216e36c3-4fe2-4f2e-80c3-d9ce6524f445"

  // Handler to start onboarding with a session ID and userId
  const handleStartOnboarding = (currentSessionId: string | null, currentUserId: string | null) => {
    console.log("Starting onboarding with session ID:", currentSessionId)
    console.log("Starting onboarding with user ID:", currentUserId)
    setSessionId(currentSessionId)
    setUserId(currentUserId)
    setShowOnboarding(true)
  }

  // Handlers for landing page options
  const handleExistingCustomer = () => {
    setCurrentView("chat")
  }

  const handleNewCustomer = () => {
    setCurrentView("onboarding")
  }

  // Handler to go back to landing page
  const handleBackToLanding = () => {
    setCurrentView("landing")
    setShowOnboarding(false)
  }

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
          onClick={() => setCurrentView("landing")}
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
      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto px-4 flex flex-col page-content">
          {currentView === "landing" && (
            <LandingPage
              onExistingCustomer={handleExistingCustomer}
              onNewCustomer={handleNewCustomer}
              webhookUrl={WEBHOOK_URL}
            />
          )}

          {currentView === "chat" && (
            <>
              <h1 className="text-4xl title-font text-center mb-4 font-sangbleu">Book pet care with Critter</h1>
              <p className="text-center text-gray-700 mb-8 max-w-3xl mx-auto body-font">
                Welcome to Critter's online booking portal, an extension of Critter's mobile app designed for fast and
                simple booking. If your pet services provider uses Critter, you can use this site to request bookings
                and answer questions about upcoming care and invoices.
              </p>
              <div className="flex-1 flex flex-col mb-12">
                <BookingPage onStartOnboarding={handleStartOnboarding} />
              </div>
            </>
          )}

          {currentView === "onboarding" && (
            <>
              <h1 className="text-4xl title-font text-center mb-4 font-sangbleu">New Customer Onboarding</h1>
              <p className="text-center text-gray-700 mb-8 max-w-3xl mx-auto body-font">
                Complete the form below to set up your account with your Critter professional.
              </p>
              <div className="flex-1 flex flex-col mb-12">
                <NewCustomerOnboarding
                  onCancel={handleBackToLanding}
                  onComplete={handleBackToLanding}
                  webhookUrl={WEBHOOK_URL}
                  initialSessionId={sessionId}
                  initialUserId={userId}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

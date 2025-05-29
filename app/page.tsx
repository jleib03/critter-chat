"use client"
import { useState } from "react"
import Header from "../components/header"
import LandingPage from "../components/landing-page"
import BookingPage from "../components/booking-page"
import NewCustomerIntake from "../components/new-customer-intake"

type UserInfo = {
  email: string
  firstName: string
  lastName: string
}

export default function Page() {
  const [currentView, setCurrentView] = useState<"landing" | "chat" | "intake">("landing")
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
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
  }

  // Handlers for landing page options
  const handleExistingCustomer = (userData: UserInfo) => {
    setUserInfo(userData)
    setCurrentView("chat")
  }

  const handleNewCustomer = () => {
    // For new customers, go directly to onboarding without requiring user info upfront
    setCurrentView("intake")
  }

  // Handler to go back to landing page
  const handleBackToLanding = () => {
    setCurrentView("landing")
    setUserInfo(null)
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto px-4 flex flex-col page-content">
          {currentView === "landing" && (
            <LandingPage
              webhookUrl={WEBHOOK_URL}
              onExistingCustomer={handleExistingCustomer}
              onNewCustomer={handleNewCustomer}
            />
          )}

          {currentView === "chat" && userInfo && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-4xl title-font mb-4 font-sangbleu">Welcome back, {userInfo.firstName}!</h1>
                <p className="text-gray-700 max-w-3xl mx-auto body-font">
                  Ready to book pet care services with Critter? Let's get started with your request.
                </p>
              </div>
              <div className="flex-1 flex flex-col mb-12">
                <BookingPage userInfo={userInfo} onStartOnboarding={handleStartOnboarding} />
              </div>
            </>
          )}

          {currentView === "intake" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-4xl title-font mb-4 font-sangbleu">Welcome to Critter!</h1>
                <p className="text-gray-700 max-w-3xl mx-auto body-font">
                  Let's get you set up with your Critter professional through our intake process and book your first
                  appointment.
                </p>
              </div>
              <div className="flex-1 flex flex-col mb-12">
                <NewCustomerIntake
                  onCancel={handleBackToLanding}
                  onComplete={handleBackToLanding}
                  webhookUrl={WEBHOOK_URL}
                  userInfo={userInfo}
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

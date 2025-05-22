"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import NewCustomerOnboarding from "../../components/new-customer-onboarding"
import Header from "../../components/header"

export default function NewCustomerPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook-test/216e36c3-4fe2-4f2e-80c3-d9ce6524f445"

  // Handler to go back to landing page
  const handleBackToLanding = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto px-4 flex flex-col page-content">
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
        </div>
      </main>
    </div>
  )
}

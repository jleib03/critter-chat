"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import NewCustomerIntake from "../components/new-customer-intake"

export default function NewCustomerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setSessionId(searchParams.get("sessionId"))
    setUserId(searchParams.get("userId"))
  }, [searchParams])

  const handleBackToLanding = () => {
    router.push("/")
  }

  const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || ""

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">New Customer Intake</h1>
      <p className="text-lg mb-8">
        Complete the intake form below to set up your account with your Critter professional.
      </p>
      {sessionId && userId ? (
        <NewCustomerIntake
          onCancel={handleBackToLanding}
          onComplete={handleBackToLanding}
          webhookUrl={WEBHOOK_URL}
          initialSessionId={sessionId}
          initialUserId={userId}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

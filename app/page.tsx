"use client"

import { useEffect, useState } from "react"
import NewCustomerIntake from "@/components/NewCustomerIntake"

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || ""

export default function Home() {
  const [currentView, setCurrentView] = useState<"landing" | "intake">("landing")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; email: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const session = params.get("session_id")
    const user = params.get("user_id")
    const firstName = params.get("firstName")
    const lastName = params.get("lastName")
    const email = params.get("email")

    if (session) {
      setSessionId(session)
      setCurrentView("intake")
    }
    if (user) {
      setUserId(user)
      setCurrentView("intake")
    }

    if (firstName && lastName && email) {
      setUserInfo({ firstName, lastName, email })
      setCurrentView("intake")
    }
  }, [])

  const handleStartIntake = () => {
    setCurrentView("intake")
  }

  const handleBackToLanding = () => {
    setCurrentView("landing")
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-24 px-8">
      {currentView === "landing" && (
        <div className="text-center">
          <h1 className="text-5xl title-font mb-4 font-sangbleu">Welcome to Critter!</h1>
          <p className="text-gray-700 max-w-3xl mx-auto body-font mb-8">
            Critter is your all-in-one solution for managing your pet's health and wellness. Get started today!
          </p>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleStartIntake}
          >
            Start New Customer Intake
          </button>
        </div>
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
  )
}

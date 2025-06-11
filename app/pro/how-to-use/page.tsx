"use client"

import { useState } from "react"
import PasswordProtection from "../../../components/password-protection"
import Header from "../../../components/header"
import ProfessionalJourney from "../../../components/professional-journey"

export default function HowToUsePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // If not authenticated, show password protection
  if (!isAuthenticated) {
    return (
      <PasswordProtection
        onAuthenticated={() => setIsAuthenticated(true)}
        title="Professional Help Hub Access"
        description="Access professional resources and documentation."
      />
    )
  }

  // Original page content when authenticated
  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto px-4 flex flex-col page-content">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl title-font mb-4 font-sangbleu">
              Explore the complete professional journey in the Critter ecosystem
            </h1>
            <p className="text-lg text-gray-600 body-font">Click on each step to explore the details</p>
          </div>

          {/* Journey Content - Only showing Professional Journey */}
          <div className="flex-1">
            <ProfessionalJourney />
          </div>
        </div>
      </main>
    </div>
  )
}

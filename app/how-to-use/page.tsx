"use client"
import { useState } from "react"
import Header from "../../components/header"
import ProfessionalJourney from "../../components/professional-journey"
import CustomerJourney from "../../components/customer-journey"
import { Users, UserCheck } from "lucide-react"

export default function HowToUsePage() {
  const [activeView, setActiveView] = useState<"professional" | "customer">("professional")

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto px-4 flex flex-col page-content">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl title-font mb-4 font-sangbleu">
              Explore the complete journey for both professionals and customers in the Critter ecosystem
            </h1>
          </div>

          {/* Toggle Buttons */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-md">
              <button
                onClick={() => setActiveView("professional")}
                className={`flex items-center px-6 py-3 rounded-lg transition-colors body-font ${
                  activeView === "professional" ? "bg-[#E75837] text-white" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Users className="h-5 w-5 mr-2" />
                Professional Journey
              </button>
              <button
                onClick={() => setActiveView("customer")}
                className={`flex items-center px-6 py-3 rounded-lg transition-colors body-font ${
                  activeView === "customer" ? "bg-[#E75837] text-white" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <UserCheck className="h-5 w-5 mr-2" />
                Customer Journey
              </button>
            </div>
          </div>

          {/* Journey Content */}
          <div className="flex-1">{activeView === "professional" ? <ProfessionalJourney /> : <CustomerJourney />}</div>
        </div>
      </main>
    </div>
  )
}

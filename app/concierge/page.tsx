"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "../../components/header"
import { ServiceRequestIntake } from "../../components/concierge/service-request-intake"
import { ProfessionalMatching } from "../../components/concierge/professional-matching"
import { RequestConfirmation } from "../../components/concierge/request-confirmation"
import type { ServiceRequest, MatchedProfessional } from "../../types/concierge"

type ConciergeStep = "intake" | "matching" | "confirmation"

export default function ConciergePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<ConciergeStep>("intake")
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null)
  const [matchedProfessionals, setMatchedProfessionals] = useState<MatchedProfessional[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState<MatchedProfessional | null>(null)

  const handleIntakeComplete = (request: ServiceRequest) => {
    setServiceRequest(request)
    setCurrentStep("matching")
    // In real implementation, this would trigger the matching algorithm
    simulateMatching(request)
  }

  const simulateMatching = async (request: ServiceRequest) => {
    // Simulate API call to matching service
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock matched professionals based on request
    const mockMatches: MatchedProfessional[] = [
      {
        id: "prof_001",
        name: "Sarah's Pet Care Collective",
        type: "multi_service_team",
        rating: 4.9,
        totalReviews: 234,
        matchScore: 95,
        specialties: ["Small Dogs", "Senior Pet Care", "Medication Administration"],
        services: request.services,
        location: {
          distance: 0.8,
          area: "Lincoln Park, Chicago",
        },
        availability: {
          canAccommodate: true,
          nextAvailable: "Today, 2:00 PM",
          flexibility: "high",
        },
        team: [
          { name: "Sarah Johnson", role: "Lead Groomer", specialties: ["Grooming", "Nail Care"] },
          { name: "Mike Chen", role: "Pet Sitter", specialties: ["Overnight Care", "Dog Walking"] },
          { name: "Lisa Rodriguez", role: "Transport Specialist", specialties: ["Vet Visits", "Pet Taxi"] },
        ],
        pricing: {
          estimatedCost: "$85-120",
          structure: "service_based",
        },
        responseTime: "< 15 minutes",
        claimStatus: "available",
      },
      {
        id: "prof_002",
        name: "Urban Paws Professional Services",
        type: "individual_specialist",
        rating: 4.8,
        totalReviews: 156,
        matchScore: 88,
        specialties: ["Large Dogs", "Behavioral Support", "Exercise Programs"],
        services: request.services.filter((s) => s !== "grooming"), // Doesn't offer grooming
        location: {
          distance: 1.2,
          area: "Old Town, Chicago",
        },
        availability: {
          canAccommodate: true,
          nextAvailable: "Tomorrow, 9:00 AM",
          flexibility: "medium",
        },
        team: [{ name: "David Park", role: "Certified Pet Professional", specialties: ["All Services"] }],
        pricing: {
          estimatedCost: "$65-95",
          structure: "hourly_plus_services",
        },
        responseTime: "< 30 minutes",
        claimStatus: "available",
      },
      {
        id: "prof_003",
        name: "Lakefront Pet Concierge",
        type: "premium_concierge",
        rating: 5.0,
        totalReviews: 89,
        matchScore: 92,
        specialties: ["Luxury Pet Care", "Full Service Concierge", "Emergency Available"],
        services: [...request.services, "emergency_care", "luxury_transport"],
        location: {
          distance: 2.1,
          area: "Gold Coast, Chicago",
        },
        availability: {
          canAccommodate: true,
          nextAvailable: "Within 1 hour",
          flexibility: "very_high",
        },
        team: [
          { name: "Amanda Foster", role: "Pet Concierge Director", specialties: ["Concierge Services"] },
          { name: "Team of 6", role: "Specialized Staff", specialties: ["All Services"] },
        ],
        pricing: {
          estimatedCost: "$150-250",
          structure: "concierge_package",
        },
        responseTime: "< 5 minutes",
        claimStatus: "available",
      },
    ]

    setMatchedProfessionals(mockMatches)
  }

  const handleProfessionalSelect = (professional: MatchedProfessional) => {
    setSelectedProfessional(professional)
    setCurrentStep("confirmation")
  }

  const handleBackToMatching = () => {
    setCurrentStep("matching")
    setSelectedProfessional(null)
  }

  const handleBackToIntake = () => {
    setCurrentStep("intake")
    setServiceRequest(null)
    setMatchedProfessionals([])
    setSelectedProfessional(null)
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto px-4 flex flex-col page-content">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl title-font mb-4 font-sangbleu">Critter Concierge</h1>
            <p className="text-gray-700 max-w-3xl mx-auto body-font text-lg">
              Tell us what your pet needs, and we'll connect you with the perfect professional or team of professionals
              in your area.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center ${currentStep === "intake" ? "text-[#E75837]" : currentStep === "matching" || currentStep === "confirmation" ? "text-green-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "intake" ? "bg-[#E75837] text-white" : currentStep === "matching" || currentStep === "confirmation" ? "bg-green-600 text-white" : "bg-gray-200"}`}
                >
                  1
                </div>
                <span className="ml-2 font-medium body-font">Tell Us Your Needs</span>
              </div>

              <div
                className={`w-8 h-0.5 ${currentStep === "matching" || currentStep === "confirmation" ? "bg-green-600" : "bg-gray-200"}`}
              ></div>

              <div
                className={`flex items-center ${currentStep === "matching" ? "text-[#E75837]" : currentStep === "confirmation" ? "text-green-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "matching" ? "bg-[#E75837] text-white" : currentStep === "confirmation" ? "bg-green-600 text-white" : "bg-gray-200"}`}
                >
                  2
                </div>
                <span className="ml-2 font-medium body-font">Review Matches</span>
              </div>

              <div className={`w-8 h-0.5 ${currentStep === "confirmation" ? "bg-green-600" : "bg-gray-200"}`}></div>

              <div
                className={`flex items-center ${currentStep === "confirmation" ? "text-[#E75837]" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "confirmation" ? "bg-[#E75837] text-white" : "bg-gray-200"}`}
                >
                  3
                </div>
                <span className="ml-2 font-medium body-font">Confirm Request</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 flex flex-col mb-12">
            {currentStep === "intake" && <ServiceRequestIntake onComplete={handleIntakeComplete} />}

            {currentStep === "matching" && serviceRequest && (
              <ProfessionalMatching
                serviceRequest={serviceRequest}
                matchedProfessionals={matchedProfessionals}
                onProfessionalSelect={handleProfessionalSelect}
                onBack={handleBackToIntake}
              />
            )}

            {currentStep === "confirmation" && serviceRequest && selectedProfessional && (
              <RequestConfirmation
                serviceRequest={serviceRequest}
                selectedProfessional={selectedProfessional}
                onBack={handleBackToMatching}
                onConfirm={() => {
                  // Handle final confirmation
                  console.log("Service request confirmed!")
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

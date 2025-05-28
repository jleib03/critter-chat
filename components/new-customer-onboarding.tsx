"use client"

import { useState, useRef } from "react"
import OnboardingForm from "./onboarding-form"
import ServiceSelection from "./service-selection"
import Confirmation from "./confirmation"

type NewCustomerOnboardingProps = {
  onCancel: () => void
  onComplete: () => void
  webhookUrl: string
  initialSessionId?: string
  initialUserId?: string
  initialProfessionalId?: string
  skipProfessionalStep?: boolean
}

export default function NewCustomerOnboarding({
  onCancel,
  onComplete,
  webhookUrl,
  initialSessionId,
  initialUserId,
  initialProfessionalId,
  skipProfessionalStep = false,
}: NewCustomerOnboardingProps) {
  const [currentStep, setCurrentStep] = useState<"form" | "services" | "confirmation">("form")
  const [formData, setFormData] = useState<any>(null)
  const [servicesData, setServicesData] = useState<any>(null)
  const [serviceSelectionData, setServiceSelectionData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const USER_ID = useRef(initialUserId || "user_id_" + Math.random().toString(36).substring(2, 15))

  const handleFormSubmit = async (data: any) => {
    setFormData(data)
    setIsLoading(true)

    const payload = {
      message: {
        text: "New customer onboarding - retrieve services",
        userId: USER_ID.current,
        timestamp: new Date().toISOString(),
        userInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          selectedAction: "new_customer_onboarding",
        },
        formData: data,
        professionalID: initialProfessionalId,
        type: "new_customer_get_services",
        source: "critter_booking_site",
      },
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const responseData = await response.json()

        // Parse services from the response
        if (responseData.services) {
          setServicesData(responseData.services)
        } else {
          // Mock services for demo if none returned
          setServicesData([
            {
              id: "1",
              name: "Dog Walking",
              description: "30-minute neighborhood walk",
              duration: "30 minutes",
              price: "$25",
              category: "Main Service",
            },
            {
              id: "2",
              name: "Pet Sitting",
              description: "In-home pet care while you're away",
              duration: "Per day",
              price: "$50",
              category: "Main Service",
            },
            {
              id: "3",
              name: "Feeding",
              description: "Additional feeding service",
              duration: "15 minutes",
              price: "$10",
              category: "Add-On",
            },
          ])
        }

        setCurrentStep("services")
      } else {
        console.error("Webhook request failed:", response.status)
      }
    } catch (error) {
      console.error("Error sending webhook request:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleServiceSelection = (data: any) => {
    setServiceSelectionData(data)
    setCurrentStep("confirmation")
  }

  const handleConfirmationSubmit = async (data: any) => {
    const payload = {
      message: {
        text: "New customer final booking submission",
        userId: USER_ID.current,
        timestamp: new Date().toISOString(),
        userInfo: formData
          ? {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              selectedAction: "new_customer_onboarding",
            }
          : {
              selectedAction: "new_customer_onboarding",
            },
        formData: formData,
        serviceData: serviceSelectionData,
        professionalID: initialProfessionalId,
        type: "new_customer_final_submission",
        source: "critter_booking_site",
      },
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onComplete()
      } else {
        console.error("Webhook request failed:", response.status)
      }
    } catch (error) {
      console.error("Error sending webhook request:", error)
    }
  }

  const handleBackToServices = () => {
    setCurrentStep("services")
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E75837] mx-auto mb-4"></div>
          <h3 className="text-lg font-medium header-font">Loading Services...</h3>
          <p className="text-gray-600 body-font">We're retrieving available services from your professional.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {currentStep === "form" && (
        <OnboardingForm
          onSubmit={handleFormSubmit}
          onCancel={onCancel}
          skipProfessionalStep={skipProfessionalStep}
          professionalId={initialProfessionalId}
        />
      )}
      {currentStep === "services" && servicesData && (
        <ServiceSelection
          services={servicesData}
          onSubmit={handleServiceSelection}
          onBack={() => setCurrentStep("form")}
        />
      )}
      {currentStep === "confirmation" && (
        <Confirmation
          onSubmit={handleConfirmationSubmit}
          onCancel={onCancel}
          onBack={handleBackToServices}
          formData={formData}
          serviceData={serviceSelectionData}
        />
      )}
    </div>
  )
}

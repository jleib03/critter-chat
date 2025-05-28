"use client"

import { useState, useRef } from "react"
import OnboardingForm from "./onboarding-form"
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
  const [currentStep, setCurrentStep] = useState<"form" | "confirmation">("form")
  const [formData, setFormData] = useState<any>(null)
  const USER_ID = useRef(initialUserId || "user_id_" + Math.random().toString(36).substring(2, 15))

  const handleFormSubmit = async (data: any) => {
    setFormData(data)
    setCurrentStep("confirmation")

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

      if (!response.ok) {
        console.error("Webhook request failed:", response.status)
      }
    } catch (error) {
      console.error("Error sending webhook request:", error)
    }
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
        serviceData: data,
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

      if (!response.ok) {
        console.error("Webhook request failed:", response.status)
      } else {
        onComplete()
      }
    } catch (error) {
      console.error("Error sending webhook request:", error)
    }
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
      {currentStep === "confirmation" && (
        <Confirmation onSubmit={handleConfirmationSubmit} onCancel={onCancel} formData={formData} />
      )}
    </div>
  )
}

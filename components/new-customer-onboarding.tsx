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

// Robust function to determine if a service is an add-on
const isAddOnService = (category: string, serviceName: string, description = ""): boolean => {
  // Normalize text for comparison (lowercase, remove special characters)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
  }

  const normalizedCategory = normalizeText(category)
  const normalizedName = normalizeText(serviceName)
  const normalizedDescription = normalizeText(description)

  // Add-on category patterns (case-insensitive, with various separators)
  const addOnCategoryPatterns = ["addon", "add on", "add-on", "add_on", "addons", "add ons", "add-ons", "add_ons"]

  // Check if category explicitly mentions add-on
  for (const pattern of addOnCategoryPatterns) {
    if (normalizedCategory.includes(pattern)) {
      return true
    }
  }

  // Add-on keywords that might appear in service names or descriptions
  const addOnKeywords = [
    "additional",
    "extra",
    "addon",
    "add on",
    "add-on",
    "supplemental",
    "supplement",
    "optional",
    "upgrade",
    "enhancement",
    "extension",
    "plus",
    "bonus",
    "complimentary",
    "ancillary",
    "auxiliary",
  ]

  // Check service name for add-on keywords
  for (const keyword of addOnKeywords) {
    if (normalizedName.includes(keyword)) {
      return true
    }
  }

  // Check description for add-on keywords
  for (const keyword of addOnKeywords) {
    if (normalizedDescription.includes(keyword)) {
      return true
    }
  }

  // Special patterns that often indicate add-ons
  const addOnNamePatterns = [
    /multiple\s+\w+/, // "multiple dogs", "multiple cats", etc.
    /\w+\s*:\s*add/, // "Transportation: Add", "Feeding: Add", etc.
    /per\s+additional/, // "per additional pet", etc.
    /each\s+extra/, // "each extra hour", etc.
  ]

  for (const pattern of addOnNamePatterns) {
    if (pattern.test(normalizedName) || pattern.test(normalizedDescription)) {
      return true
    }
  }

  return false
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
        console.log("Webhook response:", responseData)

        // Parse services from the response message
        if (responseData.message) {
          try {
            const parsedMessage = JSON.parse(responseData.message)

            if (parsedMessage.type === "service_list" && parsedMessage.items) {
              // Convert the webhook format to our component format
              const services = parsedMessage.items.map((item: any, index: number) => {
                // Extract duration and price from details array
                let duration = "Not specified"
                let price = "Contact for pricing"
                let description = "No description provided"

                if (item.details && Array.isArray(item.details)) {
                  item.details.forEach((detail: string) => {
                    if (detail.startsWith("Duration:")) {
                      duration = detail.replace("Duration:", "").trim()
                    } else if (detail.startsWith("Price:")) {
                      price = detail.replace("Price:", "").trim()
                    } else if (!detail.includes("No description provided")) {
                      description = detail
                    }
                  })
                }

                // Use robust category detection
                const originalCategory = item.category || ""
                const detectedCategory = isAddOnService(originalCategory, item.name, description)
                  ? "Add-On"
                  : "Main Service"

                console.log(
                  `Service: "${item.name}" | Original Category: "${originalCategory}" | Detected: "${detectedCategory}"`,
                )

                return {
                  id: (index + 1).toString(),
                  name: item.name,
                  description: description,
                  duration: duration,
                  price: price,
                  category: detectedCategory,
                  selected: false,
                }
              })

              setServicesData(services)
              console.log("Parsed services:", services)
            } else {
              console.log("No service_list found in response, using mock data")
              // Fallback to mock data
              setServicesData([
                {
                  id: "1",
                  name: "Dog Walking",
                  description: "30-minute neighborhood walk",
                  duration: "30 minutes",
                  price: "$25",
                  category: "Main Service",
                  selected: false,
                },
                {
                  id: "2",
                  name: "Pet Sitting",
                  description: "In-home pet care while you're away",
                  duration: "Per day",
                  price: "$50",
                  category: "Main Service",
                  selected: false,
                },
                {
                  id: "3",
                  name: "Additional Feeding",
                  description: "Extra feeding service",
                  duration: "15 minutes",
                  price: "$10",
                  category: "Add-On",
                  selected: false,
                },
              ])
            }
          } catch (parseError) {
            console.error("Error parsing webhook message:", parseError)
            console.log("Raw message:", responseData.message)
            // Use mock data as fallback
            setServicesData([
              {
                id: "1",
                name: "Service information unavailable",
                description: "Please contact your professional directly",
                duration: "Varies",
                price: "Contact for pricing",
                category: "Main Service",
                selected: false,
              },
            ])
          }
        } else {
          console.log("No message in response, using mock data")
          // Fallback to mock data if no message
          setServicesData([
            {
              id: "1",
              name: "Dog Walking",
              description: "30-minute neighborhood walk",
              duration: "30 minutes",
              price: "$25",
              category: "Main Service",
              selected: false,
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

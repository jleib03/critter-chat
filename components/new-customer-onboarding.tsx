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

// More conservative function to determine if a service is an add-on
const isAddOnService = (category: string, serviceName: string): boolean => {
  // Normalize text for comparison (lowercase, remove special characters)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
  }

  const normalizedCategory = normalizeText(category)
  const normalizedName = normalizeText(serviceName)

  // First, check if the original category explicitly indicates add-on
  const addOnCategoryPatterns = ["addon", "add on", "add-on", "add_on", "addons", "add ons", "add-ons", "add_ons"]

  // If category explicitly mentions add-on, trust it
  for (const pattern of addOnCategoryPatterns) {
    if (normalizedCategory.includes(pattern)) {
      return true
    }
  }

  // Only check service name for very specific add-on indicators
  // Be more conservative - only look for explicit add-on mentions in the name
  const explicitAddOnInName = [
    "add on",
    "add-on",
    "addon",
    ": add", // matches "Transportation: Add On"
    "add :", // matches "Add: Transportation"
  ]

  for (const pattern of explicitAddOnInName) {
    if (normalizedName.includes(pattern)) {
      return true
    }
  }

  // Check for very specific patterns that are almost always add-ons
  const specificAddOnPatterns = [
    /^multiple\s+\w+.*add/i, // "Multiple Dogs: Add on"
    /^additional\s+\w+/i, // "Additional Feeding" (but not "No additional description")
    /^extra\s+\w+/i, // "Extra Walk Time"
  ]

  for (const pattern of specificAddOnPatterns) {
    if (pattern.test(serviceName)) {
      return true
    }
  }

  // Default to main service if no clear add-on indicators
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
  const [currentStep, setCurrentStep] = useState<"form" | "services" | "confirmation" | "success">("form")
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
                    } else if (
                      !detail.includes("No description provided") &&
                      !detail.includes("No additional description")
                    ) {
                      description = detail
                    }
                  })
                }

                // Use conservative category detection
                const originalCategory = item.category || ""
                const detectedCategory = isAddOnService(originalCategory, item.name) ? "Add-On" : "Main Service"

                console.log(
                  `Service: "${item.name}" | Original Category: "${originalCategory}" | Detected: "${detectedCategory}"`,
                )

                return {
                  id: (index + 1).toString(),
                  name: item.name,
                  description: description === "No description provided" ? "No additional description" : description,
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
        setCurrentStep("success")
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
      {currentStep === "success" && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#E75837] mb-4 header-font">Request Submitted Successfully!</h2>
            <p className="text-lg text-gray-700 mb-6 body-font">
              Your onboarding and booking request has been sent to your Critter professional.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 body-font">
                📧 <strong className="header-font">Check your email!</strong> You should receive a confirmation email
                shortly with next steps and your professional's contact information.
              </p>
            </div>
            <div className="space-y-3 text-gray-600 body-font mb-8">
              <p>What happens next:</p>
              <ul className="text-left max-w-md mx-auto space-y-2">
                <li className="flex items-start">
                  <span className="text-[#E75837] mr-2">1.</span>
                  Your professional will review your request
                </li>
                <li className="flex items-start">
                  <span className="text-[#E75837] mr-2">2.</span>
                  They'll contact you to confirm details and schedule
                </li>
                <li className="flex items-start">
                  <span className="text-[#E75837] mr-2">3.</span>
                  You'll receive booking confirmation once approved
                </li>
              </ul>
            </div>
            <button
              onClick={onComplete}
              className="bg-[#E75837] text-white px-8 py-3 rounded-lg hover:bg-[#d04e30] transition-colors body-font font-medium"
            >
              Return to Home
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getWebhookEndpoint, logWebhookUsage } from "../types/webhook-endpoints"
import OnboardingForm from "./onboarding-form"
import ServiceSelection from "./service-selection"
import RequestScheduling from "./request-scheduling"
import Confirmation from "./confirmation"
import UserInfoForm from "./user-info-form"
import { type Service } from "@/types/booking"
import { type Professional } from "@/types/professional-config"
import type { OnboardingFormData } from "../types/booking"

type UserInfo = {
  email: string
  firstName: string
  lastName: string
}

type UserData = {
  name: string
  email: string
  phone: string
  address: string
  notes: string
  pets: { name: string; breed: string; age: string }[]
}

type SchedulingData = {
  bookingType: "one-time" | "recurring"
  date: Date | undefined
  time: string
  recurringEndDate?: string
  recurringDays?: string[]
}

type NewCustomerIntakeProps = {
  onCancel: () => void
  onComplete: () => void
  userInfo: UserInfo
  initialSessionId?: string
  initialUserId?: string
  initialProfessionalId?: string
  initialProfessionalName?: string
  skipProfessionalStep?: boolean
  professional: Professional
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

export default function NewCustomerIntake({
  onCancel,
  onComplete,
  userInfo: initialUserInfo,
  initialSessionId,
  initialUserId,
  initialProfessionalId,
  initialProfessionalName,
  skipProfessionalStep,
  professional,
}: NewCustomerIntakeProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [schedulingInfo, setSchedulingInfo] = useState<SchedulingData | null>(null)
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>(null)
  const [servicesData, setServicesData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const USER_ID = useRef(initialProfessionalId || "user_id_" + Math.random().toString(36).substring(2, 15))
  const [resolvedProfessionalName, setResolvedProfessionalName] = useState<string | null>(
    initialProfessionalName || null,
  )

  useEffect(() => {
    const url = searchParams.get('webhookUrl')
    if (url) {
      setWebhookUrl(decodeURIComponent(url))
    }
  }, [searchParams])

  useEffect(() => {
    const fetchProfessionalName = async () => {
      if (initialProfessionalId && !initialProfessionalName) {
        setIsLoading(true)
        setError(null)
        try {
          console.log("Fetching professional name for ID:", initialProfessionalId)
          const webhookUrl = getWebhookEndpoint("NEW_CUSTOMER_ONBOARDING")
          logWebhookUsage("NEW_CUSTOMER_ONBOARDING", "fetch_professional_name")

          const response = await fetch(`${webhookUrl}?professionalId=${initialProfessionalId}`)
          console.log("Response status:", response.status)

          if (!response.ok) {
            throw new Error(`Failed to fetch professional: ${response.status}`)
          }

          const data = await response.json()
          console.log("Response data:", JSON.stringify(data))

          // Handle different response formats
          let name = null
          if (Array.isArray(data) && data.length > 0 && data[0].name) {
            // If response is an array with objects containing name
            name = data[0].name
            console.log("Found name in array format:", name)
          } else if (data.name) {
            // If response is an object with name property
            name = data.name
            console.log("Found name in object format:", name)
          } else if (typeof data === "string") {
            // If response is a string
            name = data
            console.log("Found name as string:", name)
          } else {
            console.error("Unexpected response format:", data)
            throw new Error("Professional not found")
          }

          setResolvedProfessionalName(name)
        } catch (err) {
          console.error("Error fetching professional:", err)
          setError(err instanceof Error ? err.message : "Failed to fetch professional")
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchProfessionalName()
  }, [initialProfessionalId, initialProfessionalName])

  const handleServiceSubmit = (services: Service[]) => {
    setSelectedServices(services)
    setStep(2)
  }

  const handleScheduleSubmit = (data: SchedulingData) => {
    setSchedulingInfo(data)
    setStep(3)
  }

  const handleUserInfoSubmit = (data: UserData) => {
    setUserData(data)
    setStep(4)
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleEdit = (targetStep: number) => {
    setStep(targetStep)
  }

  const handleFormSubmit = async (data: any) => {
    // Merge the user info from landing page with additional form data
    const combinedData = {
      ...data,
    }

    setFormData(combinedData)
    setIsLoading(true)
    logWebhookUsage("NEW_CUSTOMER_ONBOARDING", "retrieve_services")

    const payload = {
      message: {
        text: "New customer intake - retrieve services",
        userId: USER_ID.current,
        timestamp: new Date().toISOString(),
        userInfo: {
          firstName: combinedData.firstName,
          lastName: combinedData.lastName,
          email: combinedData.email,
          selectedAction: "new_customer_intake",
        },
        formData: combinedData,
        professionalID: initialProfessionalId, // Use the actual professional_id from the lookup
        type: "new_customer_get_services",
        source: "critter_booking_site",
      },
    }

    try {
      const response = await fetch(getWebhookEndpoint("NEW_CUSTOMER_ONBOARDING"), {
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
                const originalCategory = item.category || "Other Services"
                const detectedCategory = isAddOnService(originalCategory, item.name) ? "Add-On" : originalCategory

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

        setStep(2)
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
    setSelectedServices(data)
    setStep(3)
  }

  const handleSchedulingSubmit = (data: any) => {
    setSchedulingInfo(data)
    setStep(4)
  }

  const handleConfirmationSubmit = async (data: any) => {
    logWebhookUsage("NEW_CUSTOMER_ONBOARDING", "final_intake_submission")

    const payload = {
      message: {
        text: "New customer final intake submission",
        userId: USER_ID.current,
        timestamp: new Date().toISOString(),
        userInfo: formData
          ? {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              selectedAction: "new_customer_intake",
            }
          : {
              selectedAction: "new_customer_intake",
            },
        formData: formData,
        serviceData: selectedServices,
        schedulingData: schedulingInfo,
        professionalID: initialProfessionalId, // Use the actual professional_id from the lookup
        type: "new_customer_final_intake_submission",
        source: "critter_booking_site",
      },
    }

    try {
      const response = await fetch(getWebhookEndpoint("NEW_CUSTOMER_ONBOARDING"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setStep(5)
      } else {
        console.error("Webhook request failed:", response.status)
      }
    } catch (error) {
      console.error("Error sending webhook request:", error)
    }
  }

  const handleSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // If we have an initialProfessionalName, use it
      const dataToSubmit = initialProfessionalName ? { ...data, professionalName: initialProfessionalName } : data

      logWebhookUsage("NEW_CUSTOMER_ONBOARDING", "onboarding_submission")

      const response = await fetch(getWebhookEndpoint("NEW_CUSTOMER_ONBOARDING"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "new_customer_onboarding",
          professionalId: initialProfessionalId, // Use the actual professional_id from the lookup
          formData: dataToSubmit,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      setIsComplete(true)
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("There was an error submitting your information. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/")
  }

  // Extract user info from query params if available
  const queryUserInfo = searchParams.get("userInfo")
    ? JSON.parse(decodeURIComponent(searchParams.get("userInfo") as string))
    : null

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ServiceSelection
            services={professional.services}
            onSubmit={handleServiceSubmit}
            onBack={() => {}} 
            showBackButton={false}
            professionalId={professional.id}
          />
        )
      case 2:
        return <RequestScheduling onSubmit={handleScheduleSubmit} onBack={handleBack} />
      case 3:
        return <UserInfoForm onSubmit={handleUserInfoSubmit} onBack={handleBack} />
      case 4:
        if (userData && selectedServices.length > 0 && schedulingInfo) {
          return (
            <Confirmation
              customerInfo={userData}
              petInfo={userData.pets}
              services={selectedServices}
              schedulingInfo={schedulingInfo}
              professionalId={professional.id}
              onEdit={handleEdit}
              webhookUrl={webhookUrl || process.env.NEXT_PUBLIC_NEW_CUSTOMER_WEBHOOK_URL || ''}
            />
          )
        }
        return <div>Loading...</div>
      case 5:
        return (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-[#E75837] mb-4 header-font">Request Submitted Successfully!</h2>
              <p className="text-lg text-gray-700 mb-6 body-font">
                Your intake and booking request has been sent to your Critter professional.
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
                onClick={handleCancel}
                className="bg-[#E75837] text-white px-8 py-3 rounded-lg hover:bg-[#d04e30] transition-colors body-font font-medium"
              >
                Return to Home
              </button>
            </div>
          </div>
        )
      default:
        return <div>Error</div>
    }
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

  if (isComplete) {
    return (
      <Confirmation
        title="Onboarding Complete!"
        message="Your information has been submitted successfully. Your Critter professional will be in touch with you soon."
        buttonText="Return to Home"
        onButtonClick={handleCancel}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl text-center font-bold mb-8 header-font">New Customer Intake</h1>

      {initialProfessionalId && resolvedProfessionalName && (
        <div className="bg-[#f8f3ef] p-4 rounded-lg mb-8 text-center">
          <p className="text-xl text-gray-700">
            You're completing the intake process for{" "}
            <span className="text-[#E75837] font-medium">{resolvedProfessionalName}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}
      {renderStep()}
    </div>
  )
}

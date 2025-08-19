"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getWebhookEndpoint, logWebhookUsage } from "../types/webhook-endpoints"
import OnboardingForm from "./onboarding-form"
import Confirmation from "./confirmation"

type UserInfo = {
  email: string
  firstName: string
  lastName: string
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
  picklistData?: any[]
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
  picklistData = [],
}: NewCustomerIntakeProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<
    "form" | "services" | "scheduling" | "confirmation" | "submitting" | "success"
  >("form")
  const [formData, setFormData] = useState<any>(null)
  const [servicesData, setServicesData] = useState<any>(null)
  const [serviceSelectionData, setServiceSelectionData] = useState<any>(null)
  const [schedulingData, setSchedulingData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const USER_ID = useRef(initialProfessionalId || "user_id_" + Math.random().toString(36).substring(2, 15))
  const [resolvedProfessionalName, setResolvedProfessionalName] = useState<string | null>(
    initialProfessionalName || null,
  )

  // If we have a professional ID but no name, fetch the name
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

  const handleFormSubmit = async (data: any) => {
    // Merge the user info from landing page with additional form data
    const combinedData = {
      ...data,
    }

    setFormData(combinedData)
    setIsLoading(true)
    logWebhookUsage("NEW_CUSTOMER_ONBOARDING", "retrieve_services")

    const payload = {
      action: "new_customer_intake_services",
      userId: USER_ID.current,
      timestamp: new Date().toISOString(),
      userInfo: {
        firstName: combinedData.firstName,
        lastName: combinedData.lastName,
        email: combinedData.email,
      },
      formData: combinedData,
      professionalID: initialProfessionalId,
      source: "critter_booking_site",
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

        if (Array.isArray(responseData) && responseData.length > 0) {
          const firstItem = responseData[0]
          if (firstItem.output === "success" || firstItem.Output === "success") {
            console.log("Pet submission successful, moving to success screen")
            await handleSuccessfulSubmission(combinedData)
            return
          }
        } else if (responseData.output === "success" || responseData.Output === "success") {
          console.log("Pet submission successful, moving to success screen")
          await handleSuccessfulSubmission(combinedData)
          return
        }

        // If no success response, fall back to old behavior (though this shouldn't happen)
        console.log("No success response found, using fallback")
        setCurrentStep("success")
      } else {
        console.error("Webhook request failed:", response.status)
        setError("Failed to submit pet information. Please try again.")
      }
    } catch (error) {
      console.error("Error sending webhook request:", error)
      setError("There was an error submitting your information. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessfulSubmission = async (formData: any) => {
    try {
      setCurrentStep("submitting")
      setError(null)

      // Send email webhook
      logWebhookUsage("NEW_CUSTOMER_ONBOARDING", "send_confirmation_email")

      const emailPayload = {
        action: "new_customer_intake_completion",
        userId: USER_ID.current,
        timestamp: new Date().toISOString(),
        userInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        },
        formData: formData,
        petData: formData?.pets || [],
        professionalID: initialProfessionalId,
        source: "critter_booking_site",
      }

      const emailResponse = await fetch(getWebhookEndpoint("NEW_CUSTOMER_ONBOARDING"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      })

      if (emailResponse.ok) {
        console.log("Email webhook sent successfully")
      } else {
        console.error("Email webhook failed:", emailResponse.status)
        console.log("Email failed but proceeding to success screen since pet submission succeeded")
      }
    } catch (error) {
      console.error("Error sending email webhook:", error)
      console.log("Email webhook error but proceeding to success screen since pet submission succeeded")
    } finally {
      setCurrentStep("success")
    }
  }

  const handleCancel = () => {
    router.push("/")
  }

  // Extract user info from query params if available
  const queryUserInfo = searchParams.get("userInfo")
    ? JSON.parse(decodeURIComponent(searchParams.get("userInfo") as string))
    : null

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
      {currentStep === "form" && (
        <OnboardingForm
          onSubmit={handleFormSubmit}
          onCancel={onCancel}
          skipProfessionalStep={!!initialProfessionalId}
          professionalId={initialProfessionalId}
          professionalName={resolvedProfessionalName || initialProfessionalName}
          userInfo={initialUserInfo && initialUserInfo.firstName ? initialUserInfo : null}
          picklistData={picklistData}
        />
      )}
      {currentStep === "submitting" && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E75837] mx-auto mb-4"></div>
            <h3 className="text-lg font-medium header-font">Submitting Your Information...</h3>
            <p className="text-gray-600 body-font">
              Please wait while we process your pet information and send confirmation.
            </p>
          </div>
        </div>
      )}
      {currentStep === "success" && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#E75837] mb-4 header-font">Information Submitted Successfully!</h2>
            <p className="text-lg text-gray-700 mb-6 body-font">
              Your pet information has been sent to your Critter professional.
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
                  Your professional will review your information
                </li>
                <li className="flex items-start">
                  <span className="text-[#E75837] mr-2">2.</span>
                  They'll contact you to discuss services and scheduling
                </li>
                <li className="flex items-start">
                  <span className="text-[#E75837] mr-2">3.</span>
                  You'll work together to set up your pet care plan
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
      )}
    </div>
  )
}

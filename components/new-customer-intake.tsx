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

type PicklistItem = {
  table_name: string
  picklist_type: "type" | "breed"
  value: string
  label: string
  category: string
}

type PetPicklists = {
  types: PicklistItem[]
  breeds: { [petType: string]: PicklistItem[] }
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
}

const isAddOnService = (category: string, serviceName: string): boolean => {
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
  }

  const normalizedCategory = normalizeText(category)
  const normalizedName = normalizeText(serviceName)

  const addOnCategoryPatterns = ["addon", "add on", "add-on", "add_on", "addons", "add ons", "add-ons", "add_ons"]

  for (const pattern of addOnCategoryPatterns) {
    if (normalizedCategory.includes(pattern)) {
      return true
    }
  }

  const explicitAddOnInName = ["add on", "add-on", "addon", ": add", "add :"]

  for (const pattern of explicitAddOnInName) {
    if (normalizedName.includes(pattern)) {
      return true
    }
  }

  const specificAddOnPatterns = [/^multiple\s+\w+.*add/i, /^additional\s+\w+/i, /^extra\s+\w+/i]

  for (const pattern of specificAddOnPatterns) {
    if (pattern.test(serviceName)) {
      return true
    }
  }

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
}: NewCustomerIntakeProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<"form" | "submitting" | "success">("form")
  const [formData, setFormData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const USER_ID = useRef(initialProfessionalId || "user_id_" + Math.random().toString(36).substring(2, 15))
  const [resolvedProfessionalName, setResolvedProfessionalName] = useState<string | null>(
    initialProfessionalName || null,
  )
  const [picklistData, setPicklistData] = useState<PicklistItem[]>([])

  useEffect(() => {
    const fetchProfessionalName = async () => {
      if (initialProfessionalId && !initialProfessionalName) {
        setIsLoading(true)
        setError(null)
        try {
          console.log("Fetching professional name for ID:", initialProfessionalId)
          const webhookUrl = getWebhookEndpoint("NEW_CUSTOMER_ONBOARDING")
          logWebhookUsage("NEW_CUSTOMER_ONBOARDING", "fetch_professional_name")

          const response = await fetch(
            `${webhookUrl}?professionalId=${initialProfessionalId}&action=initialize_onboarding`,
          )
          console.log("Response status:", response.status)

          if (!response.ok) {
            throw new Error(`Failed to fetch professional: ${response.status}`)
          }

          const data = await response.json()
          console.log("Raw response:", JSON.stringify(data))

          let name = null
          let extractedPicklistData: PicklistItem[] = []

          let dataArray: any[] = []
          if (Array.isArray(data)) {
            dataArray = data
          } else if (typeof data === "object" && data !== null) {
            const keys = Object.keys(data)
            const isNumericKeys = keys.every((key) => !isNaN(Number(key)))
            if (isNumericKeys && keys.length > 0) {
              dataArray = Object.values(data)
              console.log("Converted object with numeric keys to array, length:", dataArray.length)
            } else if (data.name) {
              name = data.name
              console.log("Found name in object format:", name)
            }
          }

          if (dataArray.length > 0) {
            console.log("Data is an array, checking first element:", dataArray[0])
            if (dataArray[0].name) {
              name = dataArray[0].name
              console.log("Found name in dataArray[0].name:", name)
            }
            if (dataArray[0].id) {
              console.log("Found ID in dataArray[0].id:", dataArray[0].id)
            }

            console.log("[v0] Extracted picklistData:", dataArray.slice(1))
            extractedPicklistData = dataArray.slice(1)
          } else if (typeof data === "string") {
            name = data
            console.log("Found name as string:", name)
          } else {
            console.error("Unexpected response format:", data)
            throw new Error("Professional not found")
          }

          console.log("[v0] Setting resolved professional name:", name)
          console.log("[v0] Setting picklist data length:", extractedPicklistData.length)
          setResolvedProfessionalName(name)
          setPicklistData(extractedPicklistData)
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
    const combinedData = {
      ...data,
    }

    setFormData(combinedData)
    setCurrentStep("submitting")
    logWebhookUsage("NEW_CUSTOMER_ONBOARDING", "final_intake_submission")

    const payload = {
      message: {
        text: "New customer final intake submission",
        userId: USER_ID.current,
        timestamp: new Date().toISOString(),
        userInfo: {
          firstName: combinedData.firstName,
          lastName: combinedData.lastName,
          email: combinedData.email,
          selectedAction: "new_customer_intake",
        },
        formData: combinedData,
        petData: combinedData?.pets || [],
        professionalID: initialProfessionalId,
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
        setCurrentStep("success")
      } else {
        console.error("Webhook request failed:", response.status)
        setCurrentStep("form")
        setError("There was an error submitting your request. Please try again.")
      }
    } catch (error) {
      console.error("Error sending webhook request:", error)
      setCurrentStep("form")
      setError("There was an error submitting your request. Please try again.")
    }
  }

  const handleCancel = () => {
    router.push("/")
  }

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
            <h3 className="text-lg font-medium header-font">Submitting Your Request...</h3>
            <p className="text-gray-600 body-font">Please wait while we process your intake and booking request.</p>
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
      )}
    </div>
  )
}

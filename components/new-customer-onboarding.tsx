"use client"
import { useState, useEffect, useRef } from "react"
import { Check, AlertCircle } from "lucide-react"
import OnboardingForm from "./onboarding-form"
import ServiceSelection from "./service-selection"
import type { OnboardingFormData, ServiceSelectionData } from "../types/booking"

type NewCustomerOnboardingProps = {
  onCancel: () => void
  onComplete: () => void
  webhookUrl: string
  initialSessionId?: string
  initialUserId?: string
}

// Define a type for the service data structure
type ServiceData = {
  id: string
  name: string
  description: string
  duration: string
  price: string
  category: string
  selected: boolean
}

export default function NewCustomerOnboarding({
  onCancel,
  onComplete,
  webhookUrl,
  initialSessionId,
  initialUserId,
}: NewCustomerOnboardingProps) {
  const [currentStep, setCurrentStep] = useState<"form" | "services" | "confirmation">("form")
  const [formData, setFormData] = useState<OnboardingFormData | null>(null)
  const [serviceData, setServiceData] = useState<ServiceSelectionData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [services, setServices] = useState<ServiceData[]>([])
  const [loadingServices, setLoadingServices] = useState(false)

  // Generate a consistent userId for this component instance
  const USER_ID = useRef(initialUserId || `web_user_${Math.random().toString(36).substring(2, 10)}`)

  // Log the webhook URL and session ID when the component mounts
  useEffect(() => {
    console.log("NewCustomerOnboarding received webhookUrl:", webhookUrl)
    console.log("Initial session ID:", sessionId)
    console.log("Generated userId:", USER_ID.current)
  }, [webhookUrl, sessionId])

  // Update the parseServicesFromResponse function to handle HTML content
  const parseServicesFromResponse = (responseData: any): ServiceData[] => {
    try {
      console.log("Parsing response data:", responseData)

      // First try to parse as JSON if the message property exists and is a string
      if (responseData.message && typeof responseData.message === "string") {
        try {
          const messageData = JSON.parse(responseData.message)
          if (messageData.type === "service_list" && Array.isArray(messageData.items)) {
            console.log("Found service list in JSON response:", messageData.items.length, "services")
            return messageData.items.map((item: any, index: number) => {
              // Extract details as before
              let duration = "Not specified"
              let price = "Not specified"
              let description = "No description provided"

              if (Array.isArray(item.details)) {
                for (const detail of item.details) {
                  if (typeof detail === "string") {
                    if (detail.startsWith("Duration:")) {
                      duration = detail.replace("Duration:", "").trim()
                    } else if (detail.startsWith("Price:")) {
                      price = detail.replace("Price:", "").trim()
                    } else if (!detail.startsWith("Duration:") && !detail.startsWith("Price:")) {
                      description = detail
                    }
                  }
                }
              }

              return {
                id: `service-${index}`,
                name: item.name || `Service ${index + 1}`,
                description: description,
                duration: duration,
                price: price,
                category: item.category || "Main Service",
                selected: false,
              }
            })
          }
        } catch (jsonError) {
          console.log("Response is not valid JSON, trying HTML parsing")
        }
      }

      // If we have HTML content in htmlMessage, parse that
      if (responseData.htmlMessage && typeof responseData.htmlMessage === "string") {
        console.log("Found HTML message, attempting to parse services")
        const services: ServiceData[] = []

        // Create a DOM parser to parse the HTML
        const parser = new DOMParser()
        const doc = parser.parseFromString(responseData.htmlMessage, "text/html")

        // Find all service categories
        const serviceCategories = doc.querySelectorAll(".service-category")

        serviceCategories.forEach((category, categoryIndex) => {
          // Get the category title
          const categoryTitle = category.querySelector(".category-title")?.textContent?.trim() || "Main Service"

          // Find all service items in this category
          const serviceItems = category.querySelectorAll(".service-item")

          serviceItems.forEach((item, itemIndex) => {
            // Get the service name
            const serviceName =
              item.querySelector(".service-header strong")?.textContent?.trim() || `Service ${itemIndex + 1}`

            // Get service details
            let duration = "Not specified"
            let price = "Not specified"
            let description = "No description provided"

            const detailItems = item.querySelectorAll(".service-details li")
            detailItems.forEach((detail) => {
              const detailText = detail.textContent?.trim() || ""
              if (detailText.startsWith("Duration:")) {
                duration = detailText.replace("Duration:", "").trim()
              } else if (detailText.startsWith("Price:")) {
                price = detailText.replace("Price:", "").trim()
              } else if (!detailText.startsWith("Duration:") && !detailText.startsWith("Price:")) {
                description = detailText
              }
            })

            services.push({
              id: `service-${categoryIndex}-${itemIndex}`,
              name: serviceName,
              description: description,
              duration: duration,
              price: price,
              category: categoryTitle === "Add-On" ? "Add-On" : "Main Service",
              selected: false,
            })
          })
        })
      }

      console.log("Parsed services from HTML:", services.length, "services")
      return services
    } catch (error) {
      console.error("Error parsing services from response:", error)
      return []
    }
  }

  // Update the handleFormSubmit function to set services correctly
  const handleFormSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true)
    setError(null)
    setLoadingServices(true)
    console.log("Submitting form data:", data)
    console.log("Using webhook URL:", webhookUrl)
    console.log("Current session ID:", sessionId)
    console.log("Using userId:", USER_ID.current)

    try {
      // First, try to send the data to the webhook
      try {
        console.log("Sending data to webhook:", webhookUrl)

        // Create the payload to match the booking page structure
        const payload = {
          message: {
            text: "New customer onboarding submission",
            userId: USER_ID.current,
            timestamp: new Date().toISOString(),
            userInfo: {
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              selectedAction: "new_customer_onboarding",
            },
            // Include the full form data in a separate field
            formData: data,
            type: "new_customer_onboarding",
            source: "critter_booking_site",
          },
        }

        // Add session ID and conversation ID if they exist
        if (sessionId) {
          payload.message.sessionId = sessionId
        }

        if (conversationId) {
          payload.message.conversationId = conversationId
        }

        console.log("Sending payload:", payload)

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          console.error("Webhook response not OK:", response.status, response.statusText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        console.log("Webhook response:", response)

        // Try to get the response body for more detailed logging
        try {
          const responseData = await response.json()
          console.log("Webhook response data:", responseData)

          // Capture session ID and conversation ID from response if available
          if (responseData.sessionId && !sessionId) {
            console.log("Setting session ID from response:", responseData.sessionId)
            setSessionId(responseData.sessionId)
          }

          if (responseData.conversationId && !conversationId) {
            console.log("Setting conversation ID from response:", responseData.conversationId)
            setConversationId(responseData.conversationId)
          }

          // Parse services from the response
          const parsedServices = parseServicesFromResponse(responseData)

          if (parsedServices.length > 0) {
            console.log("Setting services from response:", parsedServices)
            setServices(parsedServices)

            // Store the form data and move to the next step
            setFormData(data)
            setCurrentStep("services")
          } else {
            console.warn("No services found in response")
            setError("No services were found for this professional. Please try again or contact support.")
          }
        } catch (parseError) {
          console.log("Could not parse response as JSON:", parseError)
          setError("Could not retrieve services. Please try again.")
        }
      } catch (webhookError) {
        // If the webhook fails, log the error
        console.error("Webhook error:", webhookError)
        console.log("Error details:", webhookError.message)
        setError("There was an error connecting to the server. Please try again.")
      }
    } catch (err) {
      console.error("Error in form submission flow:", err)
      setError("There was an error submitting your information. Please try again.")
    } finally {
      setIsSubmitting(false)
      setLoadingServices(false)
    }
  }

  // Update the handleServiceSubmit function with similar structure
  const handleServiceSubmit = async (data: ServiceSelectionData) => {
    setIsSubmitting(true)
    setError(null)
    console.log("Submitting service data:", data)
    console.log("Using webhook URL:", webhookUrl)
    console.log("Current session ID:", sessionId)
    console.log("Current conversation ID:", conversationId)
    console.log("Using userId:", USER_ID.current)

    try {
      // First, try to send the data to the webhook
      try {
        console.log("Sending service data to webhook:", webhookUrl)

        // Create the payload to match the booking page structure
        const payload = {
          message: {
            text: "New customer service selection",
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
            // Include the full form data and service data in separate fields
            formData: formData,
            serviceData: data,
            type: "new_customer_service_selection",
            source: "critter_booking_site",
          },
        }

        // Add session ID and conversation ID if they exist
        if (sessionId) {
          payload.message.sessionId = sessionId
        }

        if (conversationId) {
          payload.message.conversationId = conversationId
        }

        console.log("Sending payload:", payload)

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          console.error("Webhook response not OK:", response.status, response.statusText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        console.log("Webhook response:", response)

        // Try to get the response body for more detailed logging
        try {
          const responseData = await response.json()
          console.log("Webhook response data:", responseData)

          // Update session ID and conversation ID if provided in the response
          if (responseData.sessionId) {
            console.log("Updating session ID from response:", responseData.sessionId)
            setSessionId(responseData.sessionId)
          }

          if (responseData.conversationId) {
            console.log("Updating conversation ID from response:", responseData.conversationId)
            setConversationId(responseData.conversationId)
          }
        } catch (parseError) {
          console.log("Could not parse response as JSON:", parseError)
        }
      } catch (webhookError) {
        // If the webhook fails, log the error but continue with the flow
        console.error("Webhook error:", webhookError)
        console.log("Error details:", webhookError.message)
        console.log("Continuing despite webhook error")
        // We don't set the error state here to allow the user to continue
      }

      // Store the service data and move to the confirmation step regardless of webhook success
      setServiceData(data)
      setCurrentStep("confirmation")
    } catch (err) {
      console.error("Error in service submission flow:", err)
      setError("There was an error submitting your service selection. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <p className="body-font">{error}</p>
        </div>
      )}

      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E75837] mr-3"></div>
              <p className="body-font">
                {loadingServices ? "Retrieving available services..." : "Submitting your information..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {currentStep === "form" && <OnboardingForm onSubmit={handleFormSubmit} onCancel={onCancel} />}

      {currentStep === "services" && services.length > 0 && (
        <ServiceSelection services={services} onSubmit={handleServiceSubmit} onBack={() => setCurrentStep("form")} />
      )}

      {currentStep === "confirmation" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 header-font">Booking Request Submitted!</h2>
            <p className="text-gray-600 body-font">
              Your information has been sent to your Critter professional. They will contact you shortly to confirm your
              booking.
            </p>
            <div className="mt-2 text-xs text-gray-500 body-font">
              {sessionId && <p>Session ID: {sessionId}</p>}
              <p>User ID: {USER_ID.current}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium mb-3 header-font">Booking Summary</h3>
            {formData && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 body-font">Professional</p>
                <p className="font-medium header-font">{formData.professionalName}</p>
              </div>
            )}

            {serviceData && (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 body-font">Services</p>
                  <ul className="list-disc list-inside">
                    {serviceData.services.map((service, index) => (
                      <li key={index} className="font-medium header-font">
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 body-font">Date & Time</p>
                  <p className="font-medium header-font">
                    {serviceData.date} at {serviceData.time}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={onComplete}
              className="bg-[#E75837] text-white px-6 py-2 rounded-lg hover:bg-[#d04e30] transition-colors body-font"
            >
              Return to Home
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"
import { useState } from "react"
import { useEffect } from "react"

import { useRouter } from "next/navigation"
import Header from "../../../components/header"
import EnrollmentStep from "../../../components/custom-agent/enrollment-step"
import ConfigurationStep from "../../../components/custom-agent/configuration-step"
import TestingStep from "../../../components/custom-agent/testing-step"
import ImplementationStep from "../../../components/custom-agent/implementation-step"
import SuccessStep from "../../../components/custom-agent/success-step"
import { Loader2, MessageSquare, CheckCircle2 } from "lucide-react"

// Define the webhook URL
const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0"

export default function CustomAgentSetupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [professionalId, setProfessionalId] = useState("")
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null)
  const [configurationSkipped, setConfigurationSkipped] = useState(false)
  const [hasExistingCustomization, setHasExistingCustomization] = useState(false)
  const [agentConfig, setAgentConfig] = useState({
    cancellationPolicy: "",
    newCustomerProcess: "",
    animalRestrictions: "",
    serviceDetails: "",
    additionalInfo: "",
    chatName: "Critter Support",
    chatWelcomeMessage: "Hello! I'm your Critter professional's virtual assistant. How can I help you today?",
    widgetConfig: {
      primaryColor: "#94ABD6",
      position: "bottom-right",
      size: "medium",
    },
  })
  const [isConfigSaved, setIsConfigSaved] = useState(false)
  const [testMessages, setTestMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    {
      text: "Hello! I'm your Critter professional's virtual assistant. How can I help you today?",
      isUser: false,
    },
  ])
  const [testInput, setTestInput] = useState("")
  const [isTestingActive, setIsTestingActive] = useState(false)

  // Simplified function to parse webhook response
  const parseWebhookResponse = (data: any): string => {
    try {
      console.log("Raw response data:", data)

      // Handle array response
      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0]

        // Since n8n now handles all formatting, we just need to extract the output
        if (firstItem.output) {
          return firstItem.output
        }

        // Fallback for other response formats
        if (firstItem.response) return firstItem.response
        if (typeof firstItem === "string") return firstItem
        return String(firstItem)
      }

      // Handle direct object response
      if (data && typeof data === "object") {
        if (data.output) return data.output
        if (data.response) return data.response
      }

      // Handle direct string response
      if (typeof data === "string") {
        return data
      }

      // Fallback
      return "I'm sorry, I couldn't process that request."
    } catch (error) {
      console.error("Error parsing webhook response:", error)
      return "I'm sorry, there was an error processing your request."
    }
  }

  // Function to load existing customization settings
  const loadExistingCustomization = async (professionalId: string) => {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_widget_customization",
          professionalId: professionalId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Existing customization response:", data)

      if (Array.isArray(data) && data.length > 0) {
        const customization = data[0]

        if (customization) {
          setHasExistingCustomization(true)
          setAgentConfig((prev) => ({
            ...prev,
            chatName: customization.chat_name || prev.chatName,
            chatWelcomeMessage: customization.chat_welcome_message || prev.chatWelcomeMessage,
            widgetConfig: {
              primaryColor: customization.widget_primary_color || prev.widgetConfig.primaryColor,
              position: customization.widget_position || prev.widgetConfig.position,
              size: customization.widget_size || prev.widgetConfig.size,
            },
          }))
        }
      }
    } catch (err) {
      console.error("Error loading existing customization:", err)
      // Don't show error to user, just use defaults
    }
  }

  // Function to save widget customization
  const saveWidgetCustomization = async () => {
    if (!professionalId) return false

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "save_widget_customization",
          professionalId: professionalId,
          customization: {
            chatName: agentConfig.chatName,
            chatWelcomeMessage: agentConfig.chatWelcomeMessage,
            widgetConfig: agentConfig.widgetConfig,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Save customization response:", data)

      // Handle the response - check for various success patterns
      if (Array.isArray(data) && data.length > 0) {
        const result = data[0]

        // Check for output message indicating success
        if (
          result.output &&
          (result.output.includes("saved") ||
            result.output.includes("updated") ||
            result.output.includes("configuration") ||
            result.output.includes("success"))
        ) {
          console.log("Customization save successful based on output message")
          return true
        }

        // Check if we got back a query structure (which means n8n processed the request)
        if (result.query && result.parameters) {
          console.log("Customization save request processed successfully")
          return true
        }

        // Also check for direct success indicators
        if (result.success || result.id || result.professional_id) {
          return true
        }
      }

      // If we get here, the response format was unexpected but we'll assume success
      // since the request was processed without errors
      console.warn("Unexpected response format for customization save:", data)
      return true
    } catch (err) {
      console.error("Error saving customization:", err)
      return false
    }
  }

  // Function to check enrollment status
  const checkEnrollmentStatus = async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "check_enrollment",
          professionalId: id,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Enrollment check response:", data)

      // Handle the response - now expecting an array
      if (Array.isArray(data) && data.length > 0) {
        const professional = data[0]

        if (professional) {
          // Use the new enrollment status values and the is_enrolled_and_active boolean
          setIsEnrolled(
            professional.is_enrolled_and_active === true ||
              professional.enrollment_status === "enrolled_and_active" ||
              professional.enrollment_status === "enrolled_but_inactive",
          )

          return true
        } else {
          setError("Professional not found")
          return false
        }
      } else {
        setError("Failed to verify professional ID")
        return false
      }
    } catch (err) {
      console.error("Error checking enrollment:", err)
      setError("An error occurred while checking enrollment status. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Function to toggle enrollment
  const toggleEnrollment = async (enroll: boolean) => {
    if (!professionalId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "toggle_enrollment",
          professionalId: professionalId,
          enroll: enroll,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Toggle enrollment response:", data)

      // Handle array response for enrollment
      if (Array.isArray(data) && data.length > 0) {
        const result = data[0]

        // Check for successful enrollment based on multiple response formats
        const isSuccessful =
          result &&
          (result.operation_type === "updated" ||
            result.enrolled_at ||
            (result.output &&
              (result.output.includes("successfully enrolled") || result.output === "successfully enrolled")))

        if (isSuccessful) {
          setIsEnrolled(enroll)
          setError(null) // Clear any previous errors
          return true
        } else {
          setError(result?.message || `Failed to ${enroll ? "enroll" : "unenroll"}`)
          return false
        }
      } else {
        setError(`Failed to ${enroll ? "enroll" : "unenroll"}`)
        return false
      }
    } catch (err) {
      console.error("Error toggling enrollment:", err)
      setError(`An error occurred while ${enroll ? "enrolling" : "unenrolling"}. Please try again.`)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Function to save agent configuration
  const saveAgentConfiguration = async () => {
    if (!professionalId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "save_agent_config",
          professionalId: professionalId,
          config: agentConfig,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Save configuration response:", data)

      // Handle array response with output message
      if (Array.isArray(data) && data.length > 0) {
        const result = data[0]

        // Check for output message indicating success
        if (
          result.output &&
          (result.output.includes("saved") ||
            result.output.includes("configuration") ||
            result.output.includes("success"))
        ) {
          console.log("Configuration save successful based on output message")
          setIsConfigSaved(true)
          return true
        }

        // Check for other success indicators
        if (result.success || (result.id && result.professional_id && result.content_type === "policy_configuration")) {
          setIsConfigSaved(true)
          return true
        }
      }

      // If we get here, the response format was unexpected but we'll assume success
      // since the request was processed without errors
      console.warn("Unexpected response format for configuration save:", data)
      setIsConfigSaved(true)
      return true
    } catch (err) {
      console.error("Error saving configuration:", err)
      setError("An error occurred while saving your configuration. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Function to send test message
  const sendTestMessage = async (message: string) => {
    if (!professionalId || !message.trim()) return

    // Add user message to chat
    setTestMessages((prev) => [...prev, { text: message, isUser: true }])
    setTestInput("")
    setIsTestingActive(true)

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "support_conversation",
          professionalId: professionalId,
          message: message,
          userInfo: {
            source: "testing_interface",
            sessionId: "test_" + Date.now(),
            timestamp: new Date().toISOString(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Test agent response:", data)

      // Parse the response using our new function
      const responseMessage = parseWebhookResponse(data)

      // Add agent response to chat
      setTimeout(() => {
        setTestMessages((prev) => [...prev, { text: responseMessage, isUser: false }])
        setIsTestingActive(false)
      }, 1000)
    } catch (err) {
      console.error("Error testing agent:", err)
      setTimeout(() => {
        setTestMessages((prev) => [
          ...prev,
          {
            text: "I'm sorry, there was an error processing your request. Please try again.",
            isUser: false,
          },
        ])
        setIsTestingActive(false)
      }, 1000)
    }
  }

  // Function to handle step navigation
  const handleNextStep = async () => {
    if (currentStep === 1) {
      // If we're on the enrollment step and haven't checked enrollment yet
      if (isEnrolled === null) {
        await checkEnrollmentStatus(professionalId)
        return // Don't advance to next step yet, just show the status
      }

      // Only proceed to next step if enrolled
      if (isEnrolled) {
        setCurrentStep(2)
      }
      // If not enrolled, stay on step 1 to show enrollment option
    } else if (currentStep === 2) {
      // Training step - save if there's content
      const success = await saveAgentConfiguration()
      if (success) {
        // Load existing customization when entering customization step
        if (professionalId) {
          await loadExistingCustomization(professionalId)
        }
        setCurrentStep(3)
      }
    } else if (currentStep === 3) {
      // Customization step - save widget customization before proceeding to testing
      const success = await saveWidgetCustomization()
      if (success) {
        setCurrentStep(4)
      } else {
        setError("Failed to save customization settings. Please try again.")
      }
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Function to handle skipping configuration
  const handleSkipConfiguration = async () => {
    setConfigurationSkipped(true)
    // Load existing customization when skipping to customization step
    if (professionalId) {
      await loadExistingCustomization(professionalId)
    }
    setCurrentStep(3) // Skip to customization step
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Update test messages when chat name or welcome message changes
  useEffect(() => {
    // Only update the first message if it exists
    if (testMessages.length > 0 && !testMessages[0].isUser) {
      setTestMessages([
        {
          text: agentConfig.chatWelcomeMessage,
          isUser: false,
        },
        ...testMessages.slice(1),
      ])
    }
  }, [agentConfig.chatWelcomeMessage])

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-4xl mx-auto px-4 flex flex-col page-content">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#f5f8fd] rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-[#94ABD6]" />
            </div>
            <h1 className="text-4xl title-font mb-4 font-sangbleu">Custom Support Agent Setup</h1>
            <p className="text-gray-700 max-w-3xl mx-auto body-font">
              Create a personalized AI support agent trained on your business policies and FAQs.
            </p>
          </div>

          {/* Existing Customization Notice */}
          {hasExistingCustomization && currentStep >= 3 && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
              <p className="body-font">
                <strong>Existing settings loaded:</strong> We've loaded your previous customization settings. You can
                update them below.
              </p>
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div
                className={`flex flex-col items-center ${
                  currentStep >= 1 ? "text-[#94ABD6]" : "text-gray-400"
                } transition-colors`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    currentStep >= 1 ? "bg-[#94ABD6] text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  1
                </div>
                <span className="text-xs">Enrollment</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? "bg-[#94ABD6]" : "bg-gray-200"}`}></div>
              <div
                className={`flex flex-col items-center ${
                  currentStep >= 2 ? "text-[#94ABD6]" : "text-gray-400"
                } transition-colors`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    currentStep >= 2 ? "bg-[#94ABD6] text-white" : "bg-gray-200 text-gray-500"
                  } ${configurationSkipped ? "border-2 border-dashed border-gray-400" : ""}`}
                >
                  {configurationSkipped ? "⏭" : "2"}
                </div>
                <span className="text-xs">Training</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? "bg-[#94ABD6]" : "bg-gray-200"}`}></div>
              <div
                className={`flex flex-col items-center ${
                  currentStep >= 3 ? "text-[#94ABD6]" : "text-gray-400"
                } transition-colors`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    currentStep >= 3 ? "bg-[#94ABD6] text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  3
                </div>
                <span className="text-xs">Customization</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 4 ? "bg-[#94ABD6]" : "bg-gray-200"}`}></div>
              <div
                className={`flex flex-col items-center ${
                  currentStep >= 4 ? "text-[#94ABD6]" : "text-gray-400"
                } transition-colors`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    currentStep >= 4 ? "bg-[#94ABD6] text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  4
                </div>
                <span className="text-xs">Testing</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 5 ? "bg-[#94ABD6]" : "bg-gray-200"}`}></div>
              <div
                className={`flex flex-col items-center ${
                  currentStep >= 5 ? "text-[#94ABD6]" : "text-gray-400"
                } transition-colors`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    currentStep >= 5 ? "bg-[#94ABD6] text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-xs">Complete</span>
              </div>
            </div>
          </div>

          {/* Skipped Configuration Notice */}
          {configurationSkipped && currentStep >= 3 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-6">
              <p className="body-font">
                <strong>Training skipped:</strong> Your agent is using default settings. You can add custom business
                policies anytime from your dashboard.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="body-font">{error}</p>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl flex items-center">
                <Loader2 className="h-6 w-6 text-[#94ABD6] animate-spin mr-3" />
                <p className="text-gray-700 body-font">Processing your request...</p>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            {currentStep === 1 && (
              <EnrollmentStep
                professionalId={professionalId}
                setProfessionalId={setProfessionalId}
                isEnrolled={isEnrolled}
                toggleEnrollment={toggleEnrollment}
                onNext={handleNextStep}
              />
            )}

            {currentStep === 2 && (
              <ConfigurationStep
                agentConfig={agentConfig}
                setAgentConfig={setAgentConfig}
                onNext={handleNextStep}
                onBack={handlePrevStep}
                onSkip={handleSkipConfiguration}
              />
            )}

            {currentStep === 3 && (
              <ImplementationStep
                professionalId={professionalId || ""}
                agentConfig={agentConfig}
                setAgentConfig={setAgentConfig}
                onNext={handleNextStep}
                onBack={handlePrevStep}
              />
            )}

            {currentStep === 4 && (
              <TestingStep
                testMessages={testMessages}
                testInput={testInput}
                setTestInput={setTestInput}
                sendTestMessage={sendTestMessage}
                isTestingActive={isTestingActive}
                onNext={() => setCurrentStep(5)}
                onBack={handlePrevStep}
                agentConfig={agentConfig}
              />
            )}

            {currentStep === 5 && (
              <SuccessStep
                professionalName={professionalId}
                professionalId={professionalId || ""}
                agentConfig={agentConfig}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

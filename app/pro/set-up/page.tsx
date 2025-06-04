"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, MessageSquare, Sparkles, ArrowRight, Construction, Check, AlertCircle, Loader2 } from "lucide-react"
import PasswordProtection from "../../../components/password-protection"

export default function ProfessionalSetupPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  // Function to validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Function to handle tile clicks
  const handleTileClick = (tile: "intake" | "agent" | "feature") => {
    if (tile === "intake") {
      router.push("/newcustomer")
      return
    }

    if (tile === "agent") {
      // Show coming soon modal for Custom Support Agent
      setShowComingSoon(true)
      return
    }

    if (tile === "feature") {
      // This could be another coming soon feature
      setShowComingSoon(true)
      return
    }
  }

  // Function to handle the notify me submission
  const handleNotifySubmit = async () => {
    // Reset states
    setSubmitStatus("idle")
    setErrorMessage("")

    // Validate email
    if (!notifyEmail) {
      setErrorMessage("Please enter your email address")
      return
    }

    if (!isValidEmail(notifyEmail)) {
      setErrorMessage("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      // Create a unique user ID for this submission
      const userId = `pro_user_${Math.random().toString(36).substring(2, 10)}`

      // Prepare the payload for webhook
      const payload = {
        message: {
          text: "Professional notification request for Custom Support Agent",
          userId: userId,
          timestamp: new Date().toISOString(),
          userInfo: {
            email: notifyEmail,
            selectedAction: "notify_me_custom_agent",
          },
          source: "critter_professional_setup",
        },
      }

      console.log("Sending professional notification request")

      // For now, just simulate success since we don't have the webhook setup
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSubmitStatus("success")
      setNotifyEmail("")
    } catch (error) {
      console.error("Error sending notification request:", error)
      setSubmitStatus("error")
      setErrorMessage("There was an error submitting your request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to close the modal and reset states
  const handleCloseModal = () => {
    setShowComingSoon(false)
    setNotifyEmail("")
    setSubmitStatus("idle")
    setErrorMessage("")
  }

  if (!isAuthenticated) {
    return <PasswordProtection onAuthenticated={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 header-font">Critter Professional Setup</h1>
              <p className="text-gray-600 mt-2 body-font">Choose the tools and features you'd like to set up</p>
            </div>
            <button onClick={() => router.push("/")} className="text-gray-600 hover:text-gray-800 body-font">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Customer Intake Tile */}
            <div
              onClick={() => handleTileClick("intake")}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:scale-102 hover:shadow-lg cursor-pointer border border-gray-100 h-full flex flex-col relative group"
            >
              <div className="bg-gradient-to-r from-[#E75837] to-[#f07a5f] h-2 w-full"></div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="w-16 h-16 bg-[#fff8f6] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#E75837] group-hover:text-white transition-colors">
                  <Users className="h-8 w-8 text-[#E75837] group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 header-font">Customer Intake</h3>
                <p className="text-gray-600 mb-6 flex-grow body-font text-lg">
                  Set up and manage customer onboarding processes. Help new clients get started with your services.
                </p>
                <div className="mt-auto space-y-3">
                  <div className="flex items-center text-gray-500 body-font">
                    <Check className="w-5 h-5 mr-3 flex-shrink-0 text-green-500" />
                    <span>Streamlined onboarding</span>
                  </div>
                  <div className="flex items-center text-gray-500 body-font">
                    <Check className="w-5 h-5 mr-3 flex-shrink-0 text-green-500" />
                    <span>Customer information collection</span>
                  </div>
                  <div className="flex items-center text-gray-500 body-font">
                    <Check className="w-5 h-5 mr-3 flex-shrink-0 text-green-500" />
                    <span>Service preferences setup</span>
                  </div>
                </div>
                <div className="flex items-center text-[#E75837] font-medium mt-8 header-font group-hover:text-[#d04e30] text-lg">
                  Set Up Intake <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Custom Support Agent Tile - Coming Soon */}
            <div
              onClick={() => handleTileClick("agent")}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 h-full flex flex-col relative opacity-75 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="bg-gradient-to-r from-[#94ABD6] to-[#b0c1e3] h-2 w-full"></div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="w-16 h-16 bg-[#f5f8fd] rounded-full flex items-center justify-center mb-6 relative">
                  <MessageSquare className="h-8 w-8 text-[#94ABD6]" />
                  <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Soon
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 header-font">Custom Support Agent</h3>
                <p className="text-gray-600 mb-6 flex-grow body-font text-lg">
                  Create an AI-powered support agent customized for your business. Handle customer inquiries 24/7.
                </p>
                <div className="mt-auto space-y-3">
                  <div className="flex items-center text-gray-400 body-font">
                    <Construction className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>AI-powered responses</span>
                  </div>
                  <div className="flex items-center text-gray-400 body-font">
                    <Construction className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>24/7 customer support</span>
                  </div>
                  <div className="flex items-center text-gray-400 body-font">
                    <Construction className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>Custom branding & setup</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-500 font-medium mt-8 header-font text-lg">
                  Coming Soon <Construction className="ml-2 h-5 w-5" />
                </div>
              </div>
            </div>

            {/* New Feature Tile - Coming Soon */}
            <div
              onClick={() => handleTileClick("feature")}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 h-full flex flex-col relative opacity-75 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="bg-gradient-to-r from-[#745E25] to-[#8b7030] h-2 w-full"></div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="w-16 h-16 bg-[#f9f7f2] rounded-full flex items-center justify-center mb-6 relative">
                  <Sparkles className="h-8 w-8 text-[#745E25]" />
                  <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Soon
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 header-font">Advanced Analytics</h3>
                <p className="text-gray-600 mb-6 flex-grow body-font text-lg">
                  Get detailed insights into your business performance, customer satisfaction, and growth opportunities.
                </p>
                <div className="mt-auto space-y-3">
                  <div className="flex items-center text-gray-400 body-font">
                    <Construction className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>Performance metrics</span>
                  </div>
                  <div className="flex items-center text-gray-400 body-font">
                    <Construction className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>Customer insights</span>
                  </div>
                  <div className="flex items-center text-gray-400 body-font">
                    <Construction className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>Growth recommendations</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-500 font-medium mt-8 header-font text-lg">
                  Coming Soon <Construction className="ml-2 h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div className="bg-white p-8 rounded-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#f5f8fd] rounded-full flex items-center justify-center">
                <Construction className="h-8 w-8 text-[#94ABD6]" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-4 header-font">Coming Soon!</h3>
            <p className="text-gray-600 text-center mb-6 body-font">
              We're working hard to bring you this feature. Sign up to be notified when it launches.
            </p>

            {submitStatus === "success" ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                <p className="body-font">Thank you! We'll notify you when this feature launches.</p>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <p className="body-font">{errorMessage}</p>
                  </div>
                )}
                <div className="flex mb-4">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
                  />
                  <button
                    onClick={handleNotifySubmit}
                    disabled={isSubmitting}
                    className="bg-[#94ABD6] text-white px-4 py-3 rounded-r-lg hover:bg-[#7a90ba] transition-colors flex items-center justify-center min-w-[100px]"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Notify Me"}
                  </button>
                </div>
              </>
            )}
            <button
              onClick={handleCloseModal}
              className="w-full text-gray-600 text-sm hover:text-gray-800 transition-colors body-font"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

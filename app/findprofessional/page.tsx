"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Construction, Loader2, Check, AlertCircle } from "lucide-react"
import Header from "../../components/header"

export default function FindProfessionalPage() {
  const router = useRouter()
  const [notifyEmail, setNotifyEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/dce0dbdb-2834-4a95-a483-d19042dd49c4"

  // Function to validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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
      const userId = `web_user_${Math.random().toString(36).substring(2, 10)}`

      // Prepare the payload
      const payload = {
        message: {
          text: "Notification request for professional matching service",
          userId: userId,
          timestamp: new Date().toISOString(),
          userInfo: {
            email: notifyEmail,
            selectedAction: "notify_me",
          },
          source: "critter_booking_site",
        },
      }

      console.log("Sending notification request to webhook:", WEBHOOK_URL)
      console.log("Payload:", payload)

      // Send the webhook
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Handle successful response
      console.log("Notification request sent successfully")
      setSubmitStatus("success")
      setNotifyEmail("") // Clear the email field
    } catch (error) {
      console.error("Error sending notification request:", error)
      setSubmitStatus("error")
      setErrorMessage("There was an error submitting your request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler to go back to landing page
  const handleBackToLanding = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto px-4 flex flex-col page-content">
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md mt-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#f5f8fd] rounded-full flex items-center justify-center">
                <Construction className="h-8 w-8 text-[#94ABD6]" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center mb-4 header-font">Find a Professional</h1>
            <p className="text-gray-600 text-center mb-6 body-font">This is the page to find a professional.</p>

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
              onClick={handleBackToLanding}
              className="w-full text-gray-600 text-sm hover:text-gray-800 transition-colors body-font mt-4"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

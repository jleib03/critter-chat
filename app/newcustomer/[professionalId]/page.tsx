"use client"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import NewCustomerOnboarding from "../../../components/new-customer-onboarding"
import Header from "../../../components/header"
import { Loader2 } from "lucide-react"

export default function ProfessionalSpecificPage() {
  const params = useParams()
  const router = useRouter()
  const professionalId = params.professionalId as string
  const [professionalName, setProfessionalName] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook-test/216e36c3-4fe2-4f2e-80c3-d9ce6524f445"

  // Handler to go back to landing page
  const handleBackToLanding = () => {
    router.push("/")
  }

  // Fetch professional name when component mounts
  useEffect(() => {
    const fetchProfessionalName = async () => {
      try {
        setLoading(true)
        console.log("Fetching professional info for ID:", professionalId)

        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "get_professional_name",
            professionalId: professionalId,
          }),
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        // Get the raw text first to debug
        const rawText = await response.text()
        console.log("Raw response:", rawText)

        // Try to parse if it looks like JSON
        let data
        try {
          if (rawText && rawText.trim()) {
            data = JSON.parse(rawText)
          }
        } catch (parseError) {
          console.error("JSON parse error:", parseError)
          // If we can't parse as JSON but have text, try to extract the name directly
          if (rawText && rawText.includes("name")) {
            const nameMatch = rawText.match(/"name"\s*:\s*"([^"]+)"/)
            if (nameMatch && nameMatch[1]) {
              setProfessionalName(nameMatch[1])
              setLoading(false)
              return
            }
          }
          throw new Error("Invalid response format")
        }

        // Check for name in parsed data
        if (data) {
          if (data.name) {
            setProfessionalName(data.name)
          } else if (data.professional_name) {
            setProfessionalName(data.professional_name)
          } else if (data.message && typeof data.message === "string") {
            // Try to parse message if it's a string that might contain JSON
            try {
              const messageData = JSON.parse(data.message)
              if (messageData.name) {
                setProfessionalName(messageData.name)
              } else if (messageData.professional_name) {
                setProfessionalName(messageData.professional_name)
              } else {
                throw new Error("Professional name not found in response")
              }
            } catch (e) {
              // If message isn't JSON, check if it directly contains the name
              if (data.message.includes("Critter")) {
                setProfessionalName(data.message)
              } else {
                throw new Error("Professional name not found in response")
              }
            }
          } else {
            throw new Error("Professional name not found in response")
          }
        } else {
          throw new Error("Empty response from server")
        }
      } catch (err) {
        console.error("Error fetching professional name:", err)
        setError("Professional not found")
      } finally {
        setLoading(false)
      }
    }

    if (professionalId) {
      fetchProfessionalName()
    }
  }, [professionalId, WEBHOOK_URL])

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto px-4 flex flex-col page-content">
          <h1 className="text-4xl title-font text-center mb-4 font-sangbleu">New Customer Onboarding</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-[#E75837] animate-spin mb-4" />
              <p className="text-gray-600 body-font">Loading professional information...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-600 text-center body-font">{error}</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleBackToLanding}
                  className="px-4 py-2 bg-[#E75837] text-white rounded-lg hover:bg-[#d04e30] transition-colors body-font"
                >
                  Return to Home
                </button>
              </div>
            </div>
          ) : (
            <>
              {professionalName && (
                <div className="bg-[#f0e9df] rounded-lg p-4 mb-8 text-center">
                  <p className="text-gray-700 body-font">
                    You're setting up an account with{" "}
                    <span className="font-medium text-[#E75837]">{professionalName}</span>
                  </p>
                </div>
              )}
              <p className="text-center text-gray-700 mb-8 max-w-3xl mx-auto body-font">
                Complete the form below to set up your account with your Critter professional.
              </p>
              <div className="flex-1 flex flex-col mb-12">
                <NewCustomerOnboarding
                  onCancel={handleBackToLanding}
                  onComplete={handleBackToLanding}
                  webhookUrl={WEBHOOK_URL}
                  initialProfessionalId={professionalId}
                  initialProfessionalName={professionalName}
                  skipProfessionalStep={true}
                  userInfo={{
                    firstName: "",
                    lastName: "",
                    email: "",
                  }}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

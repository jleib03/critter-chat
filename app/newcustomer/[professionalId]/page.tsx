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

        const data = await response.json()
        if (data.professional_name) {
          setProfessionalName(data.professional_name)
        } else {
          setError("Professional not found")
        }
      } catch (err) {
        console.error("Error fetching professional name:", err)
        setError("Failed to load professional information")
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
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

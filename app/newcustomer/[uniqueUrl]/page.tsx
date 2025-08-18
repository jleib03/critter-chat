"use client"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import NewCustomerIntake from "../../../components/new-customer-intake"
import Header from "../../../components/header"
import { Loader2 } from "lucide-react"
import { getWebhookEndpoint, logWebhookUsage } from "../../../types/webhook-endpoints"

export default function ProfessionalSpecificPage() {
  const params = useParams()
  const router = useRouter()
  const uniqueUrl = params.uniqueUrl as string
  const [professionalName, setProfessionalName] = useState<string>("")
  const [professionalId, setProfessionalId] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Handler to go back to landing page
  const handleBackToLanding = () => {
    router.push("/")
  }

  // Fetch professional name when component mounts
  useEffect(() => {
    const fetchProfessionalName = async () => {
      try {
        setLoading(true)
        console.log("[v0] Fetching professional info for intake URL:", uniqueUrl)

        const webhookUrl = getWebhookEndpoint("NEW_CUSTOMER_ONBOARDING")
        console.log("[v0] Webhook URL:", webhookUrl)
        logWebhookUsage("NEW_CUSTOMER_ONBOARDING", "get_professional_name")

        const requestPayload = {
          action: "get_professional_name",
          uniqueUrl: uniqueUrl,
        }
        console.log("[v0] Request payload:", JSON.stringify(requestPayload, null, 2))

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
        })

        console.log("[v0] Response status:", response.status)
        console.log("[v0] Response ok:", response.ok)
        console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          console.log("[v0] Response not ok, status:", response.status, response.statusText)
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
        }

        // Get the raw text first to debug
        const rawText = await response.text()
        console.log("[v0] Raw response:", rawText)

        // Try to parse if it looks like JSON
        let data
        try {
          if (rawText && rawText.trim()) {
            data = JSON.parse(rawText)
            console.log("Parsed data:", data)
            console.log("Data type:", typeof data)
            console.log("Data keys:", Object.keys(data))
          }
        } catch (parseError) {
          console.error("JSON parse error:", parseError)
          // If we can't parse as JSON but have text, try to extract the name directly
          if (rawText && rawText.includes("name")) {
            const nameMatch = rawText.match(/"name"\s*:\s*"([^"]+)"/)
            if (nameMatch && nameMatch[1]) {
              console.log("Extracted name from regex:", nameMatch[1])
              setProfessionalName(nameMatch[1])
              setLoading(false)
              return
            }
          }
          throw new Error("Invalid response format")
        }

        // Check for name in parsed data
        if (data) {
          console.log("Checking data.name:", data.name)
          console.log("Checking data.professional_name:", data.professional_name)
          console.log("Checking data.professional_id:", data.professional_id)

          // Check if data is an array (which it is in this case)
          if (Array.isArray(data) && data.length > 0) {
            console.log("Data is an array, checking first element:", data[0])
            const firstItem = data[0]
            if (firstItem.name) {
              console.log("Found name in data[0].name:", firstItem.name)
              setProfessionalName(firstItem.name)
            } else if (firstItem.professional_name) {
              console.log("Found name in data[0].professional_name:", firstItem.professional_name)
              setProfessionalName(firstItem.professional_name)
            } else {
              console.log("No name found in first array element")
              throw new Error("Professional name not found in response")
            }

            // Set professional ID if available
            if (firstItem.professional_id) {
              console.log("Found ID in data[0].professional_id:", firstItem.professional_id)
              setProfessionalId(firstItem.professional_id)
            } else if (firstItem.id) {
              console.log("Found ID in data[0].id:", firstItem.id)
              setProfessionalId(firstItem.id)
            }
          } else if (data.name) {
            console.log("Found name in data.name:", data.name)
            setProfessionalName(data.name)
            if (data.professional_id) {
              setProfessionalId(data.professional_id)
            } else if (data.id) {
              setProfessionalId(data.id)
            }
          } else if (data.professional_name) {
            console.log("Found name in data.professional_name:", data.professional_name)
            setProfessionalName(data.professional_name)
            if (data.professional_id) {
              setProfessionalId(data.professional_id)
            } else if (data.id) {
              setProfessionalId(data.id)
            }
          } else if (data.message && typeof data.message === "string") {
            console.log("Checking data.message:", data.message)
            // Try to parse message if it's a string that might contain JSON
            try {
              const messageData = JSON.parse(data.message)
              console.log("Parsed message data:", messageData)
              if (messageData.name) {
                console.log("Found name in messageData.name:", messageData.name)
                setProfessionalName(messageData.name)
              } else if (messageData.professional_name) {
                console.log("Found name in messageData.professional_name:", messageData.professional_name)
                setProfessionalName(messageData.professional_name)
              } else {
                console.log("No name found in parsed message data")
                throw new Error("Professional name not found in response")
              }

              // Set professional ID if available
              if (messageData.professional_id) {
                setProfessionalId(messageData.professional_id)
              } else if (messageData.id) {
                setProfessionalId(messageData.id)
              }
            } catch (e) {
              console.log("Message is not JSON, checking if it contains name directly")
              // If message isn't JSON, check if it directly contains the name
              if (data.message.includes("Critter")) {
                console.log("Found Critter in message, using as name:", data.message)
                setProfessionalName(data.message)
              } else {
                console.log("No Critter found in message")
                throw new Error("Professional name not found in response")
              }
            }
          } else {
            console.log("No name found in any expected location")
            console.log("Available data properties:", Object.keys(data))
            throw new Error("Professional name not found in response")
          }
        } else {
          console.log("No data after parsing")
          throw new Error("Empty response from server")
        }
      } catch (err) {
        console.error("[v0] Error fetching professional name:", err)
        console.error("[v0] Error type:", typeof err)
        console.error("[v0] Error message:", err instanceof Error ? err.message : String(err))
        console.error("[v0] Error stack:", err instanceof Error ? err.stack : "No stack trace")

        if (err instanceof TypeError && err.message.includes("fetch")) {
          setError("Network connection failed. Please check your internet connection.")
        } else if (err instanceof Error && err.message.includes("HTTP Error")) {
          setError(`Server error: ${err.message}`)
        } else {
          setError("Professional not found")
        }
      } finally {
        setLoading(false)
      }
    }

    if (uniqueUrl) {
      fetchProfessionalName()
    }
  }, [uniqueUrl])

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto px-4 flex flex-col page-content">
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
              <div className="flex-1 flex flex-col mb-12">
                <NewCustomerIntake
                  onCancel={handleBackToLanding}
                  onComplete={handleBackToLanding}
                  initialProfessionalId={professionalId || uniqueUrl}
                  initialProfessionalName={professionalName}
                  skipProfessionalStep={true}
                  userInfo={null}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

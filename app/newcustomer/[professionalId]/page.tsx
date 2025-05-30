"use client"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import NewCustomerIntake from "../../../components/new-customer-intake"
import Header from "../../../components/header"
import { Loader2 } from "lucide-react"

export default function ProfessionalSpecificPage() {
  const params = useParams()
  const router = useRouter()
  const professionalId = params.professionalId as string
  const [professionalName, setProfessionalName] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/dce0dbdb-2834-4a95-a483-d19042dd49c4"

  // Handler to go back to landing page
  const handleBackToLanding = () => {
    router.push("/")
  }

  // Fetch professional name when component mounts
  useEffect(() => {
    const fetchProfessionalName = async () => {
      try {
        setLoading(true)
        console.log("Fetching professional info for intake ID:", professionalId)

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
          } else if (data.name) {
            console.log("Found name in data.name:", data.name)
            setProfessionalName(data.name)
          } else if (data.professional_name) {
            console.log("Found name in data.professional_name:", data.professional_name)
            setProfessionalName(data.professional_name)
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
                  webhookUrl={WEBHOOK_URL}
                  initialProfessionalId={professionalId}
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

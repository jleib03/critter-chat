"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import BookingPage from "../../../components/booking-page"

interface ProfessionalData {
  id: string
  business_name: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  services: string[]
  bio: string
  profile_image_url?: string
  business_hours?: {
    [key: string]: { open: string; close: string; isOpen: boolean }
  }
}

export default function SchedulePage() {
  const params = useParams()
  const uniqueUrl = params.uniqueUrl as string

  const [professionalData, setProfessionalData] = useState<ProfessionalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfessionalData = async () => {
      if (!uniqueUrl) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          "https://jleib03.app.n8n.cloud/webhook-test/4ae0fb3d-17dc-482f-be27-1c7ab5c31b16",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "initialize_schedule", // Updated action
              uniqueUrl: uniqueUrl,
              timestamp: new Date().toISOString(),
            }),
          },
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Professional data response:", data)

        // Handle the response format
        if (Array.isArray(data) && data.length > 0) {
          const professional = data[0]
          setProfessionalData({
            id: professional.id || professional.professional_id,
            business_name: professional.business_name || "",
            first_name: professional.first_name || "",
            last_name: professional.last_name || "",
            email: professional.email || "",
            phone: professional.phone || "",
            address: professional.address || "",
            city: professional.city || "",
            state: professional.state || "",
            zip: professional.zip || "",
            services: professional.services || [],
            bio: professional.bio || "",
            profile_image_url: professional.profile_image_url,
            business_hours: professional.business_hours,
          })
        } else if (data && typeof data === "object") {
          // Handle single object response
          setProfessionalData({
            id: data.id || data.professional_id,
            business_name: data.business_name || "",
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            zip: data.zip || "",
            services: data.services || [],
            bio: data.bio || "",
            profile_image_url: data.profile_image_url,
            business_hours: data.business_hours,
          })
        } else {
          throw new Error("Professional not found")
        }
      } catch (err) {
        console.error("Error fetching professional data:", err)
        setError("Unable to load professional information. Please check the URL and try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfessionalData()
  }, [uniqueUrl])

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      const response = await fetch("https://jleib03.app.n8n.cloud/webhook-test/4ae0fb3d-17dc-482f-be27-1c7ab5c31b16", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create_booking",
          ...bookingData,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Booking creation response:", result)
      return result
    } catch (error) {
      console.error("Error creating booking:", error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#E75837] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Booking Information</h2>
          <p className="text-gray-600">Please wait while we fetch the details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Page</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#E75837] text-white px-4 py-2 rounded-lg hover:bg-[#d04e30] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!professionalData) {
    return (
      <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Professional Not Found</h2>
            <p className="text-yellow-600">
              We couldn't find a professional with the URL "{uniqueUrl}". Please check the URL and try again.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <BookingPage professionalData={professionalData} onBookingSubmit={handleBookingSubmit} />
}

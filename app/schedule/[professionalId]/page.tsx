"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"

type AvailabilityHours = {
  [key: string]: {
    start: string
    end: string
    available: boolean
  }
}

type Booking = {
  id: string
  date: string
  startTime: string
  endTime: string
  service: string
  customerName: string
}

type Service = {
  id: string
  name: string
  duration: number // in minutes
  description?: string
}

type ProfessionalData = {
  professionalId: string
  availabilityHours: AvailabilityHours
  services: Service[]
  existingBookings: Booking[]
}

export default function SchedulePage() {
  const params = useParams()
  const professionalId = params.professionalId as string

  const [professionalData, setProfessionalData] = useState<ProfessionalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeSchedule = async () => {
      try {
        setLoading(true)
        setError(null)

        const webhookUrl = "https://jleib03.app.n8n.cloud/webhook-test/5671c1dd-48f6-47a9-85ac-4e20cf261520"

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            professional_id: professionalId,
            action: "initialize_schedule",
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setProfessionalData(data)
      } catch (err) {
        console.error("Error initializing schedule:", err)
        setError("Failed to load scheduling data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (professionalId) {
      initializeSchedule()
    }
  }, [professionalId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#E75837]" />
          <p className="text-gray-600 body-font">Loading scheduling information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2 header-font">Error Loading Schedule</h2>
            <p className="text-red-600 body-font">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors body-font"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 body-font">No scheduling data available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-[#E75837] mb-2 header-font">
            Schedule with Professional {professionalId}
          </h1>
          <p className="text-gray-600 body-font">Select a service and available time slot to book your appointment.</p>
        </div>

        {/* Debug Information - Remove in production */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 header-font">Debug Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 header-font">Services ({professionalData.services.length})</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto body-font">
                {JSON.stringify(professionalData.services, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 header-font">Availability Hours</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto body-font">
                {JSON.stringify(professionalData.availabilityHours, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 header-font">
                Existing Bookings ({professionalData.existingBookings.length})
              </h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto body-font">
                {JSON.stringify(professionalData.existingBookings, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Placeholder for future components */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 header-font">Coming Next</h2>
          <div className="space-y-2 text-gray-600 body-font">
            <p>• Service selection component</p>
            <p>• Weekly schedule view</p>
            <p>• Available time slot selection</p>
            <p>• Customer information form</p>
            <p>• Booking confirmation</p>
          </div>
        </div>
      </div>
    </div>
  )
}

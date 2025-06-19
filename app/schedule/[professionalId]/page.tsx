"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import type { WebhookResponse, Service, SelectedTimeSlot, CustomerInfo } from "@/types/schedule"
import { ServiceSelection } from "@/components/schedule/service-selection"
import { WeeklyCalendar } from "@/components/schedule/weekly-calendar"
import { CustomerForm } from "@/components/schedule/customer-form"
import { BookingConfirmation } from "@/components/schedule/booking-confirmation"

export default function SchedulePage() {
  const params = useParams()
  const professionalId = params.professionalId as string

  const [webhookData, setWebhookData] = useState<WebhookResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<SelectedTimeSlot | null>(null)
  const sessionIdRef = useRef<string | null>(null)

  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ firstName: "", lastName: "", email: "" })

  // Generate a unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  useEffect(() => {
    const initializeSchedule = async () => {
      try {
        setLoading(true)
        setError(null)

        // Generate session ID if it doesn't exist
        if (!sessionIdRef.current) {
          sessionIdRef.current = generateSessionId()
        }

        const webhookUrl = "https://jleib03.app.n8n.cloud/webhook-test/5671c1dd-48f6-47a9-85ac-4e20cf261520"

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            professional_id: professionalId,
            action: "initialize_schedule",
            session_id: sessionIdRef.current,
            timestamp: new Date().toISOString(),
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        // The response is an array, so we take the first element
        setWebhookData(data[0])
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

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setSelectedTimeSlot(null) // Reset time slot when service changes
  }

  const handleTimeSlotSelect = (slot: SelectedTimeSlot) => {
    setSelectedTimeSlot(slot)
    setShowCustomerForm(true)
  }

  const handleBookingComplete = () => {
    setShowConfirmation(true)
    setShowCustomerForm(false)
  }

  const handleNewBooking = () => {
    setSelectedService(null)
    setSelectedTimeSlot(null)
    setShowCustomerForm(false)
    setShowConfirmation(false)
    setCustomerInfo({ firstName: "", lastName: "", email: "" })
  }

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

  if (!webhookData) {
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-[#E75837] mb-2 header-font">
            Book with {webhookData.professional_info.professional_name}
          </h1>
          <p className="text-gray-600 body-font">Select a service and available time slot to book your appointment.</p>
        </div>

        {showConfirmation ? (
          <BookingConfirmation
            selectedService={selectedService!}
            selectedTimeSlot={selectedTimeSlot!}
            customerInfo={customerInfo}
            professionalName={webhookData.professional_info.professional_name}
            onNewBooking={handleNewBooking}
          />
        ) : showCustomerForm && selectedService && selectedTimeSlot ? (
          <CustomerForm
            selectedService={selectedService}
            selectedTimeSlot={selectedTimeSlot}
            professionalId={professionalId}
            professionalName={webhookData.professional_info.professional_name}
            sessionId={sessionIdRef.current!}
            onBookingComplete={handleBookingComplete}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <ServiceSelection
                servicesByCategory={webhookData.services.services_by_category}
                selectedService={selectedService}
                onServiceSelect={handleServiceSelect}
              />
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <WeeklyCalendar
                workingDays={webhookData.schedule.working_days}
                bookingData={webhookData.bookings.all_booking_data}
                selectedService={selectedService}
                onTimeSlotSelect={handleTimeSlotSelect}
                selectedTimeSlot={selectedTimeSlot}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

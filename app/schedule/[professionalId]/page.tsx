"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import type { WebhookResponse, Service, SelectedTimeSlot, CustomerInfo, Pet, PetResponse } from "@/types/schedule"
import { ServiceSelectorBar } from "@/components/schedule/service-selector-bar"
import { WeeklyCalendar } from "@/components/schedule/weekly-calendar"
import { CustomerForm } from "@/components/schedule/customer-form"
import { PetSelection } from "@/components/schedule/pet-selection"
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
  const [showPetSelection, setShowPetSelection] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ firstName: "", lastName: "", email: "" })
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)

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

  const handlePetsReceived = (customerInfo: CustomerInfo, petResponse: PetResponse) => {
    setCustomerInfo(customerInfo)
    setPets(petResponse.pets || [])
    setShowCustomerForm(false)
    setShowPetSelection(true)
  }

  const handlePetSelect = async (pet: Pet) => {
    setSelectedPet(pet)

    // Create the final booking
    try {
      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook-test/5671c1dd-48f6-47a9-85ac-4e20cf261520"

      const bookingData = {
        professional_id: professionalId,
        action: "create_booking",
        session_id: sessionIdRef.current,
        timestamp: new Date().toISOString(),
        booking_details: {
          service_name: selectedService!.name,
          service_description: selectedService!.description,
          service_duration: selectedService!.duration_number,
          service_duration_unit: selectedService!.duration_unit,
          service_cost: selectedService!.customer_cost,
          service_currency: selectedService!.customer_cost_currency,
          date: selectedTimeSlot!.date,
          start_time: selectedTimeSlot!.startTime,
          end_time: selectedTimeSlot!.endTime,
          day_of_week: selectedTimeSlot!.dayOfWeek,
        },
        customer_info: {
          first_name: customerInfo.firstName.trim(),
          last_name: customerInfo.lastName.trim(),
          email: customerInfo.email.trim().toLowerCase(),
        },
        pet_info: {
          pet_id: pet.pet_id,
          pet_name: pet.pet_name,
          pet_type: pet.pet_type,
          breed: pet.breed,
          age: pet.age,
          weight: pet.weight,
          special_notes: pet.special_notes,
        },
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Booking created:", result)

      setShowPetSelection(false)
      setShowConfirmation(true)
    } catch (err) {
      console.error("Error creating booking:", err)
      setError("Failed to create booking. Please try again.")
    }
  }

  const handleBackToCustomerForm = () => {
    setShowPetSelection(false)
    setShowCustomerForm(true)
  }

  const handleBackToSchedule = () => {
    setShowCustomerForm(false)
    setSelectedTimeSlot(null)
  }

  const handleNewBooking = () => {
    setSelectedService(null)
    setSelectedTimeSlot(null)
    setShowCustomerForm(false)
    setShowPetSelection(false)
    setShowConfirmation(false)
    setCustomerInfo({ firstName: "", lastName: "", email: "" })
    setPets([])
    setSelectedPet(null)
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
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
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
            selectedPet={selectedPet!}
            professionalName={webhookData.professional_info.professional_name}
            onNewBooking={handleNewBooking}
          />
        ) : showPetSelection ? (
          <PetSelection
            pets={pets}
            customerInfo={customerInfo}
            selectedService={selectedService!}
            selectedTimeSlot={selectedTimeSlot!}
            professionalName={webhookData.professional_info.professional_name}
            onPetSelect={handlePetSelect}
            onBack={handleBackToCustomerForm}
          />
        ) : showCustomerForm && selectedService && selectedTimeSlot ? (
          <CustomerForm
            selectedService={selectedService}
            selectedTimeSlot={selectedTimeSlot}
            professionalId={professionalId}
            professionalName={webhookData.professional_info.professional_name}
            sessionId={sessionIdRef.current!}
            onPetsReceived={handlePetsReceived}
            onBack={handleBackToSchedule}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Service Selection Bar */}
            <div className="mb-8">
              <ServiceSelectorBar
                servicesByCategory={webhookData.services.services_by_category}
                selectedService={selectedService}
                onServiceSelect={handleServiceSelect}
              />
            </div>

            {/* Full-width Calendar */}
            <WeeklyCalendar
              workingDays={webhookData.schedule.working_days}
              bookingData={webhookData.bookings.all_booking_data}
              selectedService={selectedService}
              onTimeSlotSelect={handleTimeSlotSelect}
              selectedTimeSlot={selectedTimeSlot}
            />
          </div>
        )}
      </div>
    </div>
  )
}

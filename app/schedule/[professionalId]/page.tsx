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
  const userTimezoneRef = useRef<string | null>(null)

  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [showPetSelection, setShowPetSelection] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [creatingBooking, setCreatingBooking] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ firstName: "", lastName: "", email: "" })
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)

  // Generate a unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Detect user's timezone
  const detectUserTimezone = () => {
    try {
      // Get the user's timezone using Intl API
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      // Also get timezone offset for additional context
      const now = new Date()
      const offsetMinutes = now.getTimezoneOffset()
      const offsetHours = Math.abs(offsetMinutes / 60)
      const offsetSign = offsetMinutes <= 0 ? "+" : "-"
      const offsetString = `UTC${offsetSign}${offsetHours.toString().padStart(2, "0")}:${Math.abs(offsetMinutes % 60)
        .toString()
        .padStart(2, "0")}`

      return {
        timezone: timezone,
        offset: offsetString,
        offsetMinutes: offsetMinutes,
        timestamp: now.toISOString(),
        localTime: now.toLocaleString(),
      }
    } catch (error) {
      console.error("Error detecting timezone:", error)
      return {
        timezone: "UTC",
        offset: "UTC+00:00",
        offsetMinutes: 0,
        timestamp: new Date().toISOString(),
        localTime: new Date().toLocaleString(),
      }
    }
  }

  // Helper function to convert local time to UTC
  const convertLocalTimeToUTC = (dateStr: string, timeStr: string, userTimezone: string) => {
    try {
      // Parse the time string (e.g., "12:00 PM")
      const [time, period] = timeStr.split(" ")
      const [hours, minutes] = time.split(":").map(Number)

      // Convert to 24-hour format
      let hour24 = hours
      if (period === "PM" && hours !== 12) {
        hour24 = hours + 12
      } else if (period === "AM" && hours === 12) {
        hour24 = 0
      }

      // Create a date object in the user's timezone
      // We need to be careful here - the date string is in YYYY-MM-DD format
      const [year, month, day] = dateStr.split("-").map(Number)

      // Create date in user's local timezone
      const localDate = new Date()
      localDate.setFullYear(year, month - 1, day) // month is 0-indexed
      localDate.setHours(hour24, minutes, 0, 0)

      // Convert to UTC by getting the ISO string
      return localDate.toISOString()
    } catch (error) {
      console.error("Error converting time to UTC:", error)
      // Fallback: create basic UTC time
      const [time, period] = timeStr.split(" ")
      const [hours, minutes] = time.split(":").map(Number)
      let hour24 = hours
      if (period === "PM" && hours !== 12) {
        hour24 = hours + 12
      } else if (period === "AM" && hours === 12) {
        hour24 = 0
      }

      const date = new Date(dateStr)
      date.setUTCHours(hour24, minutes, 0, 0)
      return date.toISOString()
    }
  }

  // Helper function to calculate end datetime in UTC
  const calculateEndDateTimeUTC = (startDateTimeUTC: string, durationNumber: number, durationUnit: string) => {
    const startDate = new Date(startDateTimeUTC)
    let durationInMinutes = durationNumber

    if (durationUnit === "Hours") {
      durationInMinutes = durationNumber * 60
    } else if (durationUnit === "Days") {
      durationInMinutes = durationNumber * 24 * 60
    }

    const endDate = new Date(startDate.getTime() + durationInMinutes * 60 * 1000)
    return endDate.toISOString()
  }

  // Initialize or re-initialize schedule data
  const initializeSchedule = async () => {
    try {
      setLoading(true)
      setError(null)

      // Generate NEW session ID for each initialization
      sessionIdRef.current = generateSessionId()

      // Detect user's timezone (refresh in case it changed)
      userTimezoneRef.current = JSON.stringify(detectUserTimezone())

      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook-test/5671c1dd-48f6-47a9-85ac-4e20cf261520"

      console.log("Initializing schedule with session:", sessionIdRef.current)

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
          user_timezone: JSON.parse(userTimezoneRef.current),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      // The response is an array, so we take the first element
      setWebhookData(data[0])
      console.log("Schedule data refreshed:", data[0])
    } catch (err) {
      console.error("Error initializing schedule:", err)
      setError("Failed to load scheduling data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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
    setCreatingBooking(true) // Start loading state

    // Create the final booking
    try {
      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook-test/5671c1dd-48f6-47a9-85ac-4e20cf261520"

      const userTimezoneData = JSON.parse(userTimezoneRef.current!)

      // Convert local times to UTC
      const startDateTimeUTC = convertLocalTimeToUTC(
        selectedTimeSlot!.date,
        selectedTimeSlot!.startTime,
        userTimezoneData.timezone,
      )

      const endDateTimeUTC = calculateEndDateTimeUTC(
        startDateTimeUTC,
        selectedService!.duration_number,
        selectedService!.duration_unit,
      )

      // Also calculate what the end time would be in local time for display
      const endTimeLocal = new Date(endDateTimeUTC).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: userTimezoneData.timezone,
      })

      const bookingData = {
        professional_id: professionalId,
        action: "create_booking",
        session_id: sessionIdRef.current,
        timestamp: new Date().toISOString(),
        user_timezone: userTimezoneData,
        booking_details: {
          service_name: selectedService!.name,
          service_description: selectedService!.description,
          service_duration: selectedService!.duration_number,
          service_duration_unit: selectedService!.duration_unit,
          service_cost: selectedService!.customer_cost,
          service_currency: selectedService!.customer_cost_currency,

          // UTC times for backend processing
          start_utc: startDateTimeUTC,
          end_utc: endDateTimeUTC,

          // Local times for display/reference
          date_local: selectedTimeSlot!.date,
          start_time_local: selectedTimeSlot!.startTime,
          end_time_local: endTimeLocal,
          day_of_week: selectedTimeSlot!.dayOfWeek,

          // Timezone context
          timezone: userTimezoneData.timezone,
          timezone_offset: userTimezoneData.offset,
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

      console.log("Sending booking data with UTC times:", bookingData)

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

      // Check if booking was successful
      if (result && result[0] && result[0].Output === "Booking Successfully Created") {
        setShowPetSelection(false)
        setCreatingBooking(false) // End loading state
        setShowConfirmation(true)
      } else {
        throw new Error("Booking creation failed")
      }
    } catch (err) {
      console.error("Error creating booking:", err)
      setCreatingBooking(false) // End loading state on error
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

  const handleNewBooking = async () => {
    // Reset all state
    setSelectedService(null)
    setSelectedTimeSlot(null)
    setShowCustomerForm(false)
    setShowPetSelection(false)
    setShowConfirmation(false)
    setCreatingBooking(false)
    setCustomerInfo({ firstName: "", lastName: "", email: "" })
    setPets([])
    setSelectedPet(null)

    // Re-initialize schedule data to get updated availability
    console.log("Starting new booking - refreshing schedule data...")
    await initializeSchedule()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#E75837]" />
          <p className="text-gray-600 body-font">
            {showConfirmation ? "Refreshing schedule..." : "Loading scheduling information..."}
          </p>
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
              onClick={() => initializeSchedule()}
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

  // Show booking creation loading screen
  if (creatingBooking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h1 className="text-3xl font-bold text-[#E75837] mb-2 header-font">
              Book with {webhookData.professional_info.professional_name}
            </h1>
            <p className="text-gray-600 body-font">Creating your booking...</p>
          </div>

          {/* Loading Card */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6 text-[#E75837]" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 header-font">Creating Your Booking</h2>
              <p className="text-gray-600 body-font mb-6">
                Please wait while we confirm your appointment with {webhookData.professional_info.professional_name}.
              </p>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 body-font">Service:</span>
                    <span className="font-medium body-font">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 body-font">Date:</span>
                    <span className="font-medium body-font">
                      {selectedTimeSlot?.dayOfWeek},{" "}
                      {new Date(selectedTimeSlot?.date || "").toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 body-font">Time:</span>
                    <span className="font-medium body-font">{selectedTimeSlot?.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 body-font">Pet:</span>
                    <span className="font-medium body-font">
                      {selectedPet?.pet_name} ({selectedPet?.pet_type})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 body-font">Customer:</span>
                    <span className="font-medium body-font">
                      {customerInfo.firstName} {customerInfo.lastName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-sm text-gray-500 body-font">This should only take a few seconds...</div>
            </div>
          </div>
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

          {/* Debug: Show detected timezone */}
          {userTimezoneRef.current && (
            <div className="mt-2 text-xs text-gray-500 body-font">
              Timezone: {JSON.parse(userTimezoneRef.current).timezone} ({JSON.parse(userTimezoneRef.current).offset}) |
              Session: {sessionIdRef.current?.slice(-8)}
            </div>
          )}
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

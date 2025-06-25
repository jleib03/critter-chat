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
import { loadProfessionalConfig } from "@/utils/professional-config"
import type { ProfessionalConfig } from "@/types/professional-config"
import {
  BookingTypeSelection,
  type BookingType,
  type RecurringConfig,
} from "@/components/schedule/booking-type-selection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ParsedWebhookData {
  professional_info: {
    professional_id: string
    professional_name: string
  }
  schedule: {
    working_days: {
      day: string
      start: string
      end: string
      isWorking: boolean
    }[]
  }
  bookings: {
    all_booking_data: any[]
  }
  services: {
    services_by_category: { [category: string]: Service[] }
  }
  config: any
  booking_preferences: {
    business_name?: string
    booking_system?: string
    allow_direct_booking?: boolean
    require_approval?: boolean
    online_booking_enabled?: boolean
  } | null
}

export default function SchedulePage() {
  const params = useParams()
  const professionalId = params.professionalId as string

  const [webhookData, setWebhookData] = useState<WebhookResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
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
  const [professionalConfig, setProfessionalConfig] = useState<ProfessionalConfig | null>(null)

  const [showBookingTypeSelection, setShowBookingTypeSelection] = useState(false)
  const [bookingType, setBookingType] = useState<BookingType | null>(null)
  const [recurringConfig, setRecurringConfig] = useState<RecurringConfig | null>(null)

  const [bookingPreferences, setBookingPreferences] = useState<{
    business_name?: string
    booking_system?: string
    allow_direct_booking?: boolean
    require_approval?: boolean
    online_booking_enabled?: boolean
  } | null>(null)
  const [showBookingDisabledModal, setShowBookingDisabledModal] = useState(false)
  const [showBookingDisabled, setShowBookingDisabled] = useState(false) // New state variable

  // Generate a unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Detect user's timezone - simplified to avoid parsing issues
  const detectUserTimezone = () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const now = new Date()
      const offsetMinutes = now.getTimezoneOffset()
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60)
      const offsetMins = Math.abs(offsetMinutes) % 60
      const offsetSign = offsetMinutes <= 0 ? "+" : "-"

      const hoursStr = offsetHours.toString().padStart(2, "0")
      const minsStr = offsetMins.toString().padStart(2, "0")
      const offsetString = `UTC${offsetSign}${hoursStr}:${minsStr}`

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

  // Load professional configuration
  const loadProfessionalConfiguration = () => {
    try {
      const config = loadProfessionalConfig(professionalId)
      setProfessionalConfig(config)
      console.log("Professional configuration loaded:", config)
    } catch (error) {
      console.error("Error loading professional configuration:", error)
    }
  }

  // Helper function to convert local time to UTC
  const convertLocalTimeToUTC = (dateStr: string, timeStr: string, userTimezone: string) => {
    try {
      const [time, period] = timeStr.split(" ")
      const [hours, minutes] = time.split(":").map(Number)

      let hour24 = hours
      if (period === "PM" && hours !== 12) {
        hour24 = hours + 12
      } else if (period === "AM" && hours === 12) {
        hour24 = 0
      }

      // Fix: Parse date string properly to avoid timezone shifts
      const [year, month, day] = dateStr.split("-").map(Number)

      // Create date in user's local timezone
      const localDate = new Date(year, month - 1, day, hour24, minutes, 0, 0)

      return localDate.toISOString()
    } catch (error) {
      console.error("Error converting time to UTC:", error)

      // Fallback logic
      const [time, period] = timeStr.split(" ")
      const [hours, minutes] = time.split(":").map(Number)
      let hour24 = hours
      if (period === "PM" && hours !== 12) {
        hour24 = hours + 12
      } else if (period === "AM" && hours === 12) {
        hour24 = 0
      }

      // Fix: Use proper date parsing
      const [year, month, day] = dateStr.split("-").map(Number)
      const date = new Date(year, month - 1, day, hour24, minutes, 0, 0)
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

  // Update the initializeSchedule function to parse the new webhook format
  const initializeSchedule = async () => {
    try {
      setLoading(true)
      setError(null)

      sessionIdRef.current = generateSessionId()
      userTimezoneRef.current = JSON.stringify(detectUserTimezone())
      loadProfessionalConfiguration()

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

      const rawData = await response.json()
      console.log("Raw webhook data:", rawData)

      // Parse the new webhook format
      const parsedData = parseWebhookData(rawData)
      setWebhookData(parsedData)

      // Set booking preferences from parsed data
      if (parsedData.booking_preferences) {
        setBookingPreferences(parsedData.booking_preferences)

        // Check if online booking is disabled
        if (parsedData.booking_preferences.online_booking_enabled === false) {
          console.log("Online booking is disabled - setting showBookingDisabled to true")
          setShowBookingDisabled(true)
        } else {
          setShowBookingDisabled(false)
        }
      } else {
        console.log("No booking preferences found")
        setShowBookingDisabled(false)
      }

      // If professional config is available in webhook, use it
      if (parsedData.config) {
        const configForProfessionalConfig = {
          professionalId: professionalId,
          businessName: parsedData.config.business_name,
          employees: parsedData.config.employees.map((emp) => ({
            id: emp.employee_id,
            name: emp.name,
            role: emp.role,
            email: emp.email,
            isActive: emp.is_active,
            workingDays: emp.working_days.map((wd) => ({
              day: wd.day,
              start: wd.start_time,
              end: wd.end_time,
              isWorking: wd.is_working,
            })),
            services: emp.services,
          })),
          capacityRules: {
            maxConcurrentBookings: parsedData.config.capacity_rules.max_concurrent_bookings,
            bufferTimeBetweenBookings: parsedData.config.capacity_rules.buffer_time_between_bookings,
            maxBookingsPerDay: parsedData.config.capacity_rules.max_bookingsPerDay,
            allowOverlapping: parsedData.config.capacity_rules.allowOverlapping,
            requireAllEmployeesForService: parsedData.config.capacity_rules.requireAllEmployeesForService,
          },
          blockedTimes: parsedData.config.blocked_times,
          lastUpdated: new Date().toISOString(),
        }
        setProfessionalConfig(configForProfessionalConfig)
        console.log("Professional configuration loaded from webhook:", configForProfessionalConfig)
      }

      console.log("Schedule data loaded:", parsedData)
    } catch (err) {
      console.error("Error initializing schedule:", err)
      setError("Failed to load scheduling data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Add the parseWebhookData function
  const parseWebhookData = (rawData: any[]): ParsedWebhookData => {
    // Find the first entry with working hours (schedule data)
    const scheduleEntry = rawData.find((entry) => entry.monday_start)

    // Find all booking entries
    const bookingEntries = rawData.filter(
      (entry) => entry.booking_date_formatted && !entry.name && !entry.webhook_response,
    )

    // Find all service entries
    const serviceEntries = rawData.filter((entry) => entry.name && entry.duration_unit)

    // Find webhook response with config
    const configEntry = rawData.find((entry) => entry.webhook_response?.success)

    // Parse working days from schedule entry
    const workingDays = scheduleEntry
      ? [
          {
            day: "Monday",
            start: scheduleEntry.monday_start,
            end: scheduleEntry.monday_end,
            isWorking: !!scheduleEntry.monday_working,
          },
          {
            day: "Tuesday",
            start: scheduleEntry.tuesday_start,
            end: scheduleEntry.tuesday_end,
            isWorking: !!scheduleEntry.tuesday_working,
          },
          {
            day: "Wednesday",
            start: scheduleEntry.wednesday_start,
            end: scheduleEntry.wednesday_end,
            isWorking: !!scheduleEntry.wednesday_working,
          },
          {
            day: "Thursday",
            start: scheduleEntry.thursday_start,
            end: scheduleEntry.thursday_end,
            isWorking: !!scheduleEntry.thursday_working,
          },
          {
            day: "Friday",
            start: scheduleEntry.friday_start,
            end: scheduleEntry.friday_end,
            isWorking: !!scheduleEntry.friday_working,
          },
          {
            day: "Saturday",
            start: scheduleEntry.saturday_start,
            end: scheduleEntry.saturday_end,
            isWorking: !!scheduleEntry.saturday_working,
          },
          {
            day: "Sunday",
            start: scheduleEntry.sunday_start,
            end: scheduleEntry.sunday_end,
            isWorking: !!scheduleEntry.sunday_working,
          },
        ]
      : []

    // Parse services and group by category
    const servicesByCategory: { [category: string]: Service[] } = {}
    serviceEntries.forEach((service) => {
      const category = getCategoryFromService(service.name)
      if (!servicesByCategory[category]) {
        servicesByCategory[category] = []
      }
      servicesByCategory[category].push({
        name: service.name,
        description: service.description || "",
        duration_unit: service.duration_unit,
        duration_number: service.duration_number,
        customer_cost: service.customer_cost,
        customer_cost_currency: service.customer_cost_currency,
      })
    })

    // Add this after parsing other data - REPLACE the existing booking preferences parsing
    let bookingPrefs = rawData.find(
      (entry) =>
        entry.booking_system !== undefined ||
        entry.online_booking_enabled !== undefined ||
        entry.allow_direct_booking !== undefined,
    )

    // If bookingPrefs is undefined, try to find it in the webhook_response
    if (!bookingPrefs && configEntry?.webhook_response?.config_data) {
      bookingPrefs = configEntry.webhook_response.config_data
    }

    return {
      professional_info: {
        professional_id: scheduleEntry?.professional_id || professionalId,
        professional_name: bookingEntries[0]?.professional_name || "Professional",
      },
      schedule: {
        working_days: workingDays,
      },
      bookings: {
        all_booking_data: bookingEntries,
      },
      services: {
        services_by_category: servicesByCategory,
      },
      config: configEntry?.webhook_response?.config_data,
      booking_preferences: bookingPrefs
        ? {
            business_name: bookingPrefs.business_name,
            booking_system: bookingPrefs.booking_system,
            allow_direct_booking: bookingPrefs.allow_direct_booking,
            require_approval: bookingPrefs.require_approval,
            online_booking_enabled: bookingPrefs.online_booking_enabled,
          }
        : null,
    }
  }

  // Helper function to categorize services
  const getCategoryFromService = (serviceName: string): string => {
    if (serviceName.toLowerCase().includes("boarding")) return "Boarding"
    if (serviceName.toLowerCase().includes("groom")) return "Grooming"
    if (serviceName.toLowerCase().includes("add on") || serviceName.toLowerCase().includes("addon")) return "Add-Ons"
    return "Services"
  }

  useEffect(() => {
    if (professionalId) {
      initializeSchedule()
    }
  }, [professionalId])

  const handleServiceSelect = (service: Service) => {
    console.log("handleServiceSelect called with:", service.name)
    setSelectedTimeSlot(null)

    setSelectedServices((prevServices) => {
      console.log("Previous services:", prevServices)
      const isAlreadySelected = prevServices.find((s) => s.name === service.name)

      if (isAlreadySelected) {
        console.log("Removing service:", service.name)
        const newServices = prevServices.filter((s) => s.name !== service.name)
        console.log("New services after removal:", newServices)
        return newServices
      } else {
        console.log("Adding service:", service.name)
        const newServices = [...prevServices, service]
        console.log("New services after addition:", newServices)
        return newServices
      }
    })
  }

  const handleBookingTypeSelect = (type: BookingType, config?: RecurringConfig) => {
    setBookingType(type)
    setRecurringConfig(config || null)
    setShowBookingTypeSelection(false)
  }

  const handleBackToBookingType = () => {
    setShowBookingTypeSelection(true)
    setSelectedTimeSlot(null)
  }

  const handleBackToServices = () => {
    setSelectedServices([])
    setShowBookingTypeSelection(false)
    setBookingType(null)
    setRecurringConfig(null)
  }

  const handleTimeSlotSelect = (slot: SelectedTimeSlot) => {
    if (selectedServices.length === 0) {
      alert("Please select at least one service before selecting a time slot.")
      return
    }

    console.log("Current booking preferences:", bookingPreferences)
    console.log("Online booking enabled:", bookingPreferences?.online_booking_enabled)

    // Check if online booking is disabled
    if (bookingPreferences && bookingPreferences.online_booking_enabled === false) {
      console.log("Online booking is disabled - showing modal")
      setShowBookingDisabledModal(true)
      return
    }

    console.log("Proceeding with booking flow")
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
    setCreatingBooking(true)

    try {
      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook-test/5671c1dd-48f6-47a9-85ac-4e20cf261520"
      const userTimezoneData = JSON.parse(userTimezoneRef.current!)

      const startDateTimeUTC = convertLocalTimeToUTC(
        selectedTimeSlot!.date,
        selectedTimeSlot!.startTime,
        userTimezoneData.timezone,
      )

      // Calculate total duration and cost for all selected services
      let totalDurationMinutes = 0
      let totalCost = 0

      selectedServices.forEach((service) => {
        let durationInMinutes = service.duration_number

        if (service.duration_unit === "Hours") {
          durationInMinutes = service.duration_number * 60
        } else if (service.duration_unit === "Days") {
          durationInMinutes = service.duration_number * 24 * 60
        }

        totalDurationMinutes += durationInMinutes
        totalCost += service.customer_cost
      })

      const endDateTimeUTC = calculateEndDateTimeUTC(startDateTimeUTC, totalDurationMinutes, "Minutes")

      const endTimeLocal = new Date(endDateTimeUTC).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: userTimezoneData.timezone,
      })

      const determineBookingType = () => {
        if (bookingPreferences?.allow_direct_booking === true) {
          return "direct"
        } else if (
          bookingPreferences?.allow_direct_booking === false &&
          bookingPreferences?.require_approval === true
        ) {
          return "request"
        }
        return "direct" // default fallback
      }

      const bookingData = {
        professional_id: professionalId,
        action: "create_booking",
        session_id: sessionIdRef.current,
        timestamp: new Date().toISOString(),
        user_timezone: userTimezoneData,

        // Add booking_system from professional's preferences
        booking_system: bookingPreferences?.booking_system || "direct_booking",

        // Keep booking_type for the system's booking behavior (direct vs request)
        booking_type: determineBookingType(),

        // Add user's booking choice (one-time vs recurring)
        user_booking_type: bookingType, // "one-time" or "recurring"

        ...(bookingType === "recurring" &&
          recurringConfig && {
            recurring_details: {
              frequency: recurringConfig.frequency,
              unit: recurringConfig.unit,
              end_date: recurringConfig.endDate,
            },
          }),
        booking_details: {
          service_names: selectedServices.map((service) => service.name),
          service_descriptions: selectedServices.map((service) => service.description),
          service_durations: selectedServices.map((service) => service.duration_number),
          service_duration_units: selectedServices.map((service) => service.duration_unit),
          service_costs: selectedServices.map((service) => service.customer_cost),
          service_currencies: selectedServices.map((service) => service.customer_cost_currency),

          total_duration_minutes: totalDurationMinutes,
          total_cost: totalCost,

          start_utc: startDateTimeUTC,
          end_utc: endDateTimeUTC,

          date_local: selectedTimeSlot!.date,
          start_time_local: selectedTimeSlot!.startTime,
          end_time_local: endTimeLocal,
          day_of_week: selectedTimeSlot!.dayOfWeek,

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

      if (result && result[0] && result[0].output === "Booking Successfully Created") {
        setShowPetSelection(false)
        setCreatingBooking(false)
        setShowConfirmation(true)
      } else {
        throw new Error("Booking creation failed")
      }
    } catch (err) {
      console.error("Error creating booking:", err)
      setCreatingBooking(false)
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
    setSelectedServices([])
    setSelectedTimeSlot(null)
    setShowCustomerForm(false)
    setShowPetSelection(false)
    setShowConfirmation(false)
    setCreatingBooking(false)
    setCustomerInfo({ firstName: "", lastName: "", email: "" })
    setPets([])
    setSelectedPet(null)
    setShowBookingTypeSelection(false)
    setBookingType(null)
    setRecurringConfig(null)

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

  if (creatingBooking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h1 className="text-3xl font-bold text-[#E75837] mb-2 header-font">
              Book with {webhookData.professional_info.professional_name}
            </h1>
            <p className="text-gray-600 body-font">Creating your booking...</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6 text-[#E75837]" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 header-font">Creating Your Booking</h2>
              <p className="text-gray-600 body-font mb-6">
                Please wait while we confirm your appointment with {webhookData.professional_info.professional_name}.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 body-font">Services:</span>
                    <span className="font-medium body-font">{selectedServices.map((s) => s.name).join(", ")}</span>
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
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-[#E75837] mb-2 header-font">
                Book with {webhookData.professional_info.professional_name}
              </h1>
              <p className="text-gray-600 body-font">
                Select a service and available time slot to book your appointment.
              </p>

              <div className="mt-3 flex items-center gap-4 text-sm">
                {professionalConfig ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="body-font">
                      Team configured ({professionalConfig.employees.filter((e) => e.isActive).length} active staff)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="body-font">Using default availability</span>
                  </div>
                )}

                {userTimezoneRef.current && (
                  <div className="text-xs text-gray-500 body-font">
                    Timezone: {JSON.parse(userTimezoneRef.current).timezone} (
                    {JSON.parse(userTimezoneRef.current).offset}) | Session: {sessionIdRef.current?.slice(-8)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showBookingDisabled ? (
          // Render this if online booking is disabled
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Online Booking Not Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="pb-4">
                {webhookData?.professional_info.professional_name} has not enabled online booking. Please contact them
                directly to schedule an appointment.
              </p>
              <Button onClick={() => window.open("https://critter.app", "_blank")}>Contact via Critter App</Button>
            </CardContent>
          </Card>
        ) : showConfirmation ? (
          <BookingConfirmation
            selectedService={selectedServices[0]!}
            selectedTimeSlot={selectedTimeSlot!}
            customerInfo={customerInfo}
            selectedPet={selectedPet!}
            professionalName={webhookData.professional_info.professional_name}
            onNewBooking={handleNewBooking}
            bookingType={bookingType}
            recurringConfig={recurringConfig}
            selectedServices={selectedServices}
          />
        ) : showPetSelection ? (
          <PetSelection
            pets={pets}
            customerInfo={customerInfo}
            selectedServices={selectedServices}
            selectedTimeSlot={selectedTimeSlot!}
            professionalName={webhookData.professional_info.professional_name}
            onPetSelect={handlePetSelect}
            onBack={handleBackToCustomerForm}
          />
        ) : showCustomerForm && selectedServices.length > 0 && selectedTimeSlot ? (
          <CustomerForm
            selectedServices={selectedServices}
            selectedTimeSlot={selectedTimeSlot}
            professionalId={professionalId}
            professionalName={webhookData.professional_info.professional_name}
            sessionId={sessionIdRef.current!}
            onPetsReceived={handlePetsReceived}
            onBack={handleBackToSchedule}
            bookingType={bookingType}
            recurringConfig={recurringConfig}
          />
        ) : selectedServices.length > 0 && bookingType && !showBookingTypeSelection ? (
          // Only show calendar after booking type is selected
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-8">
              <ServiceSelectorBar
                servicesByCategory={webhookData.services.services_by_category}
                selectedServices={selectedServices}
                onServiceSelect={handleServiceSelect}
                onContinue={() => setShowBookingTypeSelection(true)}
              />
            </div>

            <WeeklyCalendar
              workingDays={webhookData.schedule.working_days}
              bookingData={webhookData.bookings.all_booking_data}
              selectedServices={selectedServices}
              onTimeSlotSelect={handleTimeSlotSelect}
              selectedTimeSlot={selectedTimeSlot}
              professionalId={professionalId}
              professionalConfig={professionalConfig}
              bookingType={bookingType}
              recurringConfig={recurringConfig}
            />
          </div>
        ) : showBookingTypeSelection && selectedServices.length > 0 ? (
          <BookingTypeSelection
            selectedService={selectedServices[0]}
            onBookingTypeSelect={handleBookingTypeSelect}
            onBack={handleBackToServices}
          />
        ) : (
          // Initial service selection - no calendar
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <ServiceSelectorBar
              servicesByCategory={webhookData.services.services_by_category}
              selectedServices={selectedServices}
              onServiceSelect={handleServiceSelect}
              onContinue={() => setShowBookingTypeSelection(true)}
            />
          </div>
        )}
        {/* Booking Disabled Modal */}
        {showBookingDisabledModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                  <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 header-font">Online Booking Not Available</h3>
                <p className="text-sm text-gray-500 mb-6 body-font">
                  {webhookData?.professional_info.professional_name} has not enrolled in online booking. Please contact
                  them directly through the Critter app to schedule your appointment.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBookingDisabledModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors body-font"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Open Critter app or redirect to contact page
                      window.open("https://critter.app", "_blank")
                      setShowBookingDisabledModal(false)
                    }}
                    className="flex-1 bg-[#E75837] hover:bg-[#d14a2e] text-white font-medium py-2 px-4 rounded-lg transition-colors body-font"
                  >
                    Open Critter App
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

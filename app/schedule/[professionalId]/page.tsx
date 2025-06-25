"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import type { WebhookResponse, Service, SelectedTimeSlot, CustomerInfo, Pet } from "@/types/schedule"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
}

export default function SchedulePage() {
  const params = useParams()
  const router = useRouter()
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
    booking_type?: string
    allow_direct_booking?: boolean
    require_approval?: boolean
    online_booking_enabled?: boolean
  } | null>(null)
  const [showBookingDisabledModal, setShowBookingDisabledModal] = useState(false)

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

      const [year, month, day] = dateStr.split("-").map(Number)
      const localDate = new Date()
      localDate.setFullYear(year, month - 1, day)
      localDate.setHours(hour24, minutes, 0, 0)

      return localDate.toISOString()
    } catch (error) {
      console.error("Error converting time to UTC:", error)
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
        entry.booking_type !== undefined ||
        entry.online_booking_enabled !== undefined ||
        entry.allow_direct_booking !== undefined,
    )

    // If bookingPrefs is undefined, try to find it in the webhook_response
    if (!bookingPrefs) {
      bookingPrefs = rawData.find(
        (entry) =>
          entry.booking_type !== undefined ||
          entry.online_booking_enabled !== undefined ||
          entry.allow_direct_booking !== undefined,
      )
    }

    if (bookingPrefs) {
      console.log("Found booking preferences:", bookingPrefs)
      setBookingPreferences({
        business_name: bookingPrefs.business_name,
        booking_type: bookingPrefs.booking_type,
        allow_direct_booking: bookingPrefs.allow_direct_booking,
        require_approval: bookingPrefs.require_approval,
        online_booking_enabled: bookingPrefs.online_booking_enabled,
      })
    } else {
      console.log("No booking preferences found in webhook data")
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

  return (
    <div>
      {loading && <Loader2 />}
      {error && <div>{error}</div>}
      {/* Render components based on state */}
      <ServiceSelectorBar selectedServices={selectedServices} onServiceSelect={handleServiceSelect} />
      <WeeklyCalendar webhookData={webhookData} selectedTimeSlot={selectedTimeSlot} />
      {showCustomerForm && <CustomerForm customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} />}
      {showPetSelection && <PetSelection pets={pets} selectedPet={selectedPet} setSelectedPet={setSelectedPet} />}
      {showConfirmation && <BookingConfirmation />}
      {showBookingTypeSelection && <BookingTypeSelection />}
      {showBookingDisabledModal && (
        <Dialog open={showBookingDisabledModal} onOpenChange={setShowBookingDisabledModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Booking Disabled</DialogTitle>
              <DialogDescription>
                Booking is currently disabled for this professional. Please try again later.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => setShowBookingDisabledModal(false)}>Close</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useParams } from "next/navigation"
import { Loader2, Clock, Calendar } from 'lucide-react'
import type { Service, SelectedTimeSlot, CustomerInfo, Pet, PetResponse, ParsedWebhookData, BookingData, ProfessionalInfo } from "@/types/schedule"
import { ServiceSelectorBar } from "@/components/schedule/service-selector-bar"
import { WeeklyCalendar } from "@/components/schedule/weekly-calendar"
import { CustomerForm } from "@/components/schedule/customer-form"
import { PetSelection } from "@/components/schedule/pet-selection"
import { BookingConfirmation } from "@/components/schedule/booking-confirmation"
import { loadProfessionalConfig, saveProfessionalConfig } from "@/utils/professional-config"
import type { ProfessionalConfig } from "@/types/professional-config"
import { getWebhookEndpoint, logWebhookUsage } from "@/types/webhook-endpoints"
import {
  BookingTypeSelection,
  type BookingType,
  type RecurringConfig,
} from "@/components/schedule/booking-type-selection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MultiDayBookingForm } from "@/components/schedule/multi-day-booking-form"
import { calculateMultiDayAvailability } from "@/utils/professional-config"
import { ServiceSelection } from "@/components/schedule/service-selection"
import { DateTimePanel } from "@/components/date-time-panel"
import Header from "@/components/header"

type ScheduleStep = "service" | "bookingType" | "dateTime" | "multiDay" | "customerForm" | "petSelection" | "confirmation"
type NotificationPreference = "1_hour" | "1_day" | "1_week"

interface BookingDetails {
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot | null
  customerInfo: CustomerInfo | null
  selectedPets: Pet[]
  bookingId: string | null
  isDirectBooking: boolean
  notificationPreferences: NotificationPreference[]
  bookingType: BookingType | null
  recurringConfig: RecurringConfig | null
  multiDayTimeSlot: { start: Date; end: Date } | null
}

export default function SchedulePage() {
  const params = useParams()
  const uniqueUrl = params.uniqueUrl as string

  const [currentStep, setCurrentStep] = useState<ScheduleStep>("service")
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo | null>(null)
  const [professionalConfig, setProfessionalConfig] = useState<ProfessionalConfig | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [existingBookings, setExistingBookings] = useState<BookingData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState("")

  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    selectedServices: [],
    selectedTimeSlot: null,
    customerInfo: null,
    selectedPets: [],
    bookingId: null,
    isDirectBooking: false,
    notificationPreferences: ["1_day"],
    bookingType: null,
    recurringConfig: null,
    multiDayTimeSlot: null,
  })

  const [webhookData, setWebhookData] = useState<ParsedWebhookData | null>(null)
  const [loading, setLoading] = useState(true)
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
  const [selectedPets, setSelectedPets] = useState<Pet[]>([])
  const [selectedNotifications, setSelectedNotifications] = useState<NotificationPreference[]>([])
  const [professionalId, setProfessionalId] = useState<string>("")

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
  const [showBookingDisabled, setShowBookingDisabled] = useState(false)
  const [showPrices, setShowPrices] = useState(true)

  const [showMultiDayForm, setShowMultiDayForm] = useState(false)
  const [multiDayTimeSlot, setMultiDayTimeSlot] = useState<{ start: Date; end: Date } | null>(null)

  // Helper function to determine if this is a direct booking
  const determineBookingType = () => {
    if (bookingPreferences?.allow_direct_booking === true) {
      return "direct"
    } else if (bookingPreferences?.allow_direct_booking === false && bookingPreferences?.require_approval === true) {
      return "request"
    }
    return "direct" // default fallback
  }

  const isDirectBooking = determineBookingType() === "direct"

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
      const config = loadProfessionalConfig(uniqueUrl)
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

  // Helper function to generate recurring dates based on config
  const generateRecurringDates = (startDate: string, config: RecurringConfig) => {
    const dates = []
    const start = new Date(startDate)
    const endDate = new Date(config.endDate)

    console.log("Generating recurring dates with config:", config)
    console.log("Start date:", startDate, "End date:", config.endDate)

    const currentDate = new Date(start)
    let occurrenceCount = 0

    while (currentDate <= endDate && occurrenceCount < config.totalAppointments) {
      dates.push({
        date: currentDate.toISOString().split("T")[0],
        day_of_week: currentDate.toLocaleDateString("en-US", { weekday: "long" }),
        occurrence_number: occurrenceCount + 1,
        formatted_date: currentDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      })

      // Calculate next occurrence based on frequency and unit
      if (config.unit === "day") {
        currentDate.setDate(currentDate.getDate() + config.frequency)
      } else if (config.unit === "week") {
        currentDate.setDate(currentDate.getDate() + config.frequency * 7)
      } else if (config.unit === "month") {
        currentDate.setMonth(currentDate.getMonth() + config.frequency)
      }

      occurrenceCount++
    }

    console.log("Generated recurring dates:", dates)
    return dates
  }

  // Helper function to parse working days from the main schedule entry
  const parseWorkingDaysFromSchedule = (schedule: any): any[] => {
    if (!schedule) return []
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    return days.map((day) => {
      const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1)
      const isWorking = !!schedule[`${day}_working`]
      const startTime = schedule[`${day}_start`]
      const endTime = schedule[`${day}_end`]

      return {
        day: capitalizedDay,
        start: startTime ? startTime.substring(0, 5) : "09:00",
        end: endTime ? endTime.substring(0, 5) : "17:00",
        isWorking: isWorking,
      }
    })
  }

  // Update the initializeSchedule function to parse the new webhook format
  const initializeScheduleOld = async () => {
    try {
      setLoading(true)
      setError(null)

      sessionIdRef.current = generateSessionId()
      userTimezoneRef.current = JSON.stringify(detectUserTimezone())
      loadProfessionalConfiguration()

      const webhookUrl = getWebhookEndpoint("PROFESSIONAL_CONFIG")
      logWebhookUsage("PROFESSIONAL_CONFIG", "initialize_schedule")

      console.log("Initializing schedule with session:", sessionIdRef.current)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "initialize_schedule",
          uniqueUrl: uniqueUrl,
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
      setShowPrices(parsedData.show_prices)

      // Store the professional ID from the response
      const pId = parsedData.professional_info?.professional_id
      if (pId) {
        setProfessionalId(pId)
      }

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

      // Create professional config from webhook data
      if (parsedData.config) {
        const configForProfessionalConfig: ProfessionalConfig = {
          professionalId: pId || uniqueUrl, // Use pId directly to avoid race condition
          businessName: parsedData.config.business_name || "Professional",
          employees: parsedData.config.employees
            ? parsedData.config.employees.map((emp: any) => ({
                id: emp.employee_id,
                name: emp.name,
                role: emp.role,
                email: emp.email || "",
                isActive: emp.is_active,
                workingDays: emp.working_days.map((wd: any) => ({
                  day: wd.day,
                  start: wd.start_time,
                  end: wd.end_time,
                  isWorking: wd.is_working,
                })),
                services: emp.services || [],
              }))
            : [],
          capacityRules: {
            maxConcurrentBookings: parsedData.config.capacity_rules?.max_concurrent_bookings || 1,
            bufferTimeBetweenBookings: parsedData.config.capacity_rules?.buffer_time_between_bookings || 0,
            maxBookingsPerDay: parsedData.config.capacity_rules?.max_bookings_per_day || 10,
            allowOverlapping: parsedData.config.capacity_rules?.allow_overlapping || false,
            requireAllEmployeesForService: parsedData.config.capacity_rules?.require_all_employees_for_service || false,
          },
          blockedTimes: parsedData.config.blocked_times
            ? parsedData.config.blocked_times.map((bt: any) => ({
                id: bt.blocked_time_id || `block_${Date.now()}_${Math.random()}`,
                date: bt.blocked_date || bt.date,
                startTime: bt.start_time,
                endTime: bt.end_time,
                reason: bt.reason || "Blocked",
                employeeId: bt.employee_id || undefined,
                isRecurring: bt.is_recurring || false,
                recurrencePattern: bt.recurrence_pattern || undefined,
                isAllDay: bt.is_all_day || (bt.start_time === "00:00:00" && bt.end_time === "23:59:00"),
              }))
            : [],
          lastUpdated: new Date().toISOString(),
        }

        console.log("Setting professional config with blocked times:", configForProfessionalConfig.blockedTimes)
        setProfessionalConfig(configForProfessionalConfig)
        saveProfessionalConfig(configForProfessionalConfig) // Persist the config to local storage
      }

      console.log("Schedule data loaded successfully")
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

    // A more robust way to identify booking entries
    const bookingEntries = rawData.filter(
      (entry) => entry.booking_id && entry.start, // Simplified filter
    )

    if (bookingEntries.length === 0) {
      console.warn(
        "⚠️ No valid booking entries with an ID and start time were found in the webhook data. The schedule may appear fully open even if bookings exist.",
      )
    }

    // Fallback for booking_date_formatted
    bookingEntries.forEach((booking) => {
      if (!booking.booking_date_formatted && booking.start) {
        try {
          // Create date in user's local timezone from UTC string
          const localDate = new Date(booking.start)
          const year = localDate.getFullYear()
          const month = String(localDate.getMonth() + 1).padStart(2, "0")
          const day = String(localDate.getDate()).padStart(2, "0")
          booking.booking_date_formatted = `${year}-${month}-${day}`
          console.log(
            `Fallback: Generated booking_date_formatted '${booking.booking_date_formatted}' for booking ${booking.booking_id}`,
          )
        } catch (e) {
          console.error(`Could not parse date for booking ${booking.booking_id}`, e)
        }
      }
    })

    // Find all service entries
    const serviceEntries = rawData.filter((entry) => entry.name && entry.duration_unit)

    // Parse services and group by category
    const servicesByCategory: { [category: string]: Service[] } = {}
    serviceEntries.forEach((service) => {
      const category = getCategoryFromService(service.name)
      if (!servicesByCategory[category]) {
        servicesByCategory[category] = []
      }
      servicesByCategory[category].push({
        service_id: service.service_id || `fallback_${service.name.replace(/\s+/g, "_").toLowerCase()}`,
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
    const configEntry = rawData.find((entry) => entry.webhook_response)
    if (!bookingPrefs && configEntry?.webhook_response?.config_data) {
      bookingPrefs = configEntry.webhook_response.config_data
    }

    const priceSettingEntry = rawData.find((entry) => entry.hasOwnProperty("show_prices"))
    const showPrices = priceSettingEntry ? priceSettingEntry.show_prices : true

    const workingDays = parseWorkingDaysFromSchedule(scheduleEntry)

    return {
      professional_info: {
        professional_id: scheduleEntry?.professional_id || uniqueUrl,
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
      show_prices: showPrices,
    }
  }

  // Helper function to categorize services
  const getCategoryFromService = (serviceName: string): string => {
    const lower = serviceName.toLowerCase()
    if (lower.includes("add on") || lower.includes("addon")) return "Add-Ons"
    if (lower.includes("groom")) return "Grooming"
    if (lower.includes("walk")) return "Walks"
    if (lower.includes("board")) return "Boarding"
    return "Other Services"
  }

  // Memoize professional config to prevent unnecessary re-renders
  const memoizedProfessionalConfig = useMemo(() => professionalConfig, [professionalConfig])

  const initializeSchedule = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    setSessionId(currentSessionId)
    console.log("Initializing schedule with session:", currentSessionId)

    try {
      const webhookUrl = getWebhookEndpoint("PROFESSIONAL_CONFIG")
      logWebhookUsage("PROFESSIONAL_CONFIG", "schedule_initialization")

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule_initialization",
          unique_url: uniqueUrl,
          session_id: currentSessionId,
        }),
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      console.log("Schedule initialization data:", data)

      const professionalData = data.find((d: any) => d.professional_info)?.professional_info
      const servicesData = data.find((d: any) => d.services)?.services || []
      const bookingsData = data.find((d: any) => d.bookings)?.bookings || []
      const configData = data.find((d: any) => d.config)?.config

      if (!professionalData) throw new Error("Professional information not found.")

      setProfessionalInfo(professionalData)
      setServices(servicesData)
      setExistingBookings(bookingsData)
      setProfessionalConfig(configData)

      setBookingDetails((prev) => ({
        ...prev,
        isDirectBooking: configData?.bookingPreferences?.booking_system === "direct_booking",
      }))
    } catch (err) {
      console.error("Error initializing schedule:", err)
      setError(err instanceof Error ? err.message : "Failed to load schedule data.")
    } finally {
      setIsLoading(false)
    }
  }, [uniqueUrl])

  useEffect(() => {
    initializeSchedule()
  }, [initializeSchedule])

  useEffect(() => {
    if (uniqueUrl) {
      console.log("useEffect - Initializing schedule for uniqueUrl:", uniqueUrl) // ADDED LOG
      //initializeSchedule()
    }
  }, [uniqueUrl])

  const handleServiceSelectOld = (service: Service) => {
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

  const handleServiceSelect = (selected: Service[]) => {
    setBookingDetails((prev) => ({ ...prev, selectedServices: selected }))
    const hasMultiDayService = selected.some(s => s.duration_unit.toLowerCase() === 'days')
    if (selected.length > 1 && hasMultiDayService) {
        setCurrentStep("multiDay")
    } else {
        setCurrentStep("bookingType")
    }
  }

  const handleContinueFromServices = () => {
    if (selectedServices.length === 0) return

    let totalDurationMinutes = 0
    selectedServices.forEach((service) => {
      let durationInMinutes = service.duration_number
      const unit = service.duration_unit.toLowerCase()
      if (unit.startsWith("hour")) {
        durationInMinutes = service.duration_number * 60
      } else if (unit.startsWith("day")) {
        durationInMinutes = service.duration_number * 24 * 60
      }
      totalDurationMinutes += durationInMinutes
    })

    const twelveHoursInMinutes = 12 * 60

    if (totalDurationMinutes > twelveHoursInMinutes) {
      handleBookingTypeSelect("multi-day")
    } else {
      setShowBookingTypeSelection(true)
    }
  }

  const handleBookingTypeSelectOld = (type: BookingType, config?: RecurringConfig) => {
    setBookingType(type)
    setShowBookingTypeSelection(false)
    if (type === "recurring") {
      setRecurringConfig(config || null)
    } else if (type === "multi-day") {
      setShowMultiDayForm(true)
    }
  }

  const handleBookingTypeSelect = (type: BookingType, config: RecurringConfig | null) => {
    setBookingDetails(prev => ({ ...prev, bookingType: type, recurringConfig: config }))
    const hasMultiDayService = bookingDetails.selectedServices.some(s => s.duration_unit.toLowerCase() === 'days')
    if (type === 'multi-day' || hasMultiDayService) {
        setCurrentStep("multiDay")
    } else {
        setCurrentStep("dateTime")
    }
  }

  const handleMultiDayAvailabilityCheck = async (start: Date, end: Date) => {
    if (!professionalConfig || !webhookData) {
      return { available: false, reason: "Configuration not loaded." }
    }
    return calculateMultiDayAvailability(
      professionalConfig,
      webhookData.bookings.all_booking_data,
      start,
      end,
      selectedServices[0], // Assuming one service for multi-day
    )
  }

  const handleMultiDayBookingConfirm = (start: Date, end: Date) => {
    // Create a synthetic "time slot" to fit into the existing flow
    const syntheticSlot: SelectedTimeSlot = {
      date: start.toISOString().split("T")[0],
      startTime: start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }),
      endTime: end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }),
      dayOfWeek: start.toLocaleDateString("en-US", { weekday: "long" }),
    }
    setMultiDayTimeSlot({ start, end })
    setSelectedTimeSlot(syntheticSlot)
    setShowMultiDayForm(false)
    setShowCustomerForm(true)
  }

  const handleBackFromMultiDay = () => {
    setShowMultiDayForm(false)
    setShowBookingTypeSelection(true)
  }

  const handleBackToServices = () => {
    setSelectedServices([])
    setShowBookingTypeSelection(false)
    setBookingType(null)
    setRecurringConfig(null)
  }

  const handleTimeSlotSelectOld = (slot: SelectedTimeSlot) => {
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

  const handleDateTimeSelect = (slot: SelectedTimeSlot) => {
    setBookingDetails((prev) => ({ ...prev, selectedTimeSlot: slot }))
    setCurrentStep("customerForm")
  }

  const handleMultiDaySelect = (start: Date, end: Date) => {
    setBookingDetails(prev => ({ ...prev, multiDayTimeSlot: { start, end } }))
    setCurrentStep("customerForm")
  }

  const handlePetsReceivedOld = (customerInfo: CustomerInfo, petResponse: PetResponse) => {
    setCustomerInfo(customerInfo)
    setPets(petResponse.pets || [])
    setShowCustomerForm(false)
    setShowPetSelection(true)
  }

  const handleCustomerInfoSubmit = (customer: CustomerInfo, petResponse: PetResponse) => {
    setBookingDetails((prev) => ({
      ...prev,
      customerInfo: customer,
      selectedPets: petResponse.pets,
    }))
    setCurrentStep("petSelection")
  }

  const handlePetSelectOld = async (pets: Pet[], notifications: NotificationPreference[]) => {
    setSelectedPets(pets)
    setSelectedNotifications(notifications)
    setCreatingBooking(true)

    try {
      const webhookUrl = getWebhookEndpoint("PROFESSIONAL_CONFIG")
      const userTimezoneData = JSON.parse(userTimezoneRef.current!)
      const isMultiDay = bookingType === "multi-day" && multiDayTimeSlot

      const startDateTimeUTC = isMultiDay
        ? multiDayTimeSlot.start.toISOString()
        : convertLocalTimeToUTC(selectedTimeSlot!.date, selectedTimeSlot!.startTime, userTimezoneData.timezone)

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
        totalCost += Number(service.customer_cost)
      })

      const endDateTimeUTC = isMultiDay
        ? multiDayTimeSlot.end.toISOString()
        : calculateEndDateTimeUTC(startDateTimeUTC, totalDurationMinutes, "Minutes")

      const endTimeLocal = new Date(endDateTimeUTC).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: userTimezoneData.timezone,
      })

      // Enhanced recurring details for webhook
      let enhancedRecurringDetails = null
      if (bookingType === "recurring" && recurringConfig) {
        const recurringDates = generateRecurringDates(selectedTimeSlot!.date, recurringConfig)

        enhancedRecurringDetails = {
          // Add the original user selections
          selected_days_of_week: recurringConfig.daysOfWeek || recurringConfig.selectedDays || [],
          selected_end_date: recurringConfig.endDate || recurringConfig.originalEndDate,
          recurring_start_date: selectedTimeSlot!.date,

          // Basic recurring config - use the actual recurringConfig values
          frequency: recurringConfig.frequency || 1,
          unit: recurringConfig.unit || "week",
          end_date: recurringConfig.endDate,
          total_appointments: recurringConfig.totalAppointments || recurringDates.length,

          // Enhanced details
          pattern_description: `Every ${recurringConfig.frequency || 1} ${recurringConfig.unit || "week"}${
            (recurringConfig.frequency || 1) > 1 ? "s" : ""
          }`,
          start_date: selectedTimeSlot!.date,
          start_time: selectedTimeSlot!.startTime,
          end_time: endTimeLocal,

          // All occurrence dates with details
          all_occurrences: recurringDates,

          // Summary information
          total_occurrences: recurringDates.length,
          days_of_week_included: [...new Set(recurringDates.map((d) => d.day_of_week))],
          date_range: {
            first_appointment: recurringDates[0]?.date,
            last_appointment: recurringDates[recurringDates.length - 1]?.date,
          },

          // Time details for each occurrence
          recurring_schedule: {
            same_time_each_occurrence: true,
            start_time_local: selectedTimeSlot!.startTime,
            end_time_local: endTimeLocal,
            duration_minutes: totalDurationMinutes,
            timezone: userTimezoneData.timezone,
          },

          // Additional useful information
          booking_pattern: {
            frequency_number: recurringConfig.frequency || 1,
            frequency_unit: recurringConfig.unit || "week",
            pattern_type:
              (recurringConfig.frequency || 1) === 1
                ? `${recurringConfig.unit || "week"}ly`
                : `every_${recurringConfig.frequency || 1}_${recurringConfig.unit || "week"}s`,
          },
        }

        console.log("Enhanced recurring details with proper config:", enhancedRecurringDetails)
      }

      const bookingData = {
        action: "create_booking",
        uniqueUrl: uniqueUrl,
        professional_id: professionalId,
        session_id: sessionIdRef.current,
        timestamp: new Date().toISOString(),
        user_timezone: userTimezoneData,

        // Add booking_system from professional's preferences
        booking_system: bookingPreferences?.booking_system || "direct_booking",

        // Keep booking_type for the system's booking behavior (direct vs request)
        booking_type: determineBookingType(),

        // Add user's booking choice (one-time vs recurring)
        user_booking_type: bookingType, // "one-time" or "recurring"
        all_day: bookingType === "multi-day",
        is_recurring_booking: bookingType === "recurring",

        // Enhanced recurring details
        ...(bookingType === "recurring" &&
          enhancedRecurringDetails && {
            recurring_details: enhancedRecurringDetails,
            is_recurring_booking: true,
          }),

        booking_details: {
          service_ids: selectedServices.map((service) => service.service_id),
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
        pets_info: pets.map((pet) => ({
          pet_id: pet.pet_id,
          pet_name: pet.pet_name,
          pet_type: pet.pet_type,
          breed: pet.breed,
          age: pet.age,
          weight: pet.weight,
          special_notes: pet.special_notes,
        })),
        // Only include notification preferences for direct bookings
        ...(isDirectBooking && {
          notification_preferences: {
            selected_notifications: notifications,
            notification_details: notifications
              .map((n) => {
                switch (n) {
                  case "1_hour":
                    return { type: "1_hour", label: "1 hour before", enabled: true }
                  case "1_day":
                    return { type: "1_day", label: "1 day before", enabled: true }
                  case "1_week":
                    return { type: "1_week", label: "1 week before", enabled: true }
                  default:
                    return null
                }
              })
              .filter(Boolean),
          },
        }),
      }

      logWebhookUsage("PROFESSIONAL_CONFIG", "create_booking")
      console.log("Sending enhanced booking data with detailed recurring information:", bookingData)

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
        // Send confirmation email webhook with enhanced recurring details
        try {
          const confirmationWebhookData = {
            action: "send_confirmation_emails",
            uniqueUrl: uniqueUrl,
            professional_id: professionalId,
            session_id: sessionIdRef.current,
            timestamp: new Date().toISOString(),
            customer_info: {
              first_name: customerInfo.firstName.trim(),
              last_name: customerInfo.lastName.trim(),
              email: customerInfo.email.trim().toLowerCase(),
            },
            services_selected: selectedServices.map((service) => ({
              service_id: service.service_id,
              name: service.name,
              description: service.description,
              duration_number: service.duration_number,
              duration_unit: service.duration_unit,
              customer_cost: service.customer_cost,
              customer_cost_currency: service.customer_cost_currency,
            })),
            booking_details: {
              date: selectedTimeSlot!.date,
              start_time: selectedTimeSlot!.startTime,
              end_time: endTimeLocal,
              day_of_week: selectedTimeSlot!.dayOfWeek,
              timezone: userTimezoneData.timezone,
              timezone_offset: userTimezoneData.offset,
            },
            pets_info: pets.map((pet) => ({
              pet_id: pet.pet_id,
              pet_name: pet.pet_name,
              pet_type: pet.pet_type,
              breed: pet.breed,
              age: pet.age,
              weight: pet.weight,
              special_notes: pet.special_notes,
            })),
            is_recurring: bookingType === "recurring",
            // Include enhanced recurring details in confirmation email
            ...(bookingType === "recurring" &&
              enhancedRecurringDetails && {
                recurring_details: enhancedRecurringDetails,
              }),
          }

          logWebhookUsage("PROFESSIONAL_CONFIG", "send_confirmation_emails")
          console.log("Sending confirmation email webhook with enhanced recurring details:", confirmationWebhookData)

          const confirmationResponse = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(confirmationWebhookData),
          })

          if (confirmationResponse.ok) {
            console.log("Confirmation email webhook sent successfully")
          } else {
            console.warn("Confirmation email webhook failed, but continuing with booking confirmation")
          }
        } catch (confirmationError) {
          console.warn("Error sending confirmation email webhook:", confirmationError)
          // Continue with showing confirmation even if email webhook fails
        }

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

  const handleBookingSubmit = async (petsToBook: Pet[], notificationPreferences: NotificationPreference[]) => {
    if (!professionalInfo || !bookingDetails.customerInfo) {
      setError("Missing required booking information.")
      return
    }
    setIsLoading(true)
    try {
      const webhookUrl = getWebhookEndpoint("PROFESSIONAL_CONFIG")
      logWebhookUsage("PROFESSIONAL_CONFIG", "create_booking")

      const payload = {
        action: "create_booking",
        session_id: sessionId,
        professional_id: professionalInfo.professional_id,
        customer_info: bookingDetails.customerInfo,
        selected_pets: petsToBook,
        selected_services: bookingDetails.selectedServices,
        time_slot: bookingDetails.selectedTimeSlot,
        multi_day_slot: bookingDetails.multiDayTimeSlot,
        booking_type: bookingDetails.bookingType,
        recurring_config: bookingDetails.recurringConfig,
        notification_preferences: notificationPreferences,
        is_direct_booking: bookingDetails.isDirectBooking,
        timestamp: new Date().toISOString(),
      }
      console.log("Submitting booking with payload:", payload)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error(`Booking failed! Status: ${response.status}`)

      const result = await response.json()
      console.log("Booking submission result:", result)
      const bookingId = result.find((r: any) => r.booking_id)?.booking_id
      if (!bookingId) throw new Error("Booking ID not found in response.")

      setBookingDetails((prev) => ({ ...prev, bookingId }))
      setCurrentStep("confirmation")
    } catch (err) {
      console.error("Error submitting booking:", err)
      setError(err instanceof Error ? err.message : "Could not complete booking.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePetSelectOld = async (pets: Pet[], notifications: NotificationPreference[]) => {
    setSelectedPets(pets)
    setSelectedNotifications(notifications)
    setCreatingBooking(true)

    try {
      const webhookUrl = getWebhookEndpoint("PROFESSIONAL_CONFIG")
      const userTimezoneData = JSON.parse(userTimezoneRef.current!)
      const isMultiDay = bookingType === "multi-day" && multiDayTimeSlot

      const startDateTimeUTC = isMultiDay
        ? multiDayTimeSlot.start.toISOString()
        : convertLocalTimeToUTC(selectedTimeSlot!.date, selectedTimeSlot!.startTime, userTimezoneData.timezone)

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
        totalCost += Number(service.customer_cost)
      })

      const endDateTimeUTC = isMultiDay
        ? multiDayTimeSlot.end.toISOString()
        : calculateEndDateTimeUTC(startDateTimeUTC, totalDurationMinutes, "Minutes")

      const endTimeLocal = new Date(endDateTimeUTC).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: userTimezoneData.timezone,
      })

      // Enhanced recurring details for webhook
      let enhancedRecurringDetails = null
      if (bookingType === "recurring" && recurringConfig) {
        const recurringDates = generateRecurringDates(selectedTimeSlot!.date, recurringConfig)

        enhancedRecurringDetails = {
          // Add the original user selections
          selected_days_of_week: recurringConfig.daysOfWeek || recurringConfig.selectedDays || [],
          selected_end_date: recurringConfig.endDate || recurringConfig.originalEndDate,
          recurring_start_date: selectedTimeSlot!.date,

          // Basic recurring config - use the actual recurringConfig values
          frequency: recurringConfig.frequency || 1,
          unit: recurringConfig.unit || "week",
          end_date: recurringConfig.endDate,
          total_appointments: recurringConfig.totalAppointments || recurringDates.length,

          // Enhanced details
          pattern_description: `Every ${recurringConfig.frequency || 1} ${recurringConfig.unit || "week"}${
            (recurringConfig.frequency || 1) > 1 ? "s" : ""
          }`,
          start_date: selectedTimeSlot!.date,
          start_time: selectedTimeSlot!.startTime,
          end_time: endTimeLocal,

          // All occurrence dates with details
          all_occurrences: recurringDates,

          // Summary information
          total_occurrences: recurringDates.length,
          days_of_week_included: [...new Set(recurringDates.map((d) => d.day_of_week))],
          date_range: {
            first_appointment: recurringDates[0]?.date,
            last_appointment: recurringDates[recurringDates.length - 1]?.date,
          },

          // Time details for each occurrence
          recurring_schedule: {
            same_time_each_occurrence: true,
            start_time_local: selectedTimeSlot!.startTime,
            end_time_local: endTimeLocal,
            duration_minutes: totalDurationMinutes,
            timezone: userTimezoneData.timezone,
          },

          // Additional useful information
          booking_pattern: {
            frequency_number: recurringConfig.frequency || 1,
            frequency_unit: recurringConfig.unit || "week",
            pattern_type:
              (recurringConfig.frequency || 1) === 1
                ? `${recurringConfig.unit || "week"}ly`
                : `every_${recurringConfig.frequency || 1}_${recurringConfig.unit || "week"}s`,
          },
        }

        console.log("Enhanced recurring details with proper config:", enhancedRecurringDetails)
      }

      const bookingData = {
        action: "create_booking",
        uniqueUrl: uniqueUrl,
        professional_id: professionalId,
        session_id: sessionIdRef.current,
        timestamp: new Date().toISOString(),
        user_timezone: userTimezoneData,

        // Add booking_system from professional's preferences
        booking_system: bookingPreferences?.booking_system || "direct_booking",

        // Keep booking_type for the system's booking behavior (direct vs request)
        booking_type: determineBookingType(),

        // Add user's booking choice (one-time vs recurring)
        user_booking_type: bookingType, // "one-time" or "recurring"
        all_day: bookingType === "multi-day",
        is_recurring_booking: bookingType === "recurring",

        // Enhanced recurring details
        ...(bookingType === "recurring" &&
          enhancedRecurringDetails && {
            recurring_details: enhancedRecurringDetails,
            is_recurring_booking: true,
          }),

        booking_details: {
          service_ids: selectedServices.map((service) => service.service_id),
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
        pets_info: pets.map((pet) => ({
          pet_id: pet.pet_id,
          pet_name: pet.pet_name,
          pet_type: pet.pet_type,
          breed: pet.breed,
          age: pet.age,
          weight: pet.weight,
          special_notes: pet.special_notes,
        })),
        // Only include notification preferences for direct bookings
        ...(isDirectBooking && {
          notification_preferences: {
            selected_notifications: notifications,
            notification_details: notifications
              .map((n) => {
                switch (n) {
                  case "1_hour":
                    return { type: "1_hour", label: "1 hour before", enabled: true }
                  case "1_day":
                    return { type: "1_day", label: "1 day before", enabled: true }
                  case "1_week":
                    return { type: "1_week", label: "1 week before", enabled: true }
                  default:
                    return null
                }
              })
              .filter(Boolean),
          },
        }),
      }

      logWebhookUsage("PROFESSIONAL_CONFIG", "create_booking")
      console.log("Sending enhanced booking data with detailed recurring information:", bookingData)

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
        // Send confirmation email webhook with enhanced recurring details
        try {
          const confirmationWebhookData = {
            action: "send_confirmation_emails",
            uniqueUrl: uniqueUrl,
            professional_id: professionalId,
            session_id: sessionIdRef.current,
            timestamp: new Date().toISOString(),
            customer_info: {
              first_name: customerInfo.firstName.trim(),
              last_name: customerInfo.lastName.trim(),
              email: customerInfo.email.trim().toLowerCase(),
            },
            services_selected: selectedServices.map((service) => ({
              service_id: service.service_id,
              name: service.name,
              description: service.description,
              duration_number: service.duration_number,
              duration_unit: service.duration_unit,
              customer_cost: service.customer_cost,
              customer_cost_currency: service.customer_cost_currency,
            })),
            booking_details: {
              date: selectedTimeSlot!.date,
              start_time: selectedTimeSlot!.startTime,
              end_time: endTimeLocal,
              day_of_week: selectedTimeSlot!.dayOfWeek,
              timezone: userTimezoneData.timezone,
              timezone_offset: userTimezoneData.offset,
            },
            pets_info: pets.map((pet) => ({
              pet_id: pet.pet_id,
              pet_name: pet.pet_name,
              pet_type: pet.pet_type,
              breed: pet.breed,
              age: pet.age,
              weight: pet.weight,
              special_notes: pet.special_notes,
            })),
            is_recurring: bookingType === "recurring",
            // Include enhanced recurring details in confirmation email
            ...(bookingType === "recurring" &&
              enhancedRecurringDetails && {
                recurring_details: enhancedRecurringDetails,
              }),
          }

          logWebhookUsage("PROFESSIONAL_CONFIG", "send_confirmation_emails")
          console.log("Sending confirmation email webhook with enhanced recurring details:", confirmationWebhookData)

          const confirmationResponse = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(confirmationWebhookData),
          })

          if (confirmationResponse.ok) {
            console.log("Confirmation email webhook sent successfully")
          } else {
            console.warn("Confirmation email webhook failed, but continuing with booking confirmation")
          }
        } catch (confirmationError) {
          console.warn("Error sending confirmation email webhook:", confirmationError)
          // Continue with showing confirmation even if email webhook fails
        }

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

  const handlePetSelect = (pets: Pet[], notificationPreferences: NotificationPreference[]) => {
    setBookingDetails((prev) => ({ ...prev, selectedPets: pets, notificationPreferences }))
    if (bookingDetails.isDirectBooking) {
      handleBookingSubmit(pets, notificationPreferences)
    } else {
      setCurrentStep("confirmation")
    }
  }

  const handleBackOld = () => {
    setShowPetSelection(false)
    setShowCustomerForm(true)
  }

  const handleBack = () => {
    switch (currentStep) {
      case "confirmation": setCurrentStep("petSelection"); break
      case "petSelection": setCurrentStep("customerForm"); break
      case "customerForm": 
        if (bookingDetails.bookingType === 'multi-day' || bookingDetails.selectedServices.some(s => s.duration_unit.toLowerCase() === 'days')) {
            setCurrentStep("multiDay")
        } else {
            setCurrentStep("dateTime")
        }
        break
      case "dateTime": setCurrentStep("bookingType"); break
      case "multiDay": setCurrentStep("bookingType"); break
      case "bookingType": setCurrentStep("service"); break
      case "service": break
    }
  }

  const handleBackToSchedule = () => {
    setShowCustomerForm(false)
    setSelectedTimeSlot(null)
    if (bookingType === "multi-day") {
      setShowMultiDayForm(true)
    }
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
    setSelectedPets([])
    setSelectedNotifications([])
    setShowBookingTypeSelection(false)
    setBookingType(null)
    setRecurringConfig(null)

    console.log("Starting new booking - refreshing schedule data...")
    await initializeSchedule()
  }

  const renderStep = () => {
    if (isLoading && !professionalInfo) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-[#E75837]" />
          <p className="mt-4 text-lg text-gray-600 body-font">Loading schedule...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h2 className="text-2xl font-bold text-red-600 header-font">Oops! Something went wrong.</h2>
          <p className="mt-2 text-gray-700 body-font">We couldn't load the booking information for this professional.</p>
          <p className="mt-4 text-sm text-gray-500 bg-red-50 p-3 rounded-md">Error: {error}</p>
          <button onClick={initializeSchedule} className="mt-6 px-6 py-2 bg-[#E75837] text-white rounded-lg hover:bg-[#d14a2a] transition-colors">
            Try Again
          </button>
        </div>
      )
    }

    if (!professionalInfo) return null

    switch (currentStep) {
      case "service":
        return <ServiceSelection services={services} onSelect={handleServiceSelect} professionalName={professionalInfo.business_name} />
      case "bookingType":
        return <BookingTypeSelection onSelect={handleBookingTypeSelect} onBack={handleBack} />
      case "dateTime":
        return (
          <DateTimePanel
            onSelect={handleDateTimeSelect}
            onBack={handleBack}
            professionalId={professionalInfo.professional_id}
            professionalConfig={professionalConfig}
            existingBookings={existingBookings}
            duration={bookingDetails.selectedServices.reduce((acc, s) => acc + s.duration_number, 0)}
          />
        )
      case "multiDay":
        return (
            <MultiDayBookingForm
                onSelect={handleMultiDaySelect}
                onBack={handleBack}
                professionalConfig={professionalConfig}
                existingBookings={existingBookings}
                service={bookingDetails.selectedServices[0]}
            />
        )
      case "customerForm":
        if (!bookingDetails.selectedTimeSlot && !bookingDetails.multiDayTimeSlot) return <p>Please select a time slot first.</p>
        return (
          <CustomerForm
            selectedServices={bookingDetails.selectedServices}
            selectedTimeSlot={bookingDetails.selectedTimeSlot!}
            professionalId={professionalInfo.professional_id}
            professionalName={professionalInfo.business_name}
            sessionId={sessionId}
            onPetsReceived={handleCustomerInfoSubmit}
            onBack={handleBack}
            bookingType={bookingDetails.bookingType}
            recurringConfig={bookingDetails.recurringConfig}
            multiDayTimeSlot={bookingDetails.multiDayTimeSlot}
            showPrices={professionalConfig?.bookingPreferences.show_prices ?? true}
          />
        )
      case "petSelection":
        if (!bookingDetails.customerInfo || (!bookingDetails.selectedTimeSlot && !bookingDetails.multiDayTimeSlot)) return <p>Please complete previous steps.</p>
        return (
          <PetSelection
            pets={bookingDetails.selectedPets}
            customerInfo={bookingDetails.customerInfo}
            selectedServices={bookingDetails.selectedServices}
            selectedTimeSlot={bookingDetails.selectedTimeSlot!}
            professionalName={professionalInfo.business_name}
            isDirectBooking={bookingDetails.isDirectBooking}
            onPetSelect={handlePetSelect}
            onBack={handleBack}
            bookingType={bookingDetails.bookingType}
            recurringConfig={bookingDetails.recurringConfig}
            multiDayTimeSlot={bookingDetails.multiDayTimeSlot}
            showPrices={professionalConfig?.bookingPreferences.show_prices ?? true}
          />
        )
      case "confirmation":
        if (!bookingDetails.customerInfo || (!bookingDetails.selectedTimeSlot && !bookingDetails.multiDayTimeSlot)) return <p>Booking details are incomplete.</p>
        return (
          <BookingConfirmation
            bookingDetails={bookingDetails}
            professionalName={professionalInfo.business_name}
            isDirectBooking={bookingDetails.isDirectBooking}
            showPrices={professionalConfig?.bookingPreferences.show_prices ?? true}
          />
        )
      default:
        return <p>Unknown step.</p>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-[#E75837] rounded-xl flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 header-font">
              {showConfirmation ? "Refreshing schedule..." : "Loading booking system..."}
            </h2>
            <p className="text-gray-600 body-font mt-1">Please wait a moment</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border p-8 space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 header-font">Unable to Load Schedule</h2>
              <p className="text-gray-600 body-font mt-2">{error}</p>
            </div>
            <Button
              onClick={() => initializeSchedule()}
              className="bg-[#E75837] hover:bg-[#d14a2a] text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!webhookData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 header-font">No Schedule Available</h2>
            <p className="text-gray-500 body-font">Unable to find scheduling data</p>
          </div>
        </div>
      </div>
    )
  }

  if (creatingBooking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto p-6 pt-16">
          <div className="bg-white rounded-2xl shadow-lg border p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-[#E75837] rounded-2xl flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 header-font mb-2">
                {isDirectBooking ? "Confirming Your Booking" : "Submitting Your Request"}
              </h1>
              <p className="text-gray-600 body-font">
                Please wait while we {isDirectBooking ? "confirm your appointment" : "submit your booking request"} with{" "}
                {webhookData.professional_info.professional_name}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Services:</span>
                <span className="font-medium">{selectedServices.map((s) => s.name).join(", ")}</span>
              </div>
              {bookingType === "multi-day" && multiDayTimeSlot ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Drop-off:</span>
                    <span className="font-medium">
                      {new Date(multiDayTimeSlot.start).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pick-up:</span>
                    <span className="font-medium">
                      {new Date(multiDayTimeSlot.end).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {(() => {
                        if (!selectedTimeSlot?.date) return ""
                        const [year, month, day] = selectedTimeSlot.date.split("-").map(Number)
                        const localDate = new Date(year, month - 1, day)
                        return localDate.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{selectedTimeSlot?.startTime}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pet(s):</span>
                <span className="font-medium text-right">
                  {selectedPets.map(p => p.pet_name).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">
                  {customerInfo.firstName} {customerInfo.lastName}
                </span>
              </div>
              {bookingType === "recurring" && recurringConfig && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Recurring:</span>
                  <span className="font-medium text-blue-600">
                    Every {recurringConfig.daysOfWeek?.join(", ")} until{" "}
                    {new Date(recurringConfig.endDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              {isDirectBooking && selectedNotifications.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Notifications:</span>
                  <span className="font-medium">{selectedNotifications.length} selected</span>
                </div>
              )}
              {!isDirectBooking && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-blue-600">Booking Request</span>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500">This should only take a few seconds...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {renderStep()}
      </main>
    </div>
  )
}

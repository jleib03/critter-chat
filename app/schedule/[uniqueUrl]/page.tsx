"use client"

import type React from "react"

import { useEffect, useState, useRef, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, Clock, Calendar, ArrowLeft, Mail } from "lucide-react"
import type { Service, SelectedTimeSlot, CustomerInfo, Pet, PetResponse, ParsedWebhookData } from "@/types/schedule"
import { ServiceSelectorBar } from "@/components/schedule/service-selector-bar"
import { WeeklyCalendar } from "@/components/schedule/weekly-calendar"
import { CustomerForm } from "@/components/schedule/customer-form"
import { PetSelection } from "@/components/schedule/pet-selection"
import { BookingConfirmation } from "@/components/schedule/booking-confirmation"
import { loadProfessionalConfig, saveProfessionalConfig } from "@/utils/professional-config"
import type { ProfessionalConfig } from "@/types/professional-config"
import {
  BookingTypeSelection,
  type BookingType,
  type RecurringConfig,
} from "@/components/schedule/booking-type-selection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MultiDayBookingForm } from "@/components/schedule/multi-day-booking-form"
import { calculateMultiDayAvailability } from "@/utils/professional-config"
import { getWebhookEndpoint, logWebhookUsage } from "@/types/webhook-endpoints"

// New helper to normalize service_type_name -> "drop in"
const isDropInType = (service?: Service) =>
  !!service?.service_type_name && service.service_type_name.toLowerCase().replace("-", " ") === "drop in"

type NotificationPreference = "1_hour" | "1_day" | "1_week"

export default function SchedulePage() {
  const params = useParams()
  const uniqueUrl = params.uniqueUrl as string
  const router = useRouter()

  const [webhookData, setWebhookData] = useState<ParsedWebhookData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<SelectedTimeSlot | null>(null)
  // New: multiple time slots (Drop-In)
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<SelectedTimeSlot[]>([])
  const sessionIdRef = useRef<string | null>(null)
  const userTimezoneRef = useRef<string | null>(null)
  const dropInGroupIdRef = useRef<string | null>(null)

  const [showEmailVerification, setShowEmailVerification] = useState(true)
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)

  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [showPetSelection, setShowPetSelection] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [creatingBooking, setCreatingBooking] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ firstName: "", lastName: "", email: "" })
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPets, setSelectedPets] = useState<Pet[]>([])
  const [selectedNotifications, setSelectedNotifications] = useState<NotificationPreference[]>([])
  const [professionalConfig, setProfessionalConfig] = useState<ProfessionalConfig | null>(null)
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

  // Detect user's timezone
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
    } catch (error) {
      console.error("Error loading professional configuration:", error)
    }
  }

  // Helper function to convert local time to UTC
  const convertLocalTimeToUTC = (dateStr: string, timeStr: string, _userTimezone: string) => {
    try {
      const [time, period] = timeStr.split(" ")
      const [hours, minutes] = time.split(":").map(Number)
      let hour24 = hours
      if (period === "PM" && hours !== 12) hour24 = hours + 12
      else if (period === "AM" && hours === 12) hour24 = 0
      const [year, month, day] = dateStr.split("-").map(Number)
      const localDate = new Date(year, month - 1, day, hour24, minutes, 0, 0)
      return localDate.toISOString()
    } catch (error) {
      console.error("Error converting time to UTC:", error)
      const [time, period] = timeStr.split(" ")
      const [hours, minutes] = time.split(":").map(Number)
      let hour24 = hours
      if (period === "PM" && hours !== 12) hour24 = hours + 12
      else if (period === "AM" && hours === 12) hour24 = 0
      const [year, month, day] = dateStr.split("-").map(Number)
      const date = new Date(year, month - 1, day, hour24, minutes, 0, 0)
      return date.toISOString()
    }
  }

  // Helper function to calculate end datetime in UTC
  const calculateEndDateTimeUTC = (startDateTimeUTC: string, durationNumber: number, durationUnit: string) => {
    const startDate = new Date(startDateTimeUTC)
    let durationInMinutes = durationNumber
    if (durationUnit === "Hours") durationInMinutes = durationNumber * 60
    else if (durationUnit === "Days") durationInMinutes = durationNumber * 24 * 60
    const endDate = new Date(startDate.getTime() + durationInMinutes * 60 * 1000)
    return endDate.toISOString()
  }

  // Helper function to generate recurring dates based on config
  const generateRecurringDates = (startDate: string, config: RecurringConfig) => {
    const dates: any[] = []
    const start = new Date(startDate)
    const endDate = new Date(config.endDate)
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
      if (config.unit === "day") currentDate.setDate(currentDate.getDate() + config.frequency)
      else if (config.unit === "week") currentDate.setDate(currentDate.getDate() + config.frequency * 7)
      else if (config.unit === "month") currentDate.setMonth(currentDate.getMonth() + config.frequency)
      occurrenceCount++
    }
    return dates
  }

  // Helper: parse working days
  const parseWorkingDaysFromSchedule = (schedule: any): any[] => {
    if (!schedule) return []
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    return days.map((day) => {
      const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1)
      const isWorking = !!schedule[`${day}_working`]
      const startTime = schedule[`${day}_start`]
      let endTime = schedule[`${day}_end`]
      if (endTime === "00:00:00") endTime = "23:59:00"
      return {
        day: capitalizedDay,
        start: startTime ? startTime.substring(0, 5) : "09:00",
        end: endTime ? endTime.substring(0, 5) : "17:00",
        isWorking,
      }
    })
  }

  // Add the parseWebhookData function
  const parseWebhookData = (rawData: any[]): ParsedWebhookData => {
    const scheduleEntry = rawData.find((entry) => entry.monday_start)

    const bookingEntries = rawData.filter((entry) => entry.booking_id && entry.start)
    bookingEntries.forEach((booking) => {
      if (!booking.booking_date_formatted && booking.start) {
        try {
          const localDate = new Date(booking.start)
          const year = localDate.getFullYear()
          const month = String(localDate.getMonth() + 1).padStart(2, "0")
          const day = String(localDate.getDate()).padStart(2, "0")
          booking.booking_date_formatted = `${year}-${month}-${day}`
        } catch (e) {
          console.error(`Could not parse date for booking ${booking.booking_id}`, e)
        }
      }
    })

    const serviceEntries = rawData.filter((entry) => entry.name && entry.duration_unit)

    // Group by service_type_name when provided; fallback to name heuristics
    const servicesByCategory: { [category: string]: Service[] } = {}
    serviceEntries.forEach((service: any) => {
      const rawType = service.service_type_name as string | undefined
      const category = rawType && String(rawType).trim().length > 0 ? rawType : getCategoryFromService(service.name)
      if (!servicesByCategory[category]) servicesByCategory[category] = []
      servicesByCategory[category].push({
        service_id: service.service_id || `fallback_${service.name.replace(/\s+/g, "_").toLowerCase()}`,
        name: service.name,
        description: service.description || "",
        duration_unit: service.duration_unit,
        duration_number: service.duration_number,
        customer_cost: service.customer_cost,
        customer_cost_currency: service.customer_cost_currency,
        service_type_name: rawType,
      })
    })

    let bookingPrefs = rawData.find(
      (entry) =>
        entry.booking_system !== undefined ||
        entry.online_booking_enabled !== undefined ||
        entry.allow_direct_booking !== undefined,
    )
    const configEntry = rawData.find((entry) => entry.webhook_response)
    if (!bookingPrefs && configEntry?.webhook_response?.config_data) {
      bookingPrefs = configEntry.webhook_response.config_data
    }

    const priceSettingEntry = rawData.find((entry) => Object.prototype.hasOwnProperty.call(entry, "show_prices"))
    const showPrices = priceSettingEntry ? priceSettingEntry.show_prices : true

    const currencyEntry = rawData.find((entry) => entry.currency && entry.currency_symbol)
    const currencyInfo = currencyEntry
      ? {
          currency: currencyEntry.currency,
          currency_symbol: currencyEntry.currency_symbol,
        }
      : undefined

    const workingDays = parseWorkingDaysFromSchedule(scheduleEntry)

    return {
      professional_info: {
        professional_id: scheduleEntry?.professional_id || uniqueUrl,
        professional_name: bookingEntries[0]?.professional_name || "Professional",
      },
      schedule: { working_days: workingDays },
      bookings: { all_booking_data: bookingEntries },
      services: { services_by_category: servicesByCategory },
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
      currency_info: currencyInfo,
    }
  }

  // Helper function to categorize services - fallback
  const getCategoryFromService = (serviceName: string): string => {
    const lower = serviceName.toLowerCase()
    if (lower.includes("add on") || lower.includes("addon")) return "Add-Ons"
    if (lower.includes("groom")) return "Grooming"
    if (lower.includes("walk")) return "Walks"
    if (lower.includes("board")) return "Boarding"
    if (lower.includes("drop")) return "Drop-In"
    return "Other Services"
  }

  // Memoize professional config to prevent unnecessary re-renders
  const memoizedProfessionalConfig = useMemo(() => professionalConfig, [professionalConfig])

  useEffect(() => {
    if (uniqueUrl) {
      sessionIdRef.current = generateSessionId()
      userTimezoneRef.current = JSON.stringify(detectUserTimezone())
      loadProfessionalConfiguration()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueUrl])

  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyingEmail(true)
    setEmailError(null)

    try {
      if (!email.trim()) {
        throw new Error("Please enter your email address")
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        throw new Error("Please enter a valid email address")
      }

      const webhookUrl = getWebhookEndpoint("PROFESSIONAL_CONFIG")
      logWebhookUsage("PROFESSIONAL_CONFIG", "validate_email")

      const requestPayload = {
        action: "validate_email",
        uniqueUrl: uniqueUrl,
        email: email.trim().toLowerCase(),
        session_id: sessionIdRef.current,
        timestamp: new Date().toISOString(),
        user_timezone: JSON.parse(userTimezoneRef.current!),
      }

      console.log("[v0] Email verification request payload:", requestPayload)
      console.log("[v0] Webhook URL:", webhookUrl)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      let result
      try {
        const responseText = await response.text()
        console.log("[v0] Raw response text:", responseText)

        if (!responseText.trim()) {
          throw new Error("Empty response from server")
        }
        result = JSON.parse(responseText)
        console.log("[v0] Parsed response:", result)
      } catch (parseError) {
        console.error("[v0] JSON parsing error:", parseError)
        throw new Error("Invalid response format from server")
      }

      if (Array.isArray(result)) {
        // Check for invalid_email response
        const invalidEmailItem = result.find((item) => item.invalid_email)
        if (invalidEmailItem) {
          throw new Error(invalidEmailItem.invalid_email)
        }

        // Check for invalid_customer response
        const invalidCustomerItem = result.find((item) => item.output === "invalid_customer")
        if (invalidCustomerItem) {
          throw new Error(
            "Only active customers can schedule bookings - please complete the new customer intake process prior to creating a new booking.",
          )
        }

        const validCustomerItem = result.find((item) => item.output === "valid_customer")
        if (validCustomerItem) {
          console.log("[v0] Valid customer found:", validCustomerItem)
          setCustomerInfo((prev) => ({
            ...prev,
            email: email.trim().toLowerCase(),
            firstName: validCustomerItem.first_name || "",
            lastName: validCustomerItem.last_name || "",
            phone: validCustomerItem.phone_number || "",
            userId: validCustomerItem.critter_user_id || validCustomerItem.user_id || "",
            customerId: validCustomerItem.customer_id || "",
          }))
          console.log("[v0] Customer info updated:", {
            firstName: validCustomerItem.first_name,
            lastName: validCustomerItem.last_name,
            email: email.trim().toLowerCase(),
            phone: validCustomerItem.phone_number,
          })
        }
      }

      // If we get here, email is valid - proceed with initialization
      setIsEmailVerified(true)
      if (!customerInfo.firstName) {
        setCustomerInfo((prev) => ({ ...prev, email: email.trim().toLowerCase() }))
      }
      await initializeSchedule()
      setShowEmailVerification(false)
    } catch (err) {
      console.error("[v0] Email verification error:", err)
      if (err instanceof Error && err.message.includes("no matching email on file")) {
        setEmailError(
          "Only active customers can schedule bookings - please complete the new customer intake process prior to creating a new booking.",
        )
      } else {
        setEmailError(err instanceof Error ? err.message : "Unable to verify email. Please try again.")
      }
    } finally {
      setVerifyingEmail(false)
    }
  }

  const initializeSchedule = async () => {
    try {
      setLoading(true)
      setError(null)

      const webhookUrl = getWebhookEndpoint("PROFESSIONAL_CONFIG")
      logWebhookUsage("PROFESSIONAL_CONFIG", "initialize_schedule")

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "initialize_schedule",
          uniqueUrl: uniqueUrl,
          session_id: sessionIdRef.current,
          timestamp: new Date().toISOString(),
          user_timezone: JSON.parse(userTimezoneRef.current!),
        }),
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const rawData = await response.json()
      const parsedData = parseWebhookData(rawData)
      setWebhookData(parsedData)
      setShowPrices(parsedData.show_prices)

      const pId = parsedData.professional_info?.professional_id
      if (pId) setProfessionalId(pId)

      if (parsedData.booking_preferences) {
        setBookingPreferences(parsedData.booking_preferences)
        setShowBookingDisabled(parsedData.booking_preferences.online_booking_enabled === false)
      } else {
        setShowBookingDisabled(false)
      }

      if (parsedData.config) {
        const configForProfessionalConfig: ProfessionalConfig = {
          professionalId: pId || uniqueUrl,
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
        setProfessionalConfig(configForProfessionalConfig)
        saveProfessionalConfig(configForProfessionalConfig)
      }
    } catch (err) {
      console.error("Error initializing schedule:", err)
      setError("Failed to load scheduling data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedTimeSlot(null)
    setSelectedTimeSlots([])

    setSelectedServices((prevServices) => {
      const isAlreadySelected = prevServices.find((s) => s.name === service.name)
      if (isAlreadySelected) {
        return prevServices.filter((s) => s.name !== service.name)
      } else {
        return [...prevServices, service]
      }
    })
  }

  const handleContinueFromServices = () => {
    if (selectedServices.length === 0) return

    let totalDurationMinutes = 0
    selectedServices.forEach((service) => {
      let durationInMinutes = service.duration_number
      const unit = service.duration_unit.toLowerCase()
      if (unit.startsWith("hour")) durationInMinutes = service.duration_number * 60
      else if (unit.startsWith("day")) durationInMinutes = service.duration_number * 24 * 60
      totalDurationMinutes += durationInMinutes
    })

    const twelveHoursInMinutes = 12 * 60
    if (totalDurationMinutes > twelveHoursInMinutes) {
      handleBookingTypeSelect("multi-day")
    } else {
      setShowBookingTypeSelection(true)
    }
  }

  const handleBookingTypeSelect = (type: BookingType, config?: RecurringConfig) => {
    setBookingType(type)
    setShowBookingTypeSelection(false)
    if (type === "recurring") setRecurringConfig(config || null)
    else if (type === "multi-day") setShowMultiDayForm(true)
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
      selectedServices[0],
    )
  }

  const handleMultiDayBookingConfirm = (start: Date, end: Date) => {
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

  const allowMultiSelect = useMemo(() => {
    const hasDropIn = selectedServices.some((s) => isDropInType(s))
    return hasDropIn && (bookingType === "one-time" || bookingType === "recurring")
  }, [selectedServices, bookingType])

  const handleTimeSlotSelect = (slot: SelectedTimeSlot) => {
    if (selectedServices.length === 0) {
      alert("Please select at least one service before selecting a time slot.")
      return
    }

    if (bookingPreferences && bookingPreferences.online_booking_enabled === false) {
      setShowBookingDisabledModal(true)
      return
    }

    if (allowMultiSelect) {
      setSelectedTimeSlots((prev) => {
        const exists = prev.some((s) => s.date === slot.date && s.startTime === slot.startTime)
        const next = exists
          ? prev.filter((s) => !(s.date === slot.date && s.startTime === slot.startTime))
          : [...prev, slot]
        return next
      })
      // Do NOT jump to customer form automatically in multi-select mode
      return
    }

    setSelectedTimeSlot(slot)
    setShowCustomerForm(true)
  }

  const handlePetsReceived = (customerInfo: CustomerInfo, petResponse: PetResponse) => {
    setCustomerInfo(customerInfo)
    setPets(petResponse.pets || [])
    setShowCustomerForm(false)
    setShowPetSelection(true)
  }

  const handlePetSelect = async (pets: Pet[], notifications: NotificationPreference[]) => {
    setSelectedPets(pets)
    setSelectedNotifications(notifications)
    setCreatingBooking(true)

    try {
      const webhookUrl = getWebhookEndpoint("PROFESSIONAL_CONFIG")
      logWebhookUsage("PROFESSIONAL_CONFIG", "create_booking")
      const userTimezoneData = JSON.parse(userTimezoneRef.current!)
      const selectedDropIn = selectedServices.find((s) => isDropInType(s))
      const isMultiDay = bookingType === "multi-day" && multiDayTimeSlot

      // Helper to send a single booking
      async function sendSingleBooking(
        slot: SelectedTimeSlot,
        totalDurationMinutesOverride?: number,
        actionOverride: "create_booking" | "create_booking_dropin" = "create_booking",
        index?: number,
        total?: number,
        groupId?: string,
      ) {
        const startDateTimeUTC = isMultiDay
          ? multiDayTimeSlot!.start.toISOString()
          : convertLocalTimeToUTC(slot.date, slot.startTime, userTimezoneData.timezone)

        // Calculate total duration and cost for all selected services
        let totalDurationMinutes = 0
        let totalCost = 0
        selectedServices.forEach((service) => {
          let durationInMinutes = service.duration_number
          if (service.duration_unit === "Hours") durationInMinutes = service.duration_number * 60
          else if (service.duration_unit === "Days") durationInMinutes = service.duration_number * 24 * 60
          totalDurationMinutes += durationInMinutes
          totalCost += Number(service.customer_cost)
        })
        if (typeof totalDurationMinutesOverride === "number") {
          totalDurationMinutes = totalDurationMinutesOverride
        }

        const endDateTimeUTC = isMultiDay
          ? multiDayTimeSlot!.end.toISOString()
          : calculateEndDateTimeUTC(startDateTimeUTC, totalDurationMinutes, "Minutes")

        const endTimeLocal = new Date(endDateTimeUTC).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: userTimezoneData.timezone,
        })

        let enhancedRecurringDetails = null as any
        if (bookingType === "recurring" && recurringConfig) {
          const recurringDates = generateRecurringDates(slot.date, recurringConfig)
          const isDropInMultiSlot = actionOverride === "create_booking_dropin" && total && total > 1

          enhancedRecurringDetails = {
            selected_days_of_week: recurringConfig.daysOfWeek || recurringConfig.selectedDays || [],
            selected_end_date: recurringConfig.endDate || recurringConfig.originalEndDate,
            recurring_start_date: slot.date,
            frequency: recurringConfig.frequency || 1,
            unit: recurringConfig.unit || "week",
            end_date: recurringConfig.endDate,
            total_appointments: recurringDates.length,
            pattern_description: `Every ${recurringConfig.frequency || 1} ${recurringConfig.unit || "week"}${(recurringConfig.frequency || 1) > 1 ? "s" : ""}`,
            start_date: slot.date,
            start_time: slot.startTime,
            end_time: endTimeLocal,
            all_occurrences: recurringDates,
            total_occurrences: recurringDates.length,
            days_of_week_included: [...new Set(recurringDates.map((d: any) => d.day_of_week))],
            date_range: {
              first_appointment: recurringDates[0]?.date,
              last_appointment: recurringDates[recurringDates.length - 1]?.date,
            },
            recurring_schedule: {
              same_time_each_occurrence: true,
              start_time_local: slot.startTime,
              end_time_local: endTimeLocal,
              duration_minutes: totalDurationMinutes,
              timezone: userTimezoneData.timezone,
            },
            booking_pattern: {
              frequency_number: recurringConfig.frequency || 1,
              frequency_unit: recurringConfig.unit || "week",
              pattern_type:
                (recurringConfig.frequency || 1) === 1
                  ? `${recurringConfig.unit || "week"}ly`
                  : `every_${recurringConfig.frequency || 1}_${recurringConfig.unit || "week"}s`,
            },
            // Add Drop-In specific recurring metadata
            ...(isDropInMultiSlot && {
              drop_in_recurring_metadata: {
                is_multi_slot_recurring: true,
                current_slot_in_group: index,
                total_slots_in_group: total,
                slot_specific_time: slot.startTime,
                recurring_pattern_applies_to_each_slot: true,
              },
            }),
          }
        }

        // Generate a per-request id only for Drop-In multi posts to ensure distinct traceability
        const perRequestId =
          actionOverride === "create_booking_dropin"
            ? `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
            : undefined

        const bookingData: any = {
          action: actionOverride,
          uniqueUrl: uniqueUrl,
          professional_id: professionalId,
          session_id: sessionIdRef.current,
          timestamp: new Date().toISOString(),
          user_timezone: userTimezoneData,
          booking_system: bookingPreferences?.booking_system || "direct_booking",
          booking_type: determineBookingType(),
          user_booking_type: bookingType,
          all_day: bookingType === "multi-day",
          is_recurring_booking: bookingType === "recurring",
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
            date_local: slot.date,
            start_time_local: slot.startTime,
            end_time_local: endTimeLocal,
            day_of_week: slot.dayOfWeek,
            timezone: userTimezoneData.timezone,
            timezone_offset: userTimezoneData.offset,
            // Add slot-specific details for Drop-In bookings
            slot_specific_details: {
              selected_date: slot.date,
              selected_start_time: slot.startTime,
              selected_end_time: slot.endTime,
              selected_day_of_week: slot.dayOfWeek,
              booking_date_formatted: (() => {
                const [year, month, day] = slot.date.split("-").map(Number)
                const localDate = new Date(year, month - 1, day)
                return localDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              })(),
              start_datetime_utc: startDateTimeUTC,
              end_datetime_utc: endDateTimeUTC,
              start_time_local_formatted: slot.startTime,
              end_time_local_formatted: endTimeLocal,
            },
          },
          // Only for Drop-In posts: add comprehensive booking metadata
          ...(actionOverride === "create_booking_dropin" && {
            multi_booking_group_id: groupId,
            multi_booking_index: index,
            multi_booking_total: total,
            request_id: perRequestId,
            drop_in_booking_metadata: {
              is_drop_in_service: true,
              service_type_name: selectedServices.find((s) => isDropInType(s))?.service_type_name || "Drop-In",
              total_selected_slots: total,
              current_slot_index: index,
              group_session_id: sessionIdRef.current,
              booking_creation_timestamp: new Date().toISOString(),
              all_selected_slots_summary: selectedTimeSlots.map((s, idx) => {
                const slotStartUTC = convertLocalTimeToUTC(s.date, s.startTime, userTimezoneData.timezone)

                // Calculate slot duration and end time UTC
                let slotDurationMinutes = 0
                selectedServices.forEach((service) => {
                  let durationInMinutes = service.duration_number
                  if (service.duration_unit === "Hours") durationInMinutes = service.duration_number * 60
                  else if (service.duration_unit === "Days") durationInMinutes = service.duration_number * 24 * 60
                  slotDurationMinutes += durationInMinutes
                })
                const slotEndUTC = calculateEndDateTimeUTC(slotStartUTC, slotDurationMinutes, "Minutes")

                return {
                  slot_index: idx + 1,
                  date: s.date,
                  start_time: s.startTime,
                  end_time: s.endTime,
                  day_of_week: s.dayOfWeek,
                  start_time_utc: slotStartUTC,
                  end_time_utc: slotEndUTC,
                }
              }),
            },
          }),
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

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
          // Add timeout handling for Drop-In bookings
          signal:
            actionOverride === "create_booking_dropin"
              ? AbortSignal.timeout(30000) // 30 second timeout for Drop-In
              : AbortSignal.timeout(15000), // 15 second timeout for regular bookings
        })

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error")
          console.error(`Webhook response error: ${response.status} - ${errorText}`)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        let result
        try {
          result = await response.json()
        } catch (jsonError) {
          console.error("Failed to parse JSON response:", jsonError)
          throw new Error("Invalid response format from webhook")
        }

        // Enhanced response validation for Drop-In bookings
        const isSuccessful = (() => {
          if (actionOverride === "create_booking_dropin") {
            // For Drop-In bookings, handle various response formats
            if (Array.isArray(result)) {
              return result.some((r) => r && (r.output === "Booking Successfully Created" || r.status === "success"))
            } else if (result && typeof result === "object") {
              return (
                result.output === "Booking Successfully Created" ||
                result.status === "success" ||
                (result[0] && result[0].output === "Booking Successfully Created")
              )
            }
            return false
          } else {
            // Regular booking validation (existing logic)
            return result && result[0] && result[0].output === "Booking Successfully Created"
          }
        })()

        if (isSuccessful) {
          // Log successful Drop-In booking for debugging
          if (actionOverride === "create_booking_dropin") {
            console.log(`Drop-In booking ${index}/${total} created successfully for slot:`, slot.date, slot.startTime)
          }

          // Only send confirmation emails for non-Drop-In bookings here
          if (actionOverride !== "create_booking_dropin") {
            try {
              const confirmationWebhookData = { ...bookingData, action: "send_confirmation_emails" }
              logWebhookUsage("PROFESSIONAL_CONFIG", "send_confirmation_emails")
              await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(confirmationWebhookData),
                signal: AbortSignal.timeout(10000), // 10 second timeout for email confirmation
              }).catch((emailError) => {
                console.warn("Email confirmation failed but booking was successful:", emailError)
              })
            } catch {
              // ignore email webhook errors but don't fail the booking
            }
          }
          return true
        } else {
          console.error("Booking creation failed. Response:", result)
          throw new Error(`Booking creation failed: ${JSON.stringify(result)}`)
        }
      }

      // If Drop-In and multiple selected time windows -> send each as an individual booking
      if (allowMultiSelect && selectedDropIn && selectedTimeSlots.length > 0) {
        if (!dropInGroupIdRef.current) {
          dropInGroupIdRef.current = `dropin_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
        }

        let successfulBookings = 0
        const totalBookings = selectedTimeSlots.length
        let firstSuccessfulSlot: SelectedTimeSlot | null = null

        for (const slot of selectedTimeSlots) {
          try {
            const idx = selectedTimeSlots.findIndex((s) => s.date === slot.date && s.startTime === slot.startTime)
            const actionType = bookingType === "recurring" ? "create_booking_dropin" : "create_booking_dropin"
            const ok = await sendSingleBooking(
              slot,
              undefined,
              actionType,
              idx + 1,
              selectedTimeSlots.length,
              dropInGroupIdRef.current!,
            )
            if (ok) {
              successfulBookings++
              if (!firstSuccessfulSlot) {
                firstSuccessfulSlot = slot
              }
              console.log(`Drop-In ${bookingType} booking ${successfulBookings}/${totalBookings} created successfully`)

              // For Drop-In bookings, we only need one successful booking to proceed
              // Additional slots are considered bonus/optional
              break
            }
          } catch (bookingError) {
            console.warn(
              `Drop-In ${bookingType} booking ${successfulBookings + 1}/${totalBookings} failed:`,
              bookingError,
            )
            // Continue with remaining bookings only if we haven't had any success yet
            if (successfulBookings === 0) {
              continue
            } else {
              break
            }
          }
        }

        // If we successfully created at least one booking, show confirmation
        if (successfulBookings > 0 && firstSuccessfulSlot) {
          console.log(
            `Successfully created ${successfulBookings}/${totalBookings} Drop-In ${bookingType} booking(s) - proceeding with confirmation`,
          )

          // Set the successful slot as the primary selected slot for confirmation display
          setSelectedTimeSlot(firstSuccessfulSlot)

          // Immediately show confirmation screen
          setShowPetSelection(false)
          setCreatingBooking(false)
          setShowConfirmation(true)

          // Send confirmation email in background (non-blocking)
          setTimeout(async () => {
            try {
              const confirmationWebhookData = {
                action: "send_confirmation_emails_dropin",
                uniqueUrl: uniqueUrl,
                professional_id: professionalId,
                session_id: sessionIdRef.current,
                timestamp: new Date().toISOString(),
                user_timezone: userTimezoneData,
                booking_system: bookingPreferences?.booking_system || "direct_booking",
                booking_type: determineBookingType(),
                user_booking_type: bookingType,
                multi_booking_group_id: dropInGroupIdRef.current,
                drop_in_confirmation: {
                  total_bookings_created: successfulBookings,
                  total_bookings_requested: totalBookings,
                  is_recurring: bookingType === "recurring",
                  primary_successful_slot: {
                    date: firstSuccessfulSlot.date,
                    start_time: firstSuccessfulSlot.startTime,
                    end_time: firstSuccessfulSlot.endTime,
                    day_of_week: firstSuccessfulSlot.dayOfWeek,
                  },
                  all_selected_slots: selectedTimeSlots.map((s, idx) => ({
                    slot_index: idx + 1,
                    date: s.date,
                    start_time: s.startTime,
                    end_time: s.endTime,
                    day_of_week: s.dayOfWeek,
                    booking_date_formatted: (() => {
                      const [year, month, day] = s.date.split("-").map(Number)
                      const localDate = new Date(year, month - 1, day)
                      return localDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    })(),
                  })),
                  recurring_details:
                    bookingType === "recurring"
                      ? {
                          frequency: recurringConfig?.frequency || 1,
                          unit: recurringConfig?.unit || "week",
                          end_date: recurringConfig?.endDate,
                          days_of_week: recurringConfig?.daysOfWeek || [],
                        }
                      : undefined,
                },
                customer_info: {
                  first_name: customerInfo.firstName.trim(),
                  last_name: customerInfo.lastName.trim(),
                  email: customerInfo.email.trim().toLowerCase(),
                },
                pets_info: pets.map((pet) => ({
                  pet_id: pet.pet_id,
                  pet_name: pet.pet_name,
                })),
                booking_details: {
                  service_names: selectedServices.map((s) => s.name),
                  service_descriptions: selectedServices.map((s) => s.description),
                  service_durations: selectedServices.map((s) => s.duration_number),
                  service_duration_units: selectedServices.map((s) => s.duration_unit),
                  service_costs: selectedServices.map((s) => s.customer_cost),
                  service_currencies: selectedServices.map((s) => s.customer_cost_currency),
                },
              }
              logWebhookUsage("PROFESSIONAL_CONFIG", "send_confirmation_emails_dropin")
              await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(confirmationWebhookData),
                signal: AbortSignal.timeout(10000),
              })
              console.log(`Drop-In ${bookingType} confirmation email sent successfully`)
            } catch (emailError) {
              console.warn(`Drop-In ${bookingType} confirmation email failed but booking was successful:`, emailError)
            }
          }, 100)

          return // Exit the function here for Drop-In flow
        } else {
          throw new Error(`All Drop-In ${bookingType} booking attempts failed`)
        }
      } else {
        // Single booking path (existing behavior)
        const ok = await sendSingleBooking(selectedTimeSlot!)
        if (!ok) throw new Error("Booking creation failed")
      }

      setShowPetSelection(false)
      setCreatingBooking(false)
      setShowConfirmation(true)
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

  const handleBackToScheduleInner = () => {
    setShowCustomerForm(false)
    setSelectedTimeSlot(null)
    setSelectedTimeSlots([])
    if (bookingType === "multi-day") {
      setShowMultiDayForm(true)
    }
  }

  const handleNewBookingInner = async () => {
    setSelectedServices([])
    setSelectedTimeSlot(null)
    setSelectedTimeSlots([])
    setShowCustomerForm(false)
    setShowPetSelection(false)
    setShowConfirmation(false)
    setCreatingBooking(false)
    // setCustomerInfo({ firstName: "", lastName: "", email: "" })
    setPets([])
    setSelectedPets([])
    setSelectedNotifications([])
    setShowBookingTypeSelection(false)
    setBookingType(null)
    setRecurringConfig(null)
    await initializeSchedule()
  }

  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#E75837] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push(`/${uniqueUrl}`)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold">Scheduling Portal</h1>
                  <p className="text-white/90 text-sm">Schedule your appointment and manage bookings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Verification Form */}
        <div className="max-w-md mx-auto pt-20">
          <Card className="shadow-lg border-0 rounded-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Enter your email address</h2>
                <p className="text-gray-600 text-sm">
                  We'll verify you're an active customer prior to proceeding with the scheduling process
                </p>
              </div>

              <form onSubmit={handleEmailVerification} className="space-y-6">
                {emailError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{emailError}</p>
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="pl-12 py-3 text-base rounded-lg border-gray-300 focus:border-[#E75837] focus:ring-[#E75837]"
                    required
                    disabled={verifyingEmail}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={verifyingEmail}
                  className="w-full py-3 bg-[#E75837] hover:bg-[#d14a2a] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {verifyingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Verify Email
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  isEmailVerified && customerInfo.firstName && (
    <div className="mb-6 text-center">
      <h2 className="text-2xl font-semibold text-gray-800">Welcome {customerInfo.firstName}!</h2>
      <p className="text-gray-600 mt-1">Let's get your appointment scheduled.</p>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#E75837] mx-auto mb-4" />
          <p className="text-gray-600">Loading scheduling system...</p>
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
    const isDropIn = selectedServices.some((s) => isDropInType(s))
    const multipleWindows = isDropIn && selectedTimeSlots.length > 0

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
              ) : multipleWindows ? (
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">Selected Times:</div>
                  <ul className="text-sm">
                    {selectedTimeSlots.map((slot, idx) => (
                      <li key={`${slot.date}-${slot.startTime}-${idx}`} className="flex justify-between">
                        <span>
                          {(() => {
                            const [year, month, day] = slot.date.split("-").map(Number)
                            const localDate = new Date(year, month - 1, day)
                            return localDate.toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })
                          })()}
                        </span>
                        <span className="font-medium">{slot.startTime}</span>
                      </li>
                    ))}
                  </ul>
                </div>
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
                <span className="font-medium text-right">{selectedPets.map((p) => p.pet_name).join(", ")}</span>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Clean Header */}
        <div className="bg-white rounded-2xl shadow-lg border p-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-[#E75837] mb-3 header-font">
              Book with {webhookData.professional_info.professional_name}
            </h1>
            <p className="text-lg text-gray-600 body-font mb-4">
              Select your service and preferred time to {isDirectBooking ? "book instantly" : "request an appointment"}
            </p>

            {userTimezoneRef.current && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-600 body-font">
                <Clock className="w-4 h-4" />
                <span>{JSON.parse(userTimezoneRef.current).timezone}</span>
              </div>
            )}
          </div>
        </div>

        {showBookingDisabled ? (
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-0 rounded-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl header-font">Online Booking Unavailable</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600 body-font">
                  {webhookData?.professional_info.professional_name} hasn't enabled online booking. Please contact them
                  directly through the Critter app.
                </p>
                <Button
                  onClick={() => window.open("https://critter.app", "_blank")}
                  className="bg-[#E75837] hover:bg-[#d14a2a] text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Open Critter App
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : showConfirmation ? (
          <BookingConfirmation
            selectedTimeSlot={selectedTimeSlot!}
            selectedTimeSlots={selectedTimeSlots}
            customerInfo={customerInfo}
            selectedPets={selectedPets}
            professionalName={webhookData.professional_info.professional_name}
            onNewBooking={handleNewBookingInner}
            bookingType={bookingType}
            recurringConfig={recurringConfig}
            selectedServices={selectedServices}
            isDirectBooking={isDirectBooking}
            multiDayTimeSlot={multiDayTimeSlot}
            showPrices={showPrices}
          />
        ) : showPetSelection ? (
          <PetSelection
            pets={pets}
            customerInfo={customerInfo}
            selectedServices={selectedServices}
            selectedTimeSlot={selectedTimeSlot || selectedTimeSlots[0]}
            professionalName={webhookData.professional_info.professional_name}
            isDirectBooking={isDirectBooking}
            onPetSelect={handlePetSelect}
            onBack={handleBackToCustomerForm}
            bookingType={bookingType}
            recurringConfig={recurringConfig}
            showPrices={showPrices}
            multiDayTimeSlot={multiDayTimeSlot}
            // harmless extra prop if component ignores it
            selectedTimeSlots={selectedTimeSlots}
          />
        ) : showCustomerForm && selectedServices.length > 0 && (selectedTimeSlot || selectedTimeSlots.length > 0) ? (
          <CustomerForm
            selectedServices={selectedServices}
            selectedTimeSlot={selectedTimeSlot || selectedTimeSlots[0]}
            selectedTimeSlots={selectedTimeSlots}
            professionalId={professionalId || uniqueUrl}
            professionalName={webhookData.professional_info.professional_name}
            sessionId={sessionIdRef.current!}
            onPetsReceived={handlePetsReceived}
            onBack={handleBackToScheduleInner}
            bookingType={bookingType}
            recurringConfig={recurringConfig}
            showPrices={showPrices}
            multiDayTimeSlot={multiDayTimeSlot}
            verifiedCustomerInfo={
              customerInfo.firstName
                ? {
                    first_name: customerInfo.firstName,
                    last_name: customerInfo.lastName,
                    email: customerInfo.email,
                    phone_number: customerInfo.phone,
                    user_id: customerInfo.userId,
                    customer_id: customerInfo.customerId,
                  }
                : undefined
            }
          />
        ) : showMultiDayForm && selectedServices.length > 0 ? (
          <MultiDayBookingForm
            selectedService={selectedServices[0]}
            onAvailabilityCheck={handleMultiDayAvailabilityCheck}
            onBookingConfirm={handleMultiDayBookingConfirm}
            onBack={handleBackFromMultiDay}
          />
        ) : showBookingTypeSelection && selectedServices.length > 0 ? (
          <BookingTypeSelection
            selectedServices={selectedServices}
            onBookingTypeSelect={handleBookingTypeSelect}
            onBack={handleBackToServices}
          />
        ) : (
          <div className="space-y-6">
            {/* Service Selection */}
            {!bookingType && (
              <div className="bg-white rounded-2xl shadow-lg border p-6">
                <ServiceSelectorBar
                  servicesByCategory={webhookData.services.services_by_category}
                  selectedServices={selectedServices}
                  onServiceSelect={handleServiceSelect}
                  onContinue={selectedServices.length > 0 ? handleContinueFromServices : undefined}
                  summaryOnly={false}
                  showPrices={showPrices}
                  currencySymbol={webhookData.currency_info?.currency_symbol}
                />
              </div>
            )}

            {/* Calendar & multi-select proceed */}
            {selectedServices.length > 0 && bookingType && !showMultiDayForm && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border p-6">
                  <ServiceSelectorBar
                    servicesByCategory={webhookData.services.services_by_category}
                    selectedServices={selectedServices}
                    onServiceSelect={handleServiceSelect}
                    summaryOnly={true}
                    showPrices={showPrices}
                    currencySymbol={webhookData.currency_info?.currency_symbol}
                  />
                </div>

                <div className="bg-white rounded-2xl shadow-lg border p-6">
                  <WeeklyCalendar
                    workingDays={webhookData.schedule.working_days}
                    bookingData={webhookData.bookings.all_booking_data}
                    selectedServices={selectedServices}
                    onTimeSlotSelect={handleTimeSlotSelect}
                    selectedTimeSlot={selectedTimeSlot}
                    professionalId={professionalId || uniqueUrl}
                    professionalConfig={memoizedProfessionalConfig}
                    bookingType={bookingType}
                    recurringConfig={recurringConfig}
                    allowMultiSelect={allowMultiSelect}
                    selectedTimeSlotsMulti={selectedTimeSlots}
                    onMultiSelect={setSelectedTimeSlots}
                  />
                  {allowMultiSelect && selectedTimeSlots.length > 0 && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={() => setShowCustomerForm(true)}
                        className="bg-[#E75837] hover:bg-[#d14a2a] text-white rounded-lg font-medium transition-colors"
                      >
                        Continue with {selectedTimeSlots.length} time{selectedTimeSlots.length > 1 ? "s" : ""}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Booking Disabled Modal */}
        {showBookingDisabledModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 header-font">Online Booking Unavailable</h3>
                  <p className="text-gray-600 body-font mt-2">
                    {webhookData?.professional_info.professional_name} hasn't enabled online booking. Please contact
                    them directly through the Critter app.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowBookingDisabledModal(false)}
                    variant="outline"
                    className="flex-1 rounded-lg"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      window.open("https://critter.app", "_blank")
                      setShowBookingDisabledModal(false)
                    }}
                    className="flex-1 bg-[#E75837] hover:bg-[#d14a2a] text-white rounded-lg font-medium transition-colors"
                  >
                    Open Critter App
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

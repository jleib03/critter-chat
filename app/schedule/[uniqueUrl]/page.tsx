"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useParams } from "next/navigation"
import type { Service, SelectedTimeSlot, CustomerInfo, Pet, PetResponse, ParsedWebhookData } from "@/types/schedule"
import { loadProfessionalConfig, saveProfessionalConfig } from "@/utils/professional-config"
import type { ProfessionalConfig } from "@/types/professional-config"
import type { BookingType, RecurringConfig } from "@/components/schedule/booking-type-selection"

type NotificationPreference = "1_hour" | "1_day" | "1_week"

export default function SchedulePage() {
  const params = useParams()
  const uniqueUrl = params.uniqueUrl as string

  const [webhookData, setWebhookData] = useState<ParsedWebhookData | null>(null)
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

  // Update the initializeSchedule function to parse the new webhook format
  const initializeSchedule = async () => {
    try {
      setLoading(true)
      setError(null)

      sessionIdRef.current = generateSessionId()
      userTimezoneRef.current = JSON.stringify(detectUserTimezone())
      loadProfessionalConfiguration()

      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook-test/4ae0fb3d-17dc-482f-be27-1c7ab5c31b16"

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

    const priceSettingEntry = rawData.find((entry) => entry.hasOwnProperty("show_prices"))
    const showPrices = priceSettingEntry ? priceSettingEntry.show_prices : true

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

  useEffect(() => {
    if (uniqueUrl) {
      console.log("useEffect - Initializing schedule for uniqueUrl:", uniqueUrl) // ADDED LOG
      initializeSchedule()
    }
  }, [uniqueUrl])

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

  const handlePetSelect = async (pet: Pet, notifications: NotificationPreference[]) => {
    setSelectedPet(pet)
    setSelectedNotifications(notifications)
    setCreatingBooking(true)

    try {
      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook/5671c1dd-48f6-47a9-85ac-4e20cf261520"
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
        totalCost += Number(service.customer_cost)
      })

      const endDateTimeUTC = calculateEndDateTimeUTC(startDateTimeUTC, totalDurationMinutes, "Minutes")

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
          pattern_description: `Every ${recurringConfig.frequency || 1} ${recurringConfig.unit || "week"}${(recurringConfig.frequency || 1) > 1 ? "s" : ""}`,
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
            human_readable: `Every ${recurringConfig.frequency || 1} ${recurringConfig.unit || "week"}${(recurringConfig.frequency || 1) > 1 ? "s" : ""}`,
          },
        }
      }

      // Send booking data to webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create_booking",
          uniqueUrl: uniqueUrl,
          session_id: sessionIdRef.current,
          timestamp: new Date().toISOString(),
          user_timezone: userTimezoneData,
          selected_services: selectedServices,
          selected_time_slot: selectedTimeSlot,
          customer_info: customerInfo,
          selected_pet: selectedPet,
          selected_notifications: selectedNotifications,
          booking_type: bookingType,
          recurring_details: enhancedRecurringDetails,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const bookingResponse = await response.json()
      console.log("Booking response:", bookingResponse)

      // Handle booking response
      if (bookingResponse.success) {
        console.log("Booking created successfully")
        setShowConfirmation(true)
      } else {
        console.error("Booking creation failed:", bookingResponse.error)
        alert("Booking creation failed. Please try again.")
      }
    } catch (err) {
      console.error("Error creating booking:", err)
      alert("An error occurred while creating your booking. Please try again.")
    } finally {
      setCreatingBooking(false)
    }
  }
}

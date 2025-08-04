"use client"

import { useState, useRef } from "react"
import { useParams } from "next/navigation"
import type { Service, SelectedTimeSlot, CustomerInfo, Pet, ParsedWebhookData } from "@/types/schedule"
import { loadProfessionalConfig } from "@/utils/professional-config"
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
    const durationInMinutes = durationNumber

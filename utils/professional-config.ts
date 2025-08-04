import type { ProfessionalConfig, Employee, WorkingDay } from "@/types/professional-config"
import type { BookingData, Service } from "@/types/schedule"

// Helper: convert "HH:MM:SS", "HH:MM" or "H:MM AM/PM" to minutes past midnight
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr || typeof timeStr !== "string") return 0

  const upperTime = timeStr.toUpperCase()
  const hasPeriod = upperTime.includes("AM") || upperTime.includes("PM")

  try {
    if (hasPeriod) {
      const [time, period] = upperTime.split(" ")
      let [hours, minutes] = time.split(":").map(Number)
      if (period === "PM" && hours < 12) hours += 12
      if (period === "AM" && hours === 12) hours = 0
      return hours * 60 + (minutes || 0)
    } else {
      const [hours, minutes] = timeStr.split(":").map(Number)
      return hours * 60 + (minutes || 0)
    }
  } catch (error) {
    console.error(`Error converting time to minutes: "${timeStr}"`, error)
    return 0
  }
}

// Helper function to add days to a date string
export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split("T")[0]
}

// New function to detect if a service is full-day based on its individual duration
export function isServiceFullDay(service: Service): boolean {
  if (service.duration_unit === "Days" && service.duration_number >= 1) {
    return true
  }
  if (service.duration_unit === "Hours" && service.duration_number >= 24) {
    return true
  }
  return false
}

// New function to check if any selected services are full-day
export function hasFullDayServices(services: Service[] | null): boolean {
  if (!services || services.length === 0) return false
  return services.some((service) => isServiceFullDay(service))
}

// New function to get the total duration in days for full-day services
export function getTotalDurationInDays(services: Service[] | null): number {
  if (!services) return 0

  return services.reduce((total, service) => {
    if (isServiceFullDay(service)) {
      if (service.duration_unit === "Days") {
        return total + service.duration_number
      } else if (service.duration_unit === "Hours") {
        return total + Math.ceil(service.duration_number / 24)
      }
    }
    return total
  }, 0)
}

// Helper function to check if a specific time slot is blocked
export const isTimeSlotBlocked = (
  date: string,
  startTime: string,
  endTime: string,
  blockedTimes: any[],
  employeeId?: string,
): boolean => {
  if (!blockedTimes || blockedTimes.length === 0) return false

  const slotStartMinutes = timeToMinutes(startTime)
  const slotEndMinutes = timeToMinutes(endTime)
  const dateObj = new Date(date)

  return blockedTimes.some((block) => {
    // If this is an employee-specific block and doesn't match the employee, skip
    if (block.employeeId && employeeId && block.employeeId !== employeeId) return false

    // Check if the date matches
    let dateMatches = block.date === date
    if (block.isRecurring) {
      const blockedDate = new Date(block.date)
      if (block.recurrencePattern === "weekly") {
        dateMatches = dateObj.getDay() === blockedDate.getDay()
      }
      if (block.recurrencePattern === "monthly") {
        dateMatches = dateObj.getDate() === blockedDate.getDate()
      }
    }

    if (!dateMatches) return false

    // Check if the time overlaps
    const blockStart = timeToMinutes(block.startTime)
    const blockEnd = timeToMinutes(block.endTime)
    return slotStartMinutes < blockEnd && slotEndMinutes > blockStart
  })
}

// New function to check if a full day is blocked
export function isDayBlocked(date: string, blockedTimes: any[], employeeId?: string): boolean {
  if (!blockedTimes || blockedTimes.length === 0) return false

  const checkDate = new Date(date)

  for (const blockedTime of blockedTimes) {
    // Skip if this is an employee-specific block and we're checking global blocks
    if (blockedTime.employeeId && !employeeId) continue
    if (employeeId && blockedTime.employeeId !== employeeId) continue

    const blockStart = new Date(blockedTime.date || blockedTime.startDate)
    const blockEnd = blockedTime.endDate ? new Date(blockedTime.endDate) : blockStart

    // Check if the date falls within the blocked date range
    if (checkDate >= blockStart && checkDate <= blockEnd) {
      // If it's an all-day block, the entire day is blocked
      if (blockedTime.isAllDay || blockedTime.is_all_day) {
        return true
      }
    }

    // Handle recurring blocked times
    if (blockedTime.isRecurring && blockedTime.recurrencePattern) {
      if (blockedTime.recurrencePattern === "weekly") {
        const dayOfWeek = checkDate.getDay()
        const blockDayOfWeek = blockStart.getDay()

        if (dayOfWeek === blockDayOfWeek && (blockedTime.isAllDay || blockedTime.is_all_day)) {
          return true
        }
      }
    }
  }

  return false
}

// Phase 2: Multi-day booking validation
export function validateMultiDayBooking(
  startDate: string,
  dayCount: number,
  professionalConfig: ProfessionalConfig | null,
  workingDays: WorkingDay[],
  bookingData: BookingData[],
): {
  valid: boolean
  conflictDate?: string
  reason?: string
  availabilityByDay?: Array<{
    date: string
    available: boolean
    reason: string
    availableSlots: number
  }>
} {
  if (!professionalConfig || dayCount <= 0) {
    return { valid: false, reason: "Invalid configuration or day count" }
  }

  const availabilityByDay = []

  for (let i = 0; i < dayCount; i++) {
    const currentDate = addDays(startDate, i)
    const dayOfWeek = new Date(currentDate).toLocaleDateString("en-US", { weekday: "long" })

    const dayAvailability = calculateDayAvailability(
      professionalConfig,
      workingDays,
      currentDate,
      dayOfWeek,
      bookingData,
    )

    const dayInfo = {
      date: currentDate,
      available: dayAvailability.availableSlots > 0,
      reason: dayAvailability.reason,
      availableSlots: dayAvailability.availableSlots,
    }

    availabilityByDay.push(dayInfo)

    if (!dayInfo.available) {
      return {
        valid: false,
        conflictDate: currentDate,
        reason: `Day ${i + 1} (${currentDate}) is not available: ${dayInfo.reason}`,
        availabilityByDay,
      }
    }
  }

  return {
    valid: true,
    availabilityByDay,
  }
}

// Enhanced day-level availability calculation for full-day services
export function calculateDayAvailability(
  professionalConfig: ProfessionalConfig | null,
  workingDays: WorkingDay[],
  date: string,
  dayOfWeek: string,
  bookingData: BookingData[],
): {
  availableSlots: number
  totalCapacity: number
  workingEmployees: Employee[]
  existingBookingsCount: number
  reason: string
} {
  console.log(`[calculateDayAvailability] Checking day: ${date} (${dayOfWeek})`)

  // Default response
  const defaultResponse = {
    availableSlots: 0,
    totalCapacity: 0,
    workingEmployees: [],
    existingBookingsCount: 0,
    reason: "No configuration available",
  }

  if (!professionalConfig) {
    console.log("[calculateDayAvailability] No professional config provided")
    return defaultResponse
  }

  // Check if it's a working day
  const workingDay = workingDays.find((wd) => wd.day === dayOfWeek && wd.isWorking)
  if (!workingDay) {
    return {
      ...defaultResponse,
      reason: "Not a working day",
    }
  }

  // Check if the day is blocked (global blocks)
  if (professionalConfig.blockedTimes && isDayBlocked(date, professionalConfig.blockedTimes)) {
    return {
      ...defaultResponse,
      reason: "Day is blocked",
    }
  }

  // Get active employees working on this day
  const activeEmployees =
    professionalConfig.employees?.filter((emp) => {
      if (!emp.isActive) return false

      const empWorkingDay = emp.workingDays?.find((wd) => wd.day === dayOfWeek && wd.isWorking)
      if (!empWorkingDay) return false

      // Check employee-specific blocked times
      const hasEmployeeBlock = professionalConfig.blockedTimes?.some(
        (bt) => bt.employeeId === emp.id && isDayBlocked(date, [bt], emp.id),
      )

      return !hasEmployeeBlock
    }) || []

  if (activeEmployees.length === 0) {
    return {
      ...defaultResponse,
      reason: "No employees available",
    }
  }

  // Count existing full-day bookings for this date
  const existingFullDayBookings = bookingData.filter((booking) => {
    if (!booking.booking_date_formatted || booking.booking_date_formatted !== date) return false
    if (!booking.start_formatted || !booking.end_formatted) return false

    // Check if this is a full-day booking (24 hours or spans entire working day)
    const startTime = timeToMinutes(booking.start_formatted)
    const endTime = timeToMinutes(booking.end_formatted)
    const duration = endTime - startTime

    // Consider it a full-day booking if it's 24 hours or more, or if it spans the entire working day
    const workingDayDuration = timeToMinutes(workingDay.end) - timeToMinutes(workingDay.start)
    return duration >= 1440 || duration >= workingDayDuration * 0.8 // 80% of working day
  })

  console.log(`[calculateDayAvailability] Found ${existingFullDayBookings.length} existing full-day bookings`)

  // Get capacity rules
  const capacityRules = professionalConfig.capacityRules || {
    maxConcurrentBookings: 1,
    maxBookingsPerDay: 10,
    allowOverlapping: false,
    bufferTimeBetweenBookings: 0,
    requireAllEmployeesForService: false,
  }

  const maxConcurrent = Math.min(capacityRules.maxConcurrentBookings, activeEmployees.length)
  const availableSlots = Math.max(0, maxConcurrent - existingFullDayBookings.length)

  console.log(
    `[calculateDayAvailability] Capacity: ${maxConcurrent}, Existing: ${existingFullDayBookings.length}, Available: ${availableSlots}`,
  )

  return {
    availableSlots,
    totalCapacity: maxConcurrent,
    workingEmployees: activeEmployees,
    existingBookingsCount: existingFullDayBookings.length,
    reason: availableSlots > 0 ? "Available" : "Fully booked",
  }
}

// Main calculation function for time-based slots (unchanged functionality)
export const calculateAvailableSlots = (
  config: ProfessionalConfig | null,
  workingDays: WorkingDay[],
  date: string, // YYYY-MM-DD
  startTime: string, // H:MM AM/PM
  endTime: string, // H:MM AM/PM
  dayName: string, // "Monday", "Tuesday", etc.
  existingBookings: BookingData[],
): {
  availableSlots: number
  totalCapacity: number
  workingEmployees: Employee[]
  existingBookingsCount: number
  reason: string
} => {
  console.log(`[calculateAvailableSlots] Checking slot: ${date} ${startTime}-${endTime} (${dayName})`)

  const slotStartMinutes = timeToMinutes(startTime)
  const slotEndMinutes = timeToMinutes(endTime)

  // --- Default behavior if no config is provided ---
  if (!config) {
    console.log("[calculateAvailableSlots] No professional config provided. Using default logic.")
    const workingDay = workingDays.find((wd) => wd.day === dayName && wd.isWorking)
    if (!workingDay) {
      return {
        availableSlots: 0,
        totalCapacity: 0,
        workingEmployees: [],
        existingBookingsCount: 0,
        reason: "Not a working day",
      }
    }

    const workStartMinutes = timeToMinutes(workingDay.start)
    const workEndMinutes = timeToMinutes(workingDay.end)

    if (slotStartMinutes < workStartMinutes || slotEndMinutes > workEndMinutes) {
      return {
        availableSlots: 0,
        totalCapacity: 0,
        workingEmployees: [],
        existingBookingsCount: 0,
        reason: "Outside working hours",
      }
    }

    const overlappingBookings = existingBookings.filter((booking) => {
      if (booking.booking_date_formatted !== date || !booking.start || !booking.end) return false
      const bookingStart = new Date(booking.start)
      const bookingEnd = new Date(booking.end)
      const bookingStartMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes()
      const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes()
      return slotStartMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes
    })

    const available = overlappingBookings.length === 0 ? 1 : 0
    return {
      availableSlots: available,
      totalCapacity: 1,
      workingEmployees: [],
      existingBookingsCount: overlappingBookings.length,
      reason: available ? "Available" : "Slot is booked",
    }
  }

  // --- Advanced calculation with ProfessionalConfig ---
  console.log("[calculateAvailableSlots] Using professional config:", {
    employees: config.employees.length,
    rules: config.capacityRules,
    blocks: config.blockedTimes.length,
  })

  const { employees, capacityRules, blockedTimes } = config

  // Layer 1: Find employees scheduled to work at this time
  const activeEmployees = employees.filter((emp) => emp.isActive)
  const employeesWorkingThisSlot = activeEmployees.filter((emp) => {
    const empWorkingDay = emp.workingDays.find((wd) => wd.day === dayName)
    if (!empWorkingDay || !empWorkingDay.isWorking) return false
    const empWorkStart = timeToMinutes(empWorkingDay.startTime)
    const empWorkEnd = timeToMinutes(empWorkingDay.endTime)
    return slotStartMinutes >= empWorkStart && slotEndMinutes <= empWorkEnd
  })

  if (employeesWorkingThisSlot.length === 0) {
    return {
      availableSlots: 0,
      totalCapacity: 0,
      workingEmployees: [],
      existingBookingsCount: 0,
      reason: "No employees scheduled for this slot",
    }
  }

  // Layer 2: Check for employee-specific blocked times (global blocks are pre-filtered)
  const employeesAfterBlocks = employeesWorkingThisSlot.filter((emp) => {
    // Only check employee-specific blocks since global blocks are already filtered out
    const isEmployeeBlocked = isTimeSlotBlocked(date, startTime, endTime, blockedTimes, emp.id)
    return !isEmployeeBlocked
  })

  if (employeesAfterBlocks.length === 0) {
    return {
      availableSlots: 0,
      totalCapacity: 0,
      workingEmployees: [],
      existingBookingsCount: 0,
      reason: "Slot is blocked for all available employees",
    }
  }

  // Layer 3: Apply capacity rules
  const baseCapacity = employeesAfterBlocks.length
  const finalCapacity = Math.min(baseCapacity, capacityRules.maxConcurrentBookings)
  console.log(
    `[calculateAvailableSlots] Capacity check: ${employeesAfterBlocks.length} employees working -> final capacity of ${finalCapacity}`,
  )

  // Layer 4: Subtract existing bookings, accounting for buffer time
  const bufferMinutes = capacityRules.bufferTimeBetweenBookings || 0
  const overlappingBookings = existingBookings.filter((booking) => {
    if (booking.booking_date_formatted !== date || !booking.start || !booking.end) return false
    const bookingStart = new Date(booking.start)
    const bookingEnd = new Date(booking.end)
    const bookingStartMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes()
    const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes()
    const effectiveBookingStart = bookingStartMinutes - bufferMinutes
    const effectiveBookingEnd = bookingEndMinutes + bufferMinutes
    return slotStartMinutes < effectiveBookingEnd && slotEndMinutes > effectiveBookingStart
  })

  console.log(`[calculateAvailableSlots] Found ${overlappingBookings.length} overlapping bookings (including buffer).`)

  const availableSlots = finalCapacity - overlappingBookings.length

  console.log(
    `[calculateAvailableSlots] Final calculation: capacity (${finalCapacity}) - bookings (${overlappingBookings.length}) = ${availableSlots} available`,
  )

  if (availableSlots <= 0) {
    return {
      availableSlots: 0,
      totalCapacity: finalCapacity,
      workingEmployees: employeesAfterBlocks,
      existingBookingsCount: overlappingBookings.length,
      reason: `Capacity of ${finalCapacity} filled by ${overlappingBookings.length} bookings`,
    }
  }

  return {
    availableSlots,
    totalCapacity: finalCapacity,
    workingEmployees: employeesAfterBlocks,
    existingBookingsCount: overlappingBookings.length,
    reason: "Available",
  }
}

// --- Other utility functions (unchanged) ---

export const loadProfessionalConfig = (professionalId: string): ProfessionalConfig | null => {
  try {
    const savedConfig = localStorage.getItem(`professional_config_${professionalId}`)
    if (savedConfig) {
      return JSON.parse(savedConfig)
    }
  } catch (error) {
    console.error("Error loading professional configuration:", error)
  }
  return null
}

export const saveProfessionalConfig = (config: ProfessionalConfig): boolean => {
  try {
    if (!config.professionalId) {
      console.error("Cannot save config without a professionalId.")
      return false
    }
    localStorage.setItem(`professional_config_${config.professionalId}`, JSON.stringify(config))
    console.log(`[saveProfessionalConfig] Configuration saved for ${config.professionalId}.`)
    return true
  } catch (error) {
    console.error("Error saving professional configuration:", error)
    return false
  }
}

import type { ProfessionalConfig, Employee, WorkingDay } from "@/types/professional-config"
import type { BookingData } from "@/types/schedule"
import type { Service } from "@/types/service"

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

// Main calculation function
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
  console.log("[calculateAvailableSlots] Input bookings for check:", existingBookings)

  const { employees, capacityRules, blockedTimes } = config

  // Layer 1: Find employees scheduled to work at this time
  const activeEmployees = employees.filter((emp) => emp.isActive)
  const employeesWorkingThisSlot = activeEmployees.filter((emp) => {
    const empWorkingDay = emp.workingDays.find((wd) => wd.day === dayName)
    if (!empWorkingDay || !empWorkingDay.isWorking) return false
    const empWorkStart = timeToMinutes(empWorkingDay.start)
    const empWorkEnd = timeToMinutes(empWorkingDay.end)
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

// --- Other utility functions ---

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

// New function for multi-day availability
export const calculateMultiDayAvailability = (
  config: ProfessionalConfig | null,
  existingBookings: BookingData[],
  startDate: Date,
  endDate: Date,
  service: Service,
): { available: boolean; reason: string } => {
  if (!config) {
    return { available: false, reason: "Professional configuration not available." }
  }

  const { employees, capacityRules, blockedTimes } = config
  const activeEmployees = employees.filter((emp) => emp.isActive)

  if (activeEmployees.length === 0) {
    return { available: false, reason: "No active employees available for this period." }
  }

  // Iterate through each day in the selected range
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const currentDateStr = d.toISOString().split("T")[0]
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" })

    // 1. Find employees working on this day
    const employeesWorkingToday = activeEmployees.filter((emp) => {
      const workingDay = emp.workingDays.find((wd) => wd.day === dayName)
      return workingDay?.isWorking
    })

    if (employeesWorkingToday.length === 0) {
      return { available: false, reason: `No employees are working on ${currentDateStr}.` }
    }

    // 2. Check for global blocked times on this day
    const isDayBlocked = blockedTimes.some(
      (block) => !block.employeeId && block.date === currentDateStr && block.isAllDay,
    )
    if (isDayBlocked) {
      return { available: false, reason: `The date ${currentDateStr} is blocked for all staff.` }
    }

    // 3. Check concurrent multi-day bookings
    const concurrentBookingsOnDay = existingBookings.filter((booking) => {
      // This check assumes multi-day bookings can be identified.
      // A future improvement would be a specific flag like `booking.all_day === 'yes'`.
      const bookingStart = new Date(booking.start!)
      const bookingEnd = new Date(booking.end!)
      const isMultiDayLike = bookingEnd.getTime() - bookingStart.getTime() > 12 * 60 * 60 * 1000

      return isMultiDayLike && bookingStart < new Date(d.getTime() + 24 * 60 * 60 * 1000) && bookingEnd > d
    })

    // 4. Check capacity
    const totalCapacity = capacityRules.maxConcurrentBookings
    const availableCapacity = totalCapacity - concurrentBookingsOnDay.length

    if (availableCapacity <= 0) {
      return {
        available: false,
        reason: `Not enough capacity on ${currentDateStr}. All ${totalCapacity} spaces are booked.`,
      }
    }
  }

  return { available: true, reason: "The selected dates are available for booking." }
}

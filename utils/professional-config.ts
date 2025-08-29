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
  const dateObj = new Date(`${date}T00:00:00`) // Use a specific time to avoid timezone issues

  return blockedTimes.some((block) => {
    // Determine if the block is relevant to the check
    if (employeeId) {
      // If checking for a specific employee, the block is relevant if it's global (no employeeId)
      // or if it's specifically for this employee.
      if (block.employeeId && block.employeeId.toString() !== employeeId.toString()) {
        return false // It's for a different employee, so we ignore it.
      }
    } else {
      // If checking globally (no employeeId), we only care about global blocks.
      if (block.employeeId) {
        return false // It's an employee-specific block, so we ignore it.
      }
    }

    // Check if the date matches
    let dateMatches = block.date === date
    if (!dateMatches && block.isRecurring) {
      const blockedDate = new Date(`${block.date}T00:00:00`)
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
  const slotStartMinutes = timeToMinutes(startTime)
  const slotEndMinutes = timeToMinutes(endTime)

  // --- Default behavior if no config is provided ---
  if (!config) {
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

    if (slotStartMinutes < workStartMinutes || slotStartMinutes >= workEndMinutes) {
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
      const bookingStartMinutes = bookingStart.getUTCHours() * 60 + bookingStart.getUTCMinutes()
      const bookingEndMinutes = bookingEnd.getUTCHours() * 60 + bookingEnd.getUTCMinutes()
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
  const { employees, capacityRules, blockedTimes } = config

  // Layer 1: Find employees scheduled to work at this time
  const activeEmployees = employees.filter((emp) => emp.isActive)
  const employeesWorkingThisSlot = activeEmployees.filter((emp) => {
    const empWorkingDay = emp.workingDays.find((wd) => wd.day === dayName)
    if (!empWorkingDay || !empWorkingDay.isWorking) return false
    const empWorkStart = timeToMinutes(empWorkingDay.start)
    const empWorkEnd = timeToMinutes(empWorkingDay.end)
    return slotStartMinutes >= empWorkStart && slotStartMinutes < empWorkEnd
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

  // Layer 2: Filter out employees who are blocked (personally or globally)
  const employeesAfterBlocks = employeesWorkingThisSlot.filter((emp) => {
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

  // Layer 4: Subtract existing bookings, accounting for buffer time
  const bufferMinutes = capacityRules.bufferTimeBetweenBookings || 0
  const overlappingBookings = existingBookings.filter((booking) => {
    if (booking.booking_date_formatted !== date || !booking.start || !booking.end) return false

    try {
      const bookingStart = new Date(booking.start)
      const bookingEnd = new Date(booking.end)

      // Convert UTC booking times to local minutes for comparison
      // The booking times are stored in UTC, but we need to compare them in local time
      const bookingStartMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes()
      const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes()

      const effectiveBookingStart = bookingStartMinutes - bufferMinutes
      const effectiveBookingEnd = bookingEndMinutes + bufferMinutes

      const hasOverlap = slotStartMinutes < effectiveBookingEnd && slotEndMinutes > effectiveBookingStart

      return hasOverlap
    } catch (error) {
      console.error(`Error processing booking ${booking.booking_id}:`, error)
      return false
    }
  })

  const availableSlots = finalCapacity - overlappingBookings.length

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
    return true
  } catch (error) {
    console.error("Error saving professional configuration:", error)
    return false
  }
}

// Corrected function for multi-day availability
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

  for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
    const currentDateStr = d.toISOString().split("T")[0]
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" })

    // 1. Find employees scheduled to work on this day.
    const employeesWorkingToday = activeEmployees.filter((emp) => {
      const workingDay = emp.workingDays.find((wd) => wd.day === dayName)
      return workingDay?.isWorking
    })

    if (employeesWorkingToday.length === 0) {
      return { available: false, reason: `No employees are working on ${currentDateStr}.` }
    }

    // 2. Filter out employees who have a specific all-day block.
    const employeesAvailableAfterBlocks = employeesWorkingToday.filter((emp) => {
      const isEmployeeBlocked = blockedTimes.some((block) => {
        const isAllDayBlock = block.isAllDay || (block.startTime === "00:00:00" && block.endTime === "23:59:00")
        return block.employeeId === emp.id && block.date === currentDateStr && isAllDayBlock
      })
      return !isEmployeeBlocked
    })

    if (employeesAvailableAfterBlocks.length === 0 && employeesWorkingToday.length > 0) {
      return { available: false, reason: `All available staff are blocked on ${currentDateStr}.` }
    }

    // 3. Check for a global (non-employee-specific) all-day block.
    const isDayBlockedGlobally = blockedTimes.some((block) => {
      const isAllDayBlock = block.isAllDay || (block.startTime === "00:00:00" && block.endTime === "23:59:00")
      return !block.employeeId && block.date === currentDateStr && isAllDayBlock
    })

    if (isDayBlockedGlobally) {
      return { available: false, reason: `The date ${currentDateStr} is blocked for all staff.` }
    }

    // 4. Determine capacity based on overnight capacity settings or regular capacity
    let dayCapacity: number
    if (capacityRules.concurrent_overnight_capacity === true && typeof capacityRules.overnight_capacity === "number") {
      // Use overnight capacity for multi-day bookings when enabled
      dayCapacity = Math.min(employeesAvailableAfterBlocks.length, capacityRules.overnight_capacity)
    } else {
      // Fall back to regular capacity rules
      dayCapacity = Math.min(employeesAvailableAfterBlocks.length, capacityRules.maxConcurrentBookings)
    }

    // 5. Count concurrent multi-day bookings that overlap with the current day.
    const concurrentBookingsOnDay = existingBookings.filter((booking) => {
      if (!booking.all_day || !booking.start || !booking.end) return false
      const bookingStart = new Date(booking.start)
      const bookingEnd = new Date(booking.end)
      return bookingStart.getTime() <= d.getTime() && bookingEnd.getTime() > d.getTime()
    })

    // 6. Check if capacity is exceeded.
    const availableCapacity = dayCapacity - concurrentBookingsOnDay.length

    if (availableCapacity <= 0) {
      return {
        available: false,
        reason: `Not enough capacity on ${currentDateStr}. All ${dayCapacity} spaces are booked.`,
      }
    }
  }

  return { available: true, reason: "The selected dates are available for booking." }
}

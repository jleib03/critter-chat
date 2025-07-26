import type { ProfessionalConfig, Employee, WorkingDay } from "@/types/professional-config"
import type { BookingData } from "@/types/schedule"

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
  const { employees, capacityRules, blockedTimes } = config

  // Layer 1: Find employees scheduled to work at this time
  const activeEmployees = employees.filter((emp) => emp.isActive)
  const employeesWorkingThisDay = activeEmployees.filter((emp) => {
    const empWorkingDay = emp.workingDays.find((wd) => wd.day === dayName)
    return empWorkingDay && empWorkingDay.isWorking
  })

  if (employeesWorkingThisDay.length === 0) {
    return {
      availableSlots: 0,
      totalCapacity: 0,
      workingEmployees: [],
      existingBookingsCount: 0,
      reason: "No employees scheduled",
    }
  }

  const employeesWorkingThisSlot = employeesWorkingThisDay.filter((emp) => {
    const empWorkingDay = emp.workingDays.find((wd) => wd.day === dayName)!
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
      reason: "Outside all employee hours",
    }
  }

  // Layer 2: Check for blocked times (global and employee-specific)
  const dateObj = new Date(date)
  const employeesAfterBlocks = employeesWorkingThisSlot.filter((emp) => {
    const isBlocked = blockedTimes.some((block) => {
      if (block.employeeId && block.employeeId !== emp.id) return false // Block is for someone else

      let dateMatches = block.date === date
      if (block.isRecurring) {
        const blockedDate = new Date(block.date)
        if (block.recurrencePattern === "weekly") dateMatches = dateObj.getDay() === blockedDate.getDay()
        if (block.recurrencePattern === "monthly") dateMatches = dateObj.getDate() === blockedDate.getDate()
      }
      if (!dateMatches) return false

      const blockStart = timeToMinutes(block.startTime)
      const blockEnd = timeToMinutes(block.endTime)
      return slotStartMinutes < blockEnd && slotEndMinutes > blockStart
    })
    return !isBlocked
  })

  if (employeesAfterBlocks.length === 0) {
    return {
      availableSlots: 0,
      totalCapacity: 0,
      workingEmployees: [],
      existingBookingsCount: 0,
      reason: "Slot is blocked",
    }
  }

  // Layer 3: Apply capacity rules
  const baseCapacity = employeesAfterBlocks.length
  const finalCapacity = Math.min(baseCapacity, capacityRules.maxConcurrentBookings)

  // Layer 4: Subtract existing bookings
  const overlappingBookings = existingBookings.filter((booking) => {
    if (booking.booking_date_formatted !== date || !booking.start || !booking.end) return false
    const bookingStart = new Date(booking.start)
    const bookingEnd = new Date(booking.end)
    const bookingStartMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes()
    const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes()
    return slotStartMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes
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

// --- Other utility functions from the original file ---

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
    localStorage.setItem(`professional_config_${config.professionalId}`, JSON.stringify(config))
    return true
  } catch (error) {
    console.error("Error saving professional configuration:", error)
    return false
  }
}

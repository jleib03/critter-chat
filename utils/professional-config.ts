import type { ProfessionalConfig, Employee } from "@/types/professional-config"

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

export const getActiveEmployees = (config: ProfessionalConfig): Employee[] => {
  return config.employees.filter((emp) => emp.isActive)
}

export const getEmployeeWorkingHours = (employee: Employee, dayName: string) => {
  const workingDay = employee.workingDays.find((wd) => wd.day === dayName)
  return workingDay && workingDay.isWorking ? { start: workingDay.start, end: workingDay.end } : null
}

export const isTimeBlocked = (
  config: ProfessionalConfig,
  date: string,
  startTime: string,
  endTime: string,
  employeeId?: string,
): boolean => {
  const dateObj = new Date(date)

  return config.blockedTimes.some((blockedTime) => {
    // Check if this blocked time applies to the specific employee or all employees
    if (blockedTime.employeeId && employeeId && blockedTime.employeeId !== employeeId) {
      return false
    }

    // Check date match (including recurring patterns)
    let dateMatches = false

    if (blockedTime.isRecurring) {
      const blockedDate = new Date(blockedTime.date)
      if (blockedTime.recurrencePattern === "weekly") {
        dateMatches = dateObj.getDay() === blockedDate.getDay()
      } else if (blockedTime.recurrencePattern === "monthly") {
        dateMatches = dateObj.getDate() === blockedDate.getDate()
      }
    } else {
      dateMatches = blockedTime.date === date
    }

    if (!dateMatches) return false

    // Check time overlap
    const blockedStart = timeToMinutes(blockedTime.startTime)
    const blockedEnd = timeToMinutes(blockedTime.endTime)
    const slotStart = timeToMinutes(startTime)
    const slotEnd = timeToMinutes(endTime)

    return slotStart < blockedEnd && slotEnd > blockedStart
  })
}

export const getEmployeesWorkingAtTime = (
  config: ProfessionalConfig,
  date: string,
  startTime: string,
  endTime: string,
  dayName: string,
): Employee[] => {
  const activeEmployees = getActiveEmployees(config)

  return activeEmployees.filter((employee) => {
    // Check if employee works on this day
    const workingHours = getEmployeeWorkingHours(employee, dayName)
    if (!workingHours) return false

    // Check if the time slot fits within working hours
    const workStart = timeToMinutes(workingHours.start)
    const workEnd = timeToMinutes(workingHours.end)
    const slotStart = timeToMinutes(startTime)
    const slotEnd = timeToMinutes(endTime)

    if (slotStart < workStart || slotEnd > workEnd) return false

    // Check if time is blocked for this employee
    if (isTimeBlocked(config, date, startTime, endTime, employee.id)) return false

    return true
  })
}

export const calculateAvailableSlots = (
  config: ProfessionalConfig,
  date: string,
  startTime: string,
  endTime: string,
  dayName: string,
  existingBookings: any[] = [],
): {
  availableSlots: number
  totalCapacity: number
  workingEmployees: Employee[]
  existingBookingsCount: number
  capacityBreakdown: {
    employeesWorking: number
    capacityLimit: number
    finalCapacity: number
    existingBookings: number
    availableSlots: number
  }
  reason?: string
} => {
  // LAYER 1: Find employees working at this specific time
  const workingEmployees = getEmployeesWorkingAtTime(config, date, startTime, endTime, dayName)
  let employeesWorkingCount = workingEmployees.length

  // If no employees are configured, assume 1 person (the professional) is working
  if (employeesWorkingCount === 0 && config.employees.length === 0) {
    employeesWorkingCount = 1
  }

  if (employeesWorkingCount === 0) {
    return {
      availableSlots: 0,
      totalCapacity: 0,
      workingEmployees: [],
      existingBookingsCount: 0,
      capacityBreakdown: {
        employeesWorking: 0,
        capacityLimit: 0,
        finalCapacity: 0,
        existingBookings: 0,
        availableSlots: 0,
      },
      reason: "No employees working at this time",
    }
  }

  const { capacityRules } = config

  // LAYER 2: Apply capacity constraints
  let finalCapacity = employeesWorkingCount

  // Constraint 1: Require all employees for service
  if (capacityRules.requireAllEmployeesForService) {
    const allActiveEmployees = getActiveEmployees(config)
    if (workingEmployees.length < allActiveEmployees.length) {
      return {
        availableSlots: 0,
        totalCapacity: 0,
        workingEmployees,
        existingBookingsCount: 0,
        capacityBreakdown: {
          employeesWorking: employeesWorkingCount,
          capacityLimit: allActiveEmployees.length,
          finalCapacity: 0,
          existingBookings: 0,
          availableSlots: 0,
        },
        reason: "All team members required but not all are working at this time",
      }
    }
  }

  // Constraint 2: Max concurrent bookings limit
  if (capacityRules.maxConcurrentBookings > 0) {
    finalCapacity = Math.min(finalCapacity, capacityRules.maxConcurrentBookings)
  }

  // LAYER 3: Count existing bookings that overlap with this time slot
  const slotStart = timeToMinutes(startTime)
  const slotEnd = timeToMinutes(endTime)

  const overlappingBookings = existingBookings.filter((booking) => {
    if (booking.booking_date_formatted !== date) return false
    if (!booking.start || !booking.end || !booking.booking_id) return false

    const bookingStart = new Date(booking.start)
    const bookingEnd = new Date(booking.end)

    const bookingStartMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes()
    const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes()

    const slotStartMinutes = timeToMinutes(startTime)
    const slotEndMinutes = timeToMinutes(endTime)

    return slotStartMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes
  })

  const existingBookingsCount = overlappingBookings.length

  // LAYER 4: Apply additional business rule constraints

  // Constraint 3: Daily booking limit
  const dailyBookings = existingBookings.filter(
    (booking) => booking.booking_date_formatted === date && booking.booking_id !== null,
  )

  if (dailyBookings.length >= capacityRules.maxBookingsPerDay) {
    return {
      availableSlots: 0,
      totalCapacity: finalCapacity,
      workingEmployees,
      existingBookingsCount,
      capacityBreakdown: {
        employeesWorking: employeesWorkingCount,
        capacityLimit: capacityRules.maxConcurrentBookings,
        finalCapacity,
        existingBookings: existingBookingsCount,
        availableSlots: 0,
      },
      reason: `Daily booking limit (${capacityRules.maxBookingsPerDay}) reached`,
    }
  }

  // Constraint 4: Buffer time conflicts
  if (capacityRules.bufferTimeBetweenBookings > 0) {
    const hasBufferConflict = existingBookings.some((booking) => {
      if (booking.booking_date_formatted !== date) return false
      if (!booking.start || !booking.end || !booking.booking_id) return false

      const bookingStart = new Date(booking.start)
      const bookingEnd = new Date(booking.end)
      const bookingStartMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes()
      const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes()

      const bufferBefore = slotStart - capacityRules.bufferTimeBetweenBookings
      const bufferAfter = slotEnd + capacityRules.bufferTimeBetweenBookings

      return (
        (bookingEndMinutes > bufferBefore && bookingEndMinutes <= slotStart) ||
        (bookingStartMinutes >= slotEnd && bookingStartMinutes < bufferAfter)
      )
    })

    if (hasBufferConflict) {
      return {
        availableSlots: 0,
        totalCapacity: finalCapacity,
        workingEmployees,
        existingBookingsCount,
        capacityBreakdown: {
          employeesWorking: employeesWorkingCount,
          capacityLimit: capacityRules.maxConcurrentBookings,
          finalCapacity,
          existingBookings: existingBookingsCount,
          availableSlots: 0,
        },
        reason: `Buffer time of ${capacityRules.bufferTimeBetweenBookings} minutes required between bookings`,
      }
    }
  }

  // FINAL CALCULATION: Available slots = Final capacity - Existing bookings
  const availableSlots = Math.max(0, finalCapacity - existingBookingsCount)

  return {
    availableSlots,
    totalCapacity: finalCapacity,
    workingEmployees,
    existingBookingsCount,
    capacityBreakdown: {
      employeesWorking: employeesWorkingCount,
      capacityLimit: capacityRules.maxConcurrentBookings,
      finalCapacity,
      existingBookings: existingBookingsCount,
      availableSlots,
    },
  }
}

export const canAccommodateBooking = (
  config: ProfessionalConfig,
  date: string,
  startTime: string,
  endTime: string,
  dayName: string,
  existingBookings: any[] = [],
): { canBook: boolean; availableEmployees: Employee[]; reason?: string } => {
  const slotInfo = calculateAvailableSlots(config, date, startTime, endTime, dayName, existingBookings)

  return {
    canBook: slotInfo.availableSlots > 0,
    availableEmployees: slotInfo.workingEmployees,
    reason: slotInfo.reason,
  }
}

// Helper: convert either "HH:MM" or "H:MM AM/PM" → minutes past midnight
const timeToMinutes = (timeStr: string): number => {
  const hasPeriod = timeStr.toUpperCase().includes("AM") || timeStr.toUpperCase().includes("PM")

  if (hasPeriod) {
    // Handle "1:30 PM" format
    const [time, period] = timeStr.trim().split(" ")
    const [rawHours, rawMinutes] = time.split(":")
    let hours = Number(rawHours)
    const minutes = Number(rawMinutes)

    if (period.toUpperCase() === "PM" && hours < 12) hours += 12
    if (period.toUpperCase() === "AM" && hours === 12) hours = 0

    return hours * 60 + minutes
  }

  // Fallback "13:30" format
  const [hours, minutes] = timeStr.split(":").map(Number)
  return hours * 60 + minutes
}

// Helper function to convert minutes to time string
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}

export const calculateDefaultAvailableSlots = (
  date: string,
  startTime: string,
  endTime: string,
  dayName: string,
  workingDays: any[],
  existingBookings: any[] = [],
): {
  availableSlots: number
  totalCapacity: number
  workingEmployees: any[]
  existingBookingsCount: number
  capacityBreakdown: {
    employeesWorking: number
    capacityLimit: number
    finalCapacity: number
    existingBookings: number
    availableSlots: number
  }
  reason?: string
} => {
  // Check if the professional is working on this day
  const workingDay = workingDays.find((wd) => wd.day === dayName && wd.isWorking)

  if (!workingDay) {
    return {
      availableSlots: 0,
      totalCapacity: 0,
      workingEmployees: [],
      existingBookingsCount: 0,
      capacityBreakdown: {
        employeesWorking: 0,
        capacityLimit: 0,
        finalCapacity: 0,
        existingBookings: 0,
        availableSlots: 0,
      },
      reason: "Professional not working on this day",
    }
  }

  // Check if the time slot fits within working hours
  const workStart = timeToMinutes(workingDay.start)
  const workEnd = timeToMinutes(workingDay.end)
  const slotStart = timeToMinutes(startTime)
  const slotEnd = timeToMinutes(endTime)

  if (slotStart < workStart || slotEnd > workEnd) {
    return {
      availableSlots: 0,
      totalCapacity: 0,
      workingEmployees: [],
      existingBookingsCount: 0,
      capacityBreakdown: {
        employeesWorking: 0,
        capacityLimit: 0,
        finalCapacity: 0,
        existingBookings: 0,
        availableSlots: 0,
      },
      reason: "Time slot outside working hours",
    }
  }

  // Default capacity of 1 (the professional)
  const finalCapacity = 1

  // Count existing bookings that overlap with this time slot
  const overlappingBookings = existingBookings.filter((booking) => {
    if (booking.booking_date_formatted !== date) return false
    if (!booking.start || !booking.end || !booking.booking_id) return false

    const bookingStart = new Date(booking.start)
    const bookingEnd = new Date(booking.end)

    const bookingStartMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes()
    const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes()

    const slotStartMinutes = timeToMinutes(startTime)
    const slotEndMinutes = timeToMinutes(endTime)

    return slotStartMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes
  })

  const existingBookingsCount = overlappingBookings.length
  const availableSlots = Math.max(0, finalCapacity - existingBookingsCount)

  return {
    availableSlots,
    totalCapacity: finalCapacity,
    workingEmployees: [{ id: "default", name: "Professional", isDefault: true }],
    existingBookingsCount,
    capacityBreakdown: {
      employeesWorking: 1,
      capacityLimit: 1,
      finalCapacity,
      existingBookings: existingBookingsCount,
      availableSlots,
    },
  }
}

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

export const getAvailableEmployeesForTimeSlot = (
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

export const canAccommodateBooking = (
  config: ProfessionalConfig,
  date: string,
  startTime: string,
  endTime: string,
  dayName: string,
  existingBookings: any[] = [],
): { canBook: boolean; availableEmployees: Employee[]; reason?: string } => {
  const availableEmployees = getAvailableEmployeesForTimeSlot(config, date, startTime, endTime, dayName)

  if (availableEmployees.length === 0) {
    return {
      canBook: false,
      availableEmployees: [],
      reason: "No employees available for this time slot",
    }
  }

  // Check capacity rules
  const { capacityRules } = config

  // Check if we require all employees for service
  if (capacityRules.requireAllEmployeesForService) {
    const allActiveEmployees = getActiveEmployees(config)
    if (availableEmployees.length < allActiveEmployees.length) {
      return {
        canBook: false,
        availableEmployees,
        reason: "All team members required but not all are available",
      }
    }
  }

  // Check concurrent bookings limit
  const slotStart = timeToMinutes(startTime)
  const slotEnd = timeToMinutes(endTime)

  const concurrentBookings = existingBookings.filter((booking) => {
    if (booking.booking_date_formatted !== date) return false

    const bookingStart = new Date(booking.start)
    const bookingEnd = new Date(booking.end)
    const bookingStartMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes()
    const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes()

    return slotStart < bookingEndMinutes && slotEnd > bookingStartMinutes
  })

  if (concurrentBookings.length >= capacityRules.maxConcurrentBookings) {
    return {
      canBook: false,
      availableEmployees,
      reason: `Maximum concurrent bookings (${capacityRules.maxConcurrentBookings}) reached`,
    }
  }

  // Check daily booking limit
  const dailyBookings = existingBookings.filter(
    (booking) => booking.booking_date_formatted === date && booking.booking_id !== null,
  )

  if (dailyBookings.length >= capacityRules.maxBookingsPerDay) {
    return {
      canBook: false,
      availableEmployees,
      reason: `Daily booking limit (${capacityRules.maxBookingsPerDay}) reached`,
    }
  }

  // Check buffer time
  if (capacityRules.bufferTimeBetweenBookings > 0) {
    const hasBufferConflict = existingBookings.some((booking) => {
      if (booking.booking_date_formatted !== date) return false

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
        canBook: false,
        availableEmployees,
        reason: `Buffer time of ${capacityRules.bufferTimeBetweenBookings} minutes required between bookings`,
      }
    }
  }

  return {
    canBook: true,
    availableEmployees,
  }
}

// Helper function to convert time string to minutes
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number)
  return hours * 60 + minutes
}

// Helper function to convert minutes to time string
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}

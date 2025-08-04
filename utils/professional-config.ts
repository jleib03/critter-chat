import type { ProfessionalConfig, BlockedTime } from "@/types/professional-config"
import type { WorkingDay, BookingData, Service } from "@/types/schedule"

export function timeToMinutes(timeStr: string): number {
  const [time, period] = timeStr.split(" ")
  const [hours, minutes] = time.split(":").map(Number)
  let totalMinutes = hours * 60 + minutes

  if (period === "PM" && hours !== 12) {
    totalMinutes += 12 * 60
  } else if (period === "AM" && hours === 12) {
    totalMinutes = minutes
  }

  return totalMinutes
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 === 0 ? 12 : hours % 12
  return `${displayHours}:${mins.toString().padStart(2, "0")} ${period}`
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

export function isTimeSlotBlocked(
  date: string,
  startTime: string,
  endTime: string,
  blockedTimes: BlockedTime[],
  employeeId?: string,
): boolean {
  if (!blockedTimes || blockedTimes.length === 0) return false

  const slotDate = new Date(date)
  const slotStartMinutes = timeToMinutes(startTime)
  const slotEndMinutes = timeToMinutes(endTime)

  for (const blockedTime of blockedTimes) {
    // Skip if this is an employee-specific block and we're checking global blocks
    if (blockedTime.employee_id && !employeeId) continue
    if (employeeId && blockedTime.employee_id !== employeeId) continue

    const blockStart = new Date(blockedTime.start_date)
    const blockEnd = new Date(blockedTime.end_date)

    // Check if the slot date falls within the blocked date range
    if (slotDate >= blockStart && slotDate <= blockEnd) {
      // If it's an all-day block, the entire day is blocked
      if (blockedTime.is_all_day) {
        return true
      }

      // Check time overlap for partial day blocks
      if (blockedTime.start_time && blockedTime.end_time) {
        const blockStartMinutes = timeToMinutes(blockedTime.start_time)
        const blockEndMinutes = timeToMinutes(blockedTime.end_time)

        // Check if there's any overlap between slot time and blocked time
        if (slotStartMinutes < blockEndMinutes && slotEndMinutes > blockStartMinutes) {
          return true
        }
      }
    }

    // Handle recurring blocked times
    if (blockedTime.is_recurring && blockedTime.recurrence_pattern) {
      // For now, handle weekly recurrence
      if (blockedTime.recurrence_pattern === "weekly") {
        const dayOfWeek = slotDate.getDay()
        const blockDayOfWeek = blockStart.getDay()

        if (dayOfWeek === blockDayOfWeek) {
          if (blockedTime.is_all_day) {
            return true
          }

          if (blockedTime.start_time && blockedTime.end_time) {
            const blockStartMinutes = timeToMinutes(blockedTime.start_time)
            const blockEndMinutes = timeToMinutes(blockedTime.end_time)

            if (slotStartMinutes < blockEndMinutes && slotEndMinutes > blockStartMinutes) {
              return true
            }
          }
        }
      }
    }
  }

  return false
}

// New function to check if a full day is blocked
export function isDayBlocked(date: string, blockedTimes: BlockedTime[], employeeId?: string): boolean {
  if (!blockedTimes || blockedTimes.length === 0) return false

  const checkDate = new Date(date)

  for (const blockedTime of blockedTimes) {
    // Skip if this is an employee-specific block and we're checking global blocks
    if (blockedTime.employee_id && !employeeId) continue
    if (employeeId && blockedTime.employee_id !== employeeId) continue

    const blockStart = new Date(blockedTime.start_date)
    const blockEnd = new Date(blockedTime.end_date)

    // Check if the date falls within the blocked date range
    if (checkDate >= blockStart && checkDate <= blockEnd) {
      // If it's an all-day block, the entire day is blocked
      if (blockedTime.is_all_day) {
        return true
      }
    }

    // Handle recurring blocked times
    if (blockedTime.is_recurring && blockedTime.recurrence_pattern) {
      if (blockedTime.recurrence_pattern === "weekly") {
        const dayOfWeek = checkDate.getDay()
        const blockDayOfWeek = blockStart.getDay()

        if (dayOfWeek === blockDayOfWeek && blockedTime.is_all_day) {
          return true
        }
      }
    }
  }

  return false
}

// New function to calculate day-level availability for full-day services
export function calculateDayAvailability(
  professionalConfig: ProfessionalConfig | null,
  workingDays: WorkingDay[],
  date: string,
  dayOfWeek: string,
  bookingData: BookingData[],
): {
  availableSlots: number
  totalCapacity: number
  availableEmployees: number
  employeeNames: string
  existingBookingsCount: number
  reason: string
} {
  // Default response
  const defaultResponse = {
    availableSlots: 0,
    totalCapacity: 0,
    availableEmployees: 0,
    employeeNames: "",
    existingBookingsCount: 0,
    reason: "No configuration available",
  }

  if (!professionalConfig) {
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

  // Check if the day is blocked
  if (professionalConfig.blockedTimes && isDayBlocked(date, professionalConfig.blockedTimes)) {
    return {
      ...defaultResponse,
      reason: "Day is blocked",
    }
  }

  // Count existing full-day bookings for this date
  const existingFullDayBookings = bookingData.filter((booking) => {
    if (!booking.booking_date || !booking.start_formatted || !booking.end_formatted) return false

    const bookingDate = booking.booking_date.split("T")[0]
    if (bookingDate !== date) return false

    // Check if this is a full-day booking (24 hours or spans entire working day)
    const startTime = timeToMinutes(booking.start_formatted)
    const endTime = timeToMinutes(booking.end_formatted)
    const duration = endTime - startTime

    // Consider it a full-day booking if it's 24 hours or more
    return duration >= 1440 // 24 hours in minutes
  }).length

  // Get capacity rules
  const capacityRules = professionalConfig.capacityRules || {
    maxConcurrentBookings: 1,
    maxBookingsPerDay: 10,
    allowOverlapping: false,
    bufferTimeBetweenBookings: 0,
    requireAllEmployeesForService: false,
  }

  const maxConcurrent = capacityRules.maxConcurrentBookings || 1
  const availableSlots = Math.max(0, maxConcurrent - existingFullDayBookings)

  // Get active employees for this day
  const activeEmployees =
    professionalConfig.employees?.filter(
      (emp) => emp.isActive && emp.workingDays?.some((wd) => wd.day === dayOfWeek && wd.isWorking),
    ) || []

  return {
    availableSlots,
    totalCapacity: maxConcurrent,
    availableEmployees: activeEmployees.length,
    employeeNames: activeEmployees.map((emp) => emp.name).join(", "),
    existingBookingsCount: existingFullDayBookings,
    reason: availableSlots > 0 ? "Available" : "Fully booked",
  }
}

export function calculateAvailableSlots(
  professionalConfig: ProfessionalConfig | null,
  workingDays: WorkingDay[],
  date: string,
  startTime: string,
  endTime: string,
  dayOfWeek: string,
  bookingData: BookingData[],
): {
  availableSlots: number
  totalCapacity: number
  availableEmployees: number
  employeeNames: string
  existingBookingsCount: number
  reason: string
} {
  // Default response structure
  const defaultResponse = {
    availableSlots: 0,
    totalCapacity: 0,
    availableEmployees: 0,
    employeeNames: "",
    existingBookingsCount: 0,
    reason: "No configuration available",
  }

  if (!professionalConfig) {
    return defaultResponse
  }

  // Layer 1: Check if it's a working day
  const workingDay = workingDays.find((wd) => wd.day === dayOfWeek && wd.isWorking)
  if (!workingDay) {
    return {
      ...defaultResponse,
      reason: "Not a working day",
    }
  }

  // Layer 2: Check employee-specific blocked times (global blocks are pre-filtered)
  const employeeSpecificBlocks = professionalConfig.blockedTimes?.filter((bt) => bt.employee_id) || []

  // Layer 3: Get capacity rules
  const capacityRules = professionalConfig.capacityRules || {
    maxConcurrentBookings: 1,
    maxBookingsPerDay: 10,
    allowOverlapping: false,
    bufferTimeBetweenBookings: 0,
    requireAllEmployeesForService: false,
  }

  // Layer 4: Count existing bookings that overlap with this time slot
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  const overlappingBookings = bookingData.filter((booking) => {
    if (!booking.booking_date || !booking.start_formatted || !booking.end_formatted) return false

    // Check if booking is on the same date
    const bookingDate = booking.booking_date.split("T")[0]
    if (bookingDate !== date) return false

    // Check time overlap
    const bookingStart = timeToMinutes(booking.start_formatted)
    const bookingEnd = timeToMinutes(booking.end_formatted)

    // Two time ranges overlap if: start1 < end2 && start2 < end1
    return startMinutes < bookingEnd && bookingStart < endMinutes
  })

  // Layer 5: Calculate available capacity
  const maxConcurrent = capacityRules.maxConcurrentBookings || 1
  const existingBookingsCount = overlappingBookings.length
  let availableSlots = Math.max(0, maxConcurrent - existingBookingsCount)

  // Layer 6: Check employee availability
  const activeEmployees =
    professionalConfig.employees?.filter((emp) => {
      if (!emp.isActive) return false

      // Check if employee works on this day
      const empWorkingDay = emp.workingDays?.find((wd) => wd.day === dayOfWeek && wd.isWorking)
      if (!empWorkingDay) return false

      // Check if employee has any specific blocked times for this slot
      const hasEmployeeBlock = employeeSpecificBlocks.some(
        (bt) => bt.employee_id === emp.employeeId && isTimeSlotBlocked(date, startTime, endTime, [bt], emp.employeeId),
      )

      return !hasEmployeeBlock
    }) || []

  // If no employees are available, no slots available
  if (activeEmployees.length === 0) {
    availableSlots = 0
  }

  // Layer 7: Apply buffer time constraints
  const bufferMinutes = capacityRules.bufferTimeBetweenBookings || 0
  if (bufferMinutes > 0 && overlappingBookings.length > 0) {
    // Check if any existing booking violates buffer time
    const hasBufferConflict = overlappingBookings.some((booking) => {
      const bookingStart = timeToMinutes(booking.start_formatted!)
      const bookingEnd = timeToMinutes(booking.end_formatted!)

      // Check if new slot is too close to existing booking
      return (
        (startMinutes >= bookingEnd && startMinutes < bookingEnd + bufferMinutes) ||
        (endMinutes <= bookingStart && endMinutes > bookingStart - bufferMinutes)
      )
    })

    if (hasBufferConflict) {
      availableSlots = 0
    }
  }

  // Determine reason
  let reason = "Available"
  if (availableSlots === 0) {
    if (activeEmployees.length === 0) {
      reason = "No available employees"
    } else if (existingBookingsCount >= maxConcurrent) {
      reason = "Fully booked"
    } else {
      reason = "Buffer time conflict"
    }
  }

  return {
    availableSlots,
    totalCapacity: maxConcurrent,
    availableEmployees: activeEmployees.length,
    employeeNames: activeEmployees.map((emp) => emp.name).join(", "),
    existingBookingsCount,
    reason,
  }
}

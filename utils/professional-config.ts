import type { ProfessionalConfig, BlockedTime } from "@/types/professional-config"
import type { BookingData, WorkingDay, Service } from "@/types/schedule"

// --- Local Storage ---
export const saveProfessionalConfig = (config: ProfessionalConfig) => {
  try {
    const configString = JSON.stringify(config)
    localStorage.setItem(`professionalConfig_${config.professionalId}`, configString)
  } catch (error) {
    console.error("Error saving professional config to local storage:", error)
  }
}

export const loadProfessionalConfig = (professionalId: string): ProfessionalConfig | null => {
  try {
    const configString = localStorage.getItem(`professionalConfig_${professionalId}`)
    if (configString) {
      return JSON.parse(configString)
    }
    return null
  } catch (error) {
    console.error("Error loading professional config from local storage:", error)
    return null
  }
}

// --- Time Utilities ---
export const timeToMinutes = (time: string): number => {
  if (!time || !time.includes(":")) return 0
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

// --- Availability Calculation ---

/**
 * Checks if a specific time slot is blocked by any of the professional's blocked times.
 */
export const isTimeSlotBlocked = (
  dateStr: string,
  startTime: string,
  endTime: string,
  blockedTimes: BlockedTime[],
): boolean => {
  if (!blockedTimes) return false

  const slotStartMinutes = timeToMinutes(convertTo24Hour(startTime))
  const slotEndMinutes = timeToMinutes(convertTo24Hour(endTime))

  for (const block of blockedTimes) {
    if (block.date === dateStr) {
      const blockStartMinutes = timeToMinutes(block.startTime)
      const blockEndMinutes = timeToMinutes(block.endTime)

      // Check for overlap
      if (slotStartMinutes < blockEndMinutes && slotEndMinutes > blockStartMinutes) {
        return true
      }
    }
  }
  return false
}

/**
 * Converts AM/PM time string to 24-hour format string.
 */
const convertTo24Hour = (timeStr: string): string => {
  const [time, period] = timeStr.split(" ")
  let [hours, minutes] = time.split(":").map(Number)

  if (period.toLowerCase() === "pm" && hours !== 12) {
    hours += 12
  } else if (period.toLowerCase() === "am" && hours === 12) {
    hours = 0
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

/**
 * Calculates the number of available slots for a given time, considering capacity and existing bookings.
 */
export const calculateAvailableSlots = (
  config: ProfessionalConfig | null,
  workingDays: WorkingDay[],
  dateStr: string,
  startTime: string,
  endTime: string,
  dayName: string,
  bookingData: BookingData[],
) => {
  if (!config) {
    return { availableSlots: 0, reason: "Configuration not loaded" }
  }

  const { employees, capacityRules } = config
  const workingDay = workingDays.find((wd) => wd.day === dayName && wd.isWorking)

  if (!workingDay) {
    return { availableSlots: 0, reason: "Not a working day" }
  }

  const slotStartMinutes = timeToMinutes(convertTo24Hour(startTime))
  const slotEndMinutes = timeToMinutes(convertTo24Hour(endTime))

  // Filter for employees who are active and working on this day
  const availableEmployees = employees.filter((emp) => {
    const empWorkingDay = emp.workingDays.find((wd) => wd.day === dayName)
    return emp.isActive && empWorkingDay?.isWorking
  })

  if (availableEmployees.length === 0) {
    return { availableSlots: 0, reason: "No employees available" }
  }

  // Check for employee-specific blocked times
  const employeesBlocked = availableEmployees.filter((emp) => {
    return config.blockedTimes?.some(
      (block) =>
        block.employeeId === emp.id &&
        block.date === dateStr &&
        slotStartMinutes < timeToMinutes(block.endTime) &&
        slotEndMinutes > timeToMinutes(block.startTime),
    )
  })

  const finalAvailableEmployees = availableEmployees.filter((emp) => !employeesBlocked.find((be) => be.id === emp.id))

  if (finalAvailableEmployees.length === 0) {
    return { availableSlots: 0, reason: "All available employees are blocked" }
  }

  // Count existing bookings that overlap with the slot
  const overlappingBookings = bookingData.filter((booking) => {
    if (booking.booking_date_formatted !== dateStr) return false
    const bookingStartMinutes = timeToMinutes(convertTo24Hour(booking.start_formatted!))
    const bookingEndMinutes = timeToMinutes(convertTo24Hour(booking.end_formatted!))
    return slotStartMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes
  })

  const totalCapacity = capacityRules.maxConcurrentBookings * finalAvailableEmployees.length
  const availableSlots = totalCapacity - overlappingBookings.length

  return {
    availableSlots: Math.max(0, availableSlots),
    totalCapacity: totalCapacity,
    availableEmployees: finalAvailableEmployees.length,
    employeeNames: finalAvailableEmployees.map((e) => e.name).join(", "),
    existingBookingsCount: overlappingBookings.length,
    reason:
      availableSlots > 0
        ? "Slots available"
        : overlappingBookings.length >= totalCapacity
          ? "At capacity"
          : "Availability issue",
  }
}

/**
 * Calculates availability for a multi-day booking period.
 */
export const calculateMultiDayAvailability = (
  config: ProfessionalConfig,
  bookingData: BookingData[],
  startDate: Date,
  endDate: Date,
  service: Service,
): { available: boolean; reason: string } => {
  const { employees, capacityRules, blockedTimes } = config

  // Get all active employees who can perform this service
  const servicePerformingEmployees = employees.filter(
    (emp) => emp.isActive && (emp.services.includes(service.service_id) || emp.services.includes(service.name)),
  )

  if (servicePerformingEmployees.length === 0) {
    return { available: false, reason: `No employees are available to perform ${service.name}.` }
  }

  const currentDate = new Date(startDate)
  currentDate.setHours(0, 0, 0, 0)

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0]
    const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" })

    // 1. Check if any service-performing employees are working on this day
    const workingEmployeesOnDay = servicePerformingEmployees.filter((emp) =>
      emp.workingDays.some((wd) => wd.day === dayName && wd.isWorking),
    )

    if (workingEmployeesOnDay.length === 0) {
      return {
        available: false,
        reason: `No staff available for ${service.name} on ${currentDate.toLocaleDateString()}.`,
      }
    }

    // 2. Check for all-day blocks for the *working* employees
    const employeesWithAllDayBlock = workingEmployeesOnDay.filter((emp) =>
      blockedTimes.some(
        (block) =>
          block.date === dateStr &&
          block.isAllDay &&
          (block.employeeId === emp.id || block.employeeId === null || block.employeeId === undefined),
      ),
    )

    if (employeesWithAllDayBlock.length >= workingEmployeesOnDay.length) {
      return {
        available: false,
        reason: `The facility is fully booked or closed on ${currentDate.toLocaleDateString()}.`,
      }
    }

    // 3. Check capacity against existing multi-day bookings
    const concurrentBookingsOnDay = bookingData.filter((booking) => {
      if (!booking.all_day || !booking.start || !booking.end) return false
      const bookingStart = new Date(booking.start)
      bookingStart.setHours(0, 0, 0, 0)
      const bookingEnd = new Date(booking.end)
      bookingEnd.setHours(0, 0, 0, 0)
      return currentDate >= bookingStart && currentDate <= bookingEnd
    }).length

    const maxCapacity =
      capacityRules.maxConcurrentBookings * (workingEmployeesOnDay.length - employeesWithAllDayBlock.length)

    if (concurrentBookingsOnDay >= maxCapacity) {
      return {
        available: false,
        reason: `We are at full capacity for overnight stays on ${currentDate.toLocaleDateString()}.`,
      }
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return { available: true, reason: "The selected dates are available for booking." }
}

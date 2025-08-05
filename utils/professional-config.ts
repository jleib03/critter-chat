import type { ProfessionalConfig } from "@/types/professional-config"
import type { BookingData, Service } from "@/types/schedule"

const STORAGE_KEY_PREFIX = "professional_config_"

export function saveProfessionalConfig(config: ProfessionalConfig): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${config.professionalId}`
    localStorage.setItem(key, JSON.stringify(config))
    console.log("Professional config saved:", config.professionalId)
  } catch (error) {
    console.error("Error saving professional config:", error)
  }
}

export function loadProfessionalConfig(professionalId: string): ProfessionalConfig | null {
  try {
    const key = `${STORAGE_KEY_PREFIX}${professionalId}`
    const stored = localStorage.getItem(key)
    if (stored) {
      const config = JSON.parse(stored) as ProfessionalConfig
      console.log("Professional config loaded:", config.professionalId)
      return config
    }
  } catch (error) {
    console.error("Error loading professional config:", error)
  }
  return null
}

export function deleteProfessionalConfig(professionalId: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${professionalId}`
    localStorage.removeItem(key)
    console.log("Professional config deleted:", professionalId)
  } catch (error) {
    console.error("Error deleting professional config:", error)
  }
}

export function calculateMultiDayAvailability(
  config: ProfessionalConfig,
  existingBookings: BookingData[],
  startDate: Date,
  endDate: Date,
  service: Service,
): { available: boolean; reason?: string } {
  // Check if we have active employees
  const activeEmployees = config.employees.filter((emp) => emp.isActive)
  if (activeEmployees.length === 0) {
    return { available: false, reason: "No active employees available." }
  }

  // Check if any employees can provide this service
  const serviceCapableEmployees = activeEmployees.filter((emp) => emp.services.includes(service.name))
  if (serviceCapableEmployees.length === 0) {
    return { available: false, reason: "No employees available for this service." }
  }

  // Check each day in the range
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" })

    // Check if any employees are working on this day
    const workingEmployees = serviceCapableEmployees.filter((emp) => {
      const workingDay = emp.workingDays.find((wd) => wd.day === dayName)
      return workingDay?.isWorking
    })

    if (workingEmployees.length === 0) {
      return {
        available: false,
        reason: `No employees available on ${dayName}, ${currentDate.toLocaleDateString()}.`,
      }
    }

    // Check for blocked times on this day
    const dateStr = currentDate.toISOString().split("T")[0]
    const blockedOnThisDay = config.blockedTimes.filter((bt) => bt.date === dateStr)

    // If there are blocked times that affect all working employees, it's not available
    const allEmployeesBlocked = workingEmployees.every((emp) =>
      blockedOnThisDay.some((bt) => !bt.employeeId || bt.employeeId === emp.id),
    )

    if (allEmployeesBlocked && blockedOnThisDay.length > 0) {
      return {
        available: false,
        reason: `All employees are blocked on ${currentDate.toLocaleDateString()}.`,
      }
    }

    // Check for existing bookings that would conflict
    const conflictingBookings = existingBookings.filter((booking) => {
      if (!booking.start || !booking.end) return false

      const bookingStart = new Date(booking.start)
      const bookingEnd = new Date(booking.end)
      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)

      // Check if booking overlaps with this day
      return bookingStart <= dayEnd && bookingEnd >= dayStart
    })

    // If we require all employees for the service and there are any bookings, it's not available
    if (config.capacityRules.requireAllEmployeesForService && conflictingBookings.length > 0) {
      return {
        available: false,
        reason: `Service requires all employees but there are existing bookings on ${currentDate.toLocaleDateString()}.`,
      }
    }

    // Check capacity limits
    if (conflictingBookings.length >= config.capacityRules.maxConcurrentBookings) {
      return {
        available: false,
        reason: `Maximum concurrent bookings reached on ${currentDate.toLocaleDateString()}.`,
      }
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return { available: true, reason: "Available for the entire duration." }
}

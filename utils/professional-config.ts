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

// Helper: convert minutes back to time string
export const minutesToTime = (minutes: number, format12Hour = true): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (format12Hour) {
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    const period = hours < 12 ? "AM" : "PM"
    return `${hour12}:${mins.toString().padStart(2, "0")} ${period}`
  } else {
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
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
  const dateObj = new Date(`${date}T00:00:00`)

  return blockedTimes.some((block) => {
    // Determine if the block is relevant to the check
    if (employeeId) {
      if (block.employeeId && block.employeeId.toString() !== employeeId.toString()) {
        return false
      }
    } else {
      if (block.employeeId) {
        return false
      }
    }

    // Check if the date matches (including recurring patterns)
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

    // Check if the time overlaps (block must overlap with the ENTIRE slot)
    const blockStart = timeToMinutes(block.startTime)
    const blockEnd = timeToMinutes(block.endTime)
    return slotStartMinutes < blockEnd && slotEndMinutes > blockStart
  })
}

// Calculate service duration in minutes
export const calculateServiceDuration = (services: Service[]): number => {
  let totalDurationMinutes = 0
  services.forEach((service) => {
    let durationInMinutes = service.duration_number
    const unit = service.duration_unit.toLowerCase()
    if (unit.startsWith("hour")) durationInMinutes = service.duration_number * 60
    else if (unit.startsWith("day")) durationInMinutes = service.duration_number * 24 * 60
    totalDurationMinutes += durationInMinutes
  })
  return totalDurationMinutes
}

// Generate all possible time slots for a day based on working hours and service duration
export const generatePossibleSlots = (
  workingDays: WorkingDay[],
  dayName: string,
  serviceDurationMinutes: number,
  slotIntervalMinutes = 30, // Default 30-minute intervals
): { startTime: string; endTime: string; startMinutes: number; endMinutes: number }[] => {
  const workingDay = workingDays.find((wd) => wd.day === dayName && wd.isWorking)
  if (!workingDay) return []

  const workStartMinutes = timeToMinutes(workingDay.start)
  const workEndMinutes = timeToMinutes(workingDay.end)
  const slots: { startTime: string; endTime: string; startMinutes: number; endMinutes: number }[] = []

  // Generate slots at regular intervals
  for (
    let startMinutes = workStartMinutes;
    startMinutes + serviceDurationMinutes <= workEndMinutes;
    startMinutes += slotIntervalMinutes
  ) {
    const endMinutes = startMinutes + serviceDurationMinutes
    slots.push({
      startTime: minutesToTime(startMinutes),
      endTime: minutesToTime(endMinutes),
      startMinutes,
      endMinutes,
    })
  }

  console.log(`📅 Generated ${slots.length} possible slots for ${dayName} (${serviceDurationMinutes}min service)`)
  return slots
}

// Check if employees have capacity for the entire duration of a slot
export const checkEmployeeCapacityForSlot = (
  employees: Employee[],
  dayName: string,
  slotStartMinutes: number,
  slotEndMinutes: number,
  date: string,
  blockedTimes: any[],
  capacityRules: any,
  selectedServices?: Service[],
): {
  availableEmployees: Employee[]
  totalCapacity: number
  reason: string
} => {
  console.log(`👥 Checking employee capacity for slot ${slotStartMinutes}-${slotEndMinutes} on ${dayName}`)

  // Step 1: Find active employees
  const activeEmployees = employees.filter((emp) => emp.isActive)
  console.log(`👥 Active employees: ${activeEmployees.length}`)

  // Step 2: Find employees working the entire slot duration
  const employeesWorkingEntireSlot = activeEmployees.filter((emp) => {
    const empWorkingDay = emp.workingDays.find((wd) => wd.day === dayName)
    if (!empWorkingDay || !empWorkingDay.isWorking) {
      console.log(`👤 ${emp.name} not working on ${dayName}`)
      return false
    }

    const empWorkStart = timeToMinutes(empWorkingDay.start)
    const empWorkEnd = timeToMinutes(empWorkingDay.end)

    // Employee must be available for the ENTIRE slot duration
    const canWorkEntireSlot = slotStartMinutes >= empWorkStart && slotEndMinutes <= empWorkEnd
    console.log(`👤 ${emp.name} working ${empWorkStart}-${empWorkEnd}, can work entire slot: ${canWorkEntireSlot}`)
    return canWorkEntireSlot
  })

  if (employeesWorkingEntireSlot.length === 0) {
    return {
      availableEmployees: [],
      totalCapacity: 0,
      reason: "No employees available for entire slot duration",
    }
  }

  // Step 3: Filter out blocked employees
  const employeesAfterBlocks = employeesWorkingEntireSlot.filter((emp) => {
    const startTime = minutesToTime(slotStartMinutes)
    const endTime = minutesToTime(slotEndMinutes)
    const isBlocked = isTimeSlotBlocked(date, startTime, endTime, blockedTimes, emp.id)
    if (isBlocked) {
      console.log(`🚫 ${emp.name} is blocked for this slot`)
    }
    return !isBlocked
  })

  if (employeesAfterBlocks.length === 0) {
    return {
      availableEmployees: [],
      totalCapacity: 0,
      reason: "All employees are blocked for this slot",
    }
  }

  // Step 4: Check service requirements
  if (selectedServices && selectedServices.length > 0) {
    const employeesWhoCanPerformServices = employeesAfterBlocks.filter((emp) => {
      // If employee has no specific services listed, assume they can do all
      if (!emp.services || emp.services.length === 0) return true

      // Check if employee can perform all selected services
      return selectedServices.every(
        (service) => emp.services.includes(service.name) || emp.services.includes(service.service_id),
      )
    })

    if (employeesWhoCanPerformServices.length === 0) {
      return {
        availableEmployees: [],
        totalCapacity: 0,
        reason: "No employees can perform the selected services",
      }
    }

    // Update available employees list
    employeesAfterBlocks.splice(0, employeesAfterBlocks.length, ...employeesWhoCanPerformServices)
  }

  // Step 5: Apply capacity rules
  let totalCapacity = employeesAfterBlocks.length

  if (capacityRules.requireAllEmployeesForService && selectedServices && selectedServices.length > 0) {
    // All available employees must work together
    totalCapacity = 1
    console.log(`🔧 Service requires all employees working together, capacity set to 1`)
  } else {
    // Apply max concurrent bookings limit
    totalCapacity = Math.min(totalCapacity, capacityRules.maxConcurrentBookings)
    console.log(
      `📊 Capacity: ${employeesAfterBlocks.length} employees, max concurrent: ${capacityRules.maxConcurrentBookings}, final: ${totalCapacity}`,
    )
  }

  return {
    availableEmployees: employeesAfterBlocks,
    totalCapacity,
    reason: "Available",
  }
}

// Check how many bookings overlap with a specific slot
export const countOverlappingBookings = (
  date: string,
  slotStartMinutes: number,
  slotEndMinutes: number,
  existingBookings: BookingData[],
  bufferMinutes = 0,
): { count: number; overlappingBookings: BookingData[] } => {
  const overlappingBookings = existingBookings.filter((booking) => {
    if (booking.booking_date_formatted !== date || !booking.start || !booking.end) return false

    try {
      const bookingStart = new Date(booking.start)
      const bookingEnd = new Date(booking.end)
      const bookingStartMinutes = bookingStart.getUTCHours() * 60 + bookingStart.getUTCMinutes()
      const bookingEndMinutes = bookingEnd.getUTCHours() * 60 + bookingEnd.getUTCMinutes()

      // Apply buffer time
      const effectiveBookingStart = bookingStartMinutes - bufferMinutes
      const effectiveBookingEnd = bookingEndMinutes + bufferMinutes

      // Check for overlap
      const overlaps = slotStartMinutes < effectiveBookingEnd && slotEndMinutes > effectiveBookingStart

      if (overlaps) {
        console.log(
          `📋 Booking overlaps: ${bookingStartMinutes}-${bookingEndMinutes} (with buffer: ${effectiveBookingStart}-${effectiveBookingEnd})`,
        )
      }

      return overlaps
    } catch (e) {
      console.error("❌ Error parsing booking time", booking, e)
      return false
    }
  })

  return {
    count: overlappingBookings.length,
    overlappingBookings,
  }
}

// Main function - Generate available slots for a day
export const generateAvailableSlots = (
  config: ProfessionalConfig | null,
  workingDays: WorkingDay[],
  date: string,
  dayName: string,
  existingBookings: BookingData[],
  selectedServices: Service[],
  slotIntervalMinutes = 30,
): {
  availableSlots: { startTime: string; endTime: string; capacity: number }[]
  totalPossibleSlots: number
  reason: string
} => {
  console.log(`🔍 Generating available slots for ${date} (${dayName})`)
  console.log(`🛠️ Selected services: ${selectedServices.map((s) => s.name).join(", ")}`)

  // Calculate total service duration
  const serviceDurationMinutes = calculateServiceDuration(selectedServices)
  console.log(`⏱️ Total service duration: ${serviceDurationMinutes} minutes`)

  // Generate all possible slots based on working hours and service duration
  const possibleSlots = generatePossibleSlots(workingDays, dayName, serviceDurationMinutes, slotIntervalMinutes)

  if (possibleSlots.length === 0) {
    return {
      availableSlots: [],
      totalPossibleSlots: 0,
      reason: "No working hours available for this day",
    }
  }

  // If no config, use simple logic
  if (!config) {
    console.log("⚠️ No professional config, using simple availability logic")
    const availableSlots = possibleSlots
      .filter((slot) => {
        const { count } = countOverlappingBookings(date, slot.startMinutes, slot.endMinutes, existingBookings)
        return count === 0
      })
      .map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: 1,
      }))

    return {
      availableSlots,
      totalPossibleSlots: possibleSlots.length,
      reason: availableSlots.length > 0 ? "Available slots found" : "All slots are booked",
    }
  }

  // Advanced logic with professional config
  const { capacityRules, blockedTimes } = config
  const bufferMinutes = capacityRules.bufferTimeBetweenBookings || 0

  const availableSlots: { startTime: string; endTime: string; capacity: number }[] = []

  for (const slot of possibleSlots) {
    // Check employee capacity for this slot
    const employeeCapacity = checkEmployeeCapacityForSlot(
      config.employees,
      dayName,
      slot.startMinutes,
      slot.endMinutes,
      date,
      blockedTimes,
      capacityRules,
      selectedServices,
    )

    if (employeeCapacity.totalCapacity === 0) {
      console.log(`❌ Slot ${slot.startTime}-${slot.endTime}: ${employeeCapacity.reason}`)
      continue
    }

    // Check existing bookings
    const { count: overlappingCount } = countOverlappingBookings(
      date,
      slot.startMinutes,
      slot.endMinutes,
      existingBookings,
      bufferMinutes,
    )

    const availableCapacity = employeeCapacity.totalCapacity - overlappingCount

    if (availableCapacity > 0) {
      availableSlots.push({
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: availableCapacity,
      })
      console.log(`✅ Slot ${slot.startTime}-${slot.endTime}: ${availableCapacity} capacity available`)
    } else {
      console.log(
        `❌ Slot ${slot.startTime}-${slot.endTime}: No capacity (${employeeCapacity.totalCapacity} total - ${overlappingCount} booked)`,
      )
    }
  }

  return {
    availableSlots,
    totalPossibleSlots: possibleSlots.length,
    reason: availableSlots.length > 0 ? `${availableSlots.length} slots available` : "No available slots",
  }
}

// Legacy function for backward compatibility
export const calculateAvailableSlots = (
  config: ProfessionalConfig | null,
  workingDays: WorkingDay[],
  date: string,
  startTime: string,
  endTime: string,
  dayName: string,
  existingBookings: BookingData[],
  selectedServices?: Service[],
): {
  availableSlots: number
  totalCapacity: number
  workingEmployees: Employee[]
  existingBookingsCount: number
  reason: string
} => {
  console.log(`🔍 Legacy calculateAvailableSlots called for ${date} ${startTime}-${endTime}`)

  const services = selectedServices || []
  const slotResults = generateAvailableSlots(config, workingDays, date, dayName, existingBookings, services)

  // Find the specific slot requested
  const requestedSlot = slotResults.availableSlots.find(
    (slot) => slot.startTime === startTime && slot.endTime === endTime,
  )

  if (requestedSlot) {
    return {
      availableSlots: requestedSlot.capacity,
      totalCapacity: requestedSlot.capacity,
      workingEmployees: config?.employees.filter((emp) => emp.isActive) || [],
      existingBookingsCount: 0, // This would need to be calculated separately if needed
      reason: "Available",
    }
  } else {
    return {
      availableSlots: 0,
      totalCapacity: 0,
      workingEmployees: [],
      existingBookingsCount: 0,
      reason: "Slot not available",
    }
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

// Multi-day availability calculation (unchanged as requested)
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

    // 4. Determine capacity based on employees who are actually available.
    const dayCapacity = Math.min(employeesAvailableAfterBlocks.length, capacityRules.maxConcurrentBookings)

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

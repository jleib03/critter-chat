import type { ProfessionalConfig, Employee, WorkingDay } from "@/types/professional-config"
import type { BookingData } from "@/types/schedule"
import type { Service } from "@/types/service"

// Debug function to log all relevant data
export const debugAvailabilityCalculation = (
  date: string,
  dayName: string,
  workingDays: WorkingDay[],
  existingBookings: BookingData[],
  selectedServices: Service[],
) => {
  console.log(`\n🔍 DEBUG AVAILABILITY CALCULATION FOR ${date} (${dayName})`)
  console.log("📋 Working Days:", workingDays)
  console.log("📅 All Existing Bookings:", existingBookings.length)
  console.log("🎯 Selected Services:", selectedServices)
  console.log(
    "📊 Bookings for this date:",
    existingBookings.filter((b) => b.booking_date_formatted === date),
  )

  // Check if working day exists
  const workingDay = workingDays.find((wd) => wd.day === dayName && wd.isWorking)
  console.log("⏰ Working day found:", workingDay)

  return true
}

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

// SIMPLIFIED: Generate available slots for a day
export const generateAvailableSlots = (
  config: ProfessionalConfig | null,
  workingDays: WorkingDay[],
  date: string,
  dayName: string,
  existingBookings: BookingData[],
  selectedServices: Service[],
): {
  availableSlots: { startTime: string; endTime: string; capacity: number }[]
  totalPossibleSlots: number
  reason: string
} => {
  // Add debug call at the very beginning
  debugAvailabilityCalculation(date, dayName, workingDays, existingBookings, selectedServices)

  console.log(`\n=== DEBUGGING ${date} (${dayName}) ===`)

  // Step 1: Get working hours
  const workingDay = workingDays.find((wd) => wd.day === dayName && wd.isWorking)
  if (!workingDay) {
    console.log(`❌ No working day found for ${dayName}`)
    console.log(
      "Available working days:",
      workingDays.map((wd) => `${wd.day}: ${wd.isWorking}`),
    )
    return {
      availableSlots: [],
      totalPossibleSlots: 0,
      reason: "Not a working day",
    }
  }

  const workStartMinutes = timeToMinutes(workingDay.start)
  const workEndMinutes = timeToMinutes(workingDay.end)
  console.log(
    `✅ Working hours: ${workingDay.start} to ${workingDay.end} (${workStartMinutes} to ${workEndMinutes} minutes)`,
  )

  // Step 2: Calculate service duration
  const serviceDurationMinutes = calculateServiceDuration(selectedServices)
  console.log(`✅ Service duration: ${serviceDurationMinutes} minutes`)

  if (serviceDurationMinutes === 0) {
    console.log(`❌ No services selected`)
    return {
      availableSlots: [],
      totalPossibleSlots: 0,
      reason: "No services selected",
    }
  }

  // Step 3: Get existing bookings for this date
  const dayBookings = existingBookings.filter((booking) => booking.booking_date_formatted === date)
  console.log(`📅 Found ${dayBookings.length} existing bookings for ${date}:`)

  // Convert bookings to time ranges in minutes
  const bookedRanges: { start: number; end: number; id: string }[] = []
  dayBookings.forEach((booking) => {
    if (booking.start && booking.end) {
      try {
        const startDate = new Date(booking.start)
        const endDate = new Date(booking.end)

        // Convert UTC to local minutes (assuming the booking times are in UTC)
        const startMinutes = startDate.getUTCHours() * 60 + startDate.getUTCMinutes()
        const endMinutes = endDate.getUTCHours() * 60 + endDate.getUTCMinutes()

        bookedRanges.push({
          start: startMinutes,
          end: endMinutes,
          id: booking.booking_id?.toString() || "unknown",
        })

        console.log(
          `   📋 Booking ${booking.booking_id}: ${minutesToTime(startMinutes)} - ${minutesToTime(endMinutes)}`,
        )
      } catch (error) {
        console.log(`   ❌ Error parsing booking ${booking.booking_id}:`, error)
      }
    }
  })

  // Step 4: Generate 15-minute slots and check availability
  const availableSlots: { startTime: string; endTime: string; capacity: number }[] = []
  let totalSlots = 0

  console.log(`\n🔍 Checking slots every 15 minutes...`)

  for (let slotStart = workStartMinutes; slotStart < workEndMinutes; slotStart += 15) {
    totalSlots++
    const slotEnd = slotStart + serviceDurationMinutes

    // Skip if service would extend beyond working hours
    if (slotEnd > workEndMinutes) {
      console.log(
        `   ⏰ Slot ${minutesToTime(slotStart)}: Service would end at ${minutesToTime(slotEnd)}, beyond work hours`,
      )
      continue
    }

    // Check if this slot conflicts with any existing booking
    let hasConflict = false
    for (const booking of bookedRanges) {
      // Check for overlap: slot overlaps with booking if slot_start < booking_end AND slot_end > booking_start
      if (slotStart < booking.end && slotEnd > booking.start) {
        console.log(
          `   ❌ Slot ${minutesToTime(slotStart)}-${minutesToTime(slotEnd)}: Conflicts with booking ${booking.id} (${minutesToTime(booking.start)}-${minutesToTime(booking.end)})`,
        )
        hasConflict = true
        break
      }
    }

    if (!hasConflict) {
      availableSlots.push({
        startTime: minutesToTime(slotStart),
        endTime: minutesToTime(slotEnd),
        capacity: 1,
      })
      console.log(`   ✅ Available slot: ${minutesToTime(slotStart)} - ${minutesToTime(slotEnd)}`)
    }
  }

  console.log(`\n📊 SUMMARY for ${date}:`)
  console.log(`   Total possible slots: ${totalSlots}`)
  console.log(`   Available slots: ${availableSlots.length}`)
  console.log(`   Booked ranges: ${bookedRanges.length}`)

  return {
    availableSlots,
    totalPossibleSlots: totalSlots,
    reason: availableSlots.length > 0 ? `${availableSlots.length} slots available` : "All slots are booked",
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
  const services = selectedServices || []
  if (services.length === 0) {
    return {
      availableSlots: 0,
      totalCapacity: 0,
      workingEmployees: [],
      existingBookingsCount: 0,
      reason: "No services selected",
    }
  }

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
      existingBookingsCount: 0,
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

// Generate all 15-minute time slots for a day
export const generateAllTimeSlots = (
  workingDays: WorkingDay[],
  dayName: string,
): { startTime: string; endTime: string; startMinutes: number; endMinutes: number }[] => {
  const workingDay = workingDays.find((wd) => wd.day === dayName && wd.isWorking)
  if (!workingDay) return []

  const workStartMinutes = timeToMinutes(workingDay.start)
  const workEndMinutes = timeToMinutes(workingDay.end)
  const slots: { startTime: string; endTime: string; startMinutes: number; endMinutes: number }[] = []

  // Generate 15-minute slots
  for (let startMinutes = workStartMinutes; startMinutes < workEndMinutes; startMinutes += 15) {
    const endMinutes = startMinutes + 15
    if (endMinutes <= workEndMinutes) {
      slots.push({
        startTime: minutesToTime(startMinutes),
        endTime: minutesToTime(endMinutes),
        startMinutes,
        endMinutes,
      })
    }
  }

  return slots
}

// Check if an employee can work the entire service duration starting at a specific time
export const canEmployeeWorkEntireService = (
  employee: Employee,
  dayName: string,
  serviceStartMinutes: number,
  serviceDurationMinutes: number,
  date: string,
  blockedTimes: any[],
): boolean => {
  // Check if employee is active
  if (!employee.isActive) return false

  // Check if employee works on this day
  const workingDay = employee.workingDays.find((wd) => wd.day === dayName)
  if (!workingDay || !workingDay.isWorking) return false

  const empWorkStart = timeToMinutes(workingDay.start)
  const empWorkEnd = timeToMinutes(workingDay.end)
  const serviceEndMinutes = serviceStartMinutes + serviceDurationMinutes

  // Employee must be available for the entire service duration
  if (serviceStartMinutes < empWorkStart || serviceEndMinutes > empWorkEnd) return false

  // Check if employee is blocked during the service time
  const serviceStartTime = minutesToTime(serviceStartMinutes)
  const serviceEndTime = minutesToTime(serviceEndMinutes)
  if (isTimeSlotBlocked(date, serviceStartTime, serviceEndTime, blockedTimes, employee.id)) return false

  return true
}

// Check if employees can perform the selected services
export const canEmployeesPerformServices = (employees: Employee[], services: Service[]): Employee[] => {
  return employees.filter((emp) => {
    // If employee has no specific services listed, assume they can do all
    if (!emp.services || emp.services.length === 0) return true

    // Check if employee can perform all selected services
    return services.every((service) => emp.services.includes(service.name) || emp.services.includes(service.service_id))
  })
}

// Count overlapping bookings for a specific time range
export const countOverlappingBookings = (
  date: string,
  startMinutes: number,
  endMinutes: number,
  existingBookings: BookingData[],
  bufferMinutes = 0,
): number => {
  return existingBookings.filter((booking) => {
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
      return startMinutes < effectiveBookingEnd && endMinutes > effectiveBookingStart
    } catch (e) {
      return false
    }
  }).length
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

// Multi-day availability calculation
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

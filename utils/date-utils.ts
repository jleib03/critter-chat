/**
 * Comprehensive date utilities for consistent date handling across the application
 * Always work with local dates for display and UTC for webhook communication
 */

/**
 * Format a Date object to YYYY-MM-DD string using local date components
 * This avoids timezone conversion issues
 */
export const formatDateForInput = (date: Date | null): string => {
  if (!date) return ""

  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")

  return `${year}-${month}-${day}`
}

/**
 * Create a Date object from YYYY-MM-DD string using local date components
 * This avoids timezone conversion issues
 */
export const createDateFromInput = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Get the day name for a given date
 */
export const getDayName = (date: Date): string => {
  return date.toLocaleDateString("en-US", { weekday: "long" })
}

/**
 * Format a date for display (e.g., "Monday, January 15, 2024")
 */
export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Format a date for display from YYYY-MM-DD string
 */
export const formatDateStringForDisplay = (dateString: string): string => {
  const date = createDateFromInput(dateString)
  return formatDateForDisplay(date)
}

/**
 * Convert time string (12-hour format) to 24-hour format
 */
export const convertTo24Hour = (timeStr: string): string => {
  const [time, period] = timeStr.split(" ")
  const [hours, minutes] = time.split(":").map(Number)

  let hour24 = hours
  if (period === "PM" && hours !== 12) {
    hour24 = hours + 12
  } else if (period === "AM" && hours === 12) {
    hour24 = 0
  }

  return `${hour24.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

/**
 * Convert 24-hour time to 12-hour format
 */
export const convertTo12Hour = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
}

/**
 * Convert local date and time to UTC ISO string for webhook
 */
export const convertLocalToUTC = (dateString: string, timeString: string): string => {
  try {
    const [year, month, day] = dateString.split("-").map(Number)
    const time24 = convertTo24Hour(timeString)
    const [hours, minutes] = time24.split(":").map(Number)

    // Create date in local timezone
    const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0)

    return localDate.toISOString()
  } catch (error) {
    console.error("Error converting local time to UTC:", error)
    throw error
  }
}

/**
 * Convert UTC ISO string to local date and time
 */
export const convertUTCToLocal = (utcString: string): { date: string; time: string } => {
  try {
    const utcDate = new Date(utcString)

    const date = formatDateForInput(utcDate)
    const time = convertTo12Hour(
      `${utcDate.getHours().toString().padStart(2, "0")}:${utcDate.getMinutes().toString().padStart(2, "0")}`,
    )

    return { date, time }
  } catch (error) {
    console.error("Error converting UTC to local:", error)
    throw error
  }
}

/**
 * Get user's timezone information
 */
export const getUserTimezone = () => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const now = new Date()
    const offsetMinutes = now.getTimezoneOffset()
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60)
    const offsetMins = Math.abs(offsetMinutes) % 60
    const offsetSign = offsetMinutes <= 0 ? "+" : "-"

    const hoursStr = offsetHours.toString().padStart(2, "0")
    const minsStr = offsetMins.toString().padStart(2, "0")
    const offsetString = `UTC${offsetSign}${hoursStr}:${minsStr}`

    return {
      timezone: timezone,
      offset: offsetString,
      offsetMinutes: offsetMinutes,
      timestamp: now.toISOString(),
      localTime: now.toLocaleString(),
    }
  } catch (error) {
    console.error("Error detecting timezone:", error)
    return {
      timezone: "UTC",
      offset: "UTC+00:00",
      offsetMinutes: 0,
      timestamp: new Date().toISOString(),
      localTime: new Date().toLocaleString(),
    }
  }
}

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

/**
 * Check if a date is in the past (before today)
 */
export const isPastDate = (date: Date): boolean => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

/**
 * Get the start of the week (Monday) for a given date
 */
export const getWeekStart = (date: Date): Date => {
  const dayOfWeek = date.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(date)
  monday.setDate(date.getDate() + mondayOffset)
  return monday
}

/**
 * Generate an array of dates for a week starting from a given date
 */
export const getWeekDates = (startDate: Date): Date[] => {
  const dates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    dates.push(date)
  }
  return dates
}

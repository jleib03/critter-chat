// Centralized date utilities for proper timezone handling
export class DateUtils {
  /**
   * Create a date from YYYY-MM-DD string in local timezone
   * This prevents timezone shifts when parsing date strings
   */
  static createLocalDate(dateString: string): Date {
    const [year, month, day] = dateString.split("-").map(Number)
    return new Date(year, month - 1, day)
  }

  /**
   * Format a date to YYYY-MM-DD string using local timezone
   */
  static formatLocalDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  /**
   * Convert local date and time to UTC ISO string for webhook
   */
  static convertLocalToUTC(dateString: string, timeString: string): string {
    const [year, month, day] = dateString.split("-").map(Number)

    // Parse time (handle both "2:30 PM" and "14:30" formats)
    let hours: number, minutes: number

    if (timeString.includes("AM") || timeString.includes("PM")) {
      const [time, period] = timeString.split(" ")
      const [h, m] = time.split(":").map(Number)
      hours = period === "PM" && h !== 12 ? h + 12 : period === "AM" && h === 12 ? 0 : h
      minutes = m
    } else {
      ;[hours, minutes] = timeString.split(":").map(Number)
    }

    // Create date in local timezone
    const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0)
    return localDate.toISOString()
  }

  /**
   * Convert UTC ISO string to local date components
   */
  static convertUTCToLocal(utcString: string): { date: string; time: string; dayOfWeek: string } {
    const utcDate = new Date(utcString)

    return {
      date: this.formatLocalDate(utcDate),
      time: utcDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      dayOfWeek: utcDate.toLocaleDateString("en-US", { weekday: "long" }),
    }
  }

  /**
   * Get day name for a local date string
   */
  static getDayName(dateString: string): string {
    const date = this.createLocalDate(dateString)
    return date.toLocaleDateString("en-US", { weekday: "long" })
  }

  /**
   * Format date for display (e.g., "Monday, January 15, 2024")
   */
  static formatDisplayDate(dateString: string): string {
    const date = this.createLocalDate(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  /**
   * Check if a date string represents today
   */
  static isToday(dateString: string): boolean {
    const today = this.formatLocalDate(new Date())
    return dateString === today
  }

  /**
   * Check if a date string represents a past date
   */
  static isPastDate(dateString: string): boolean {
    const today = this.formatLocalDate(new Date())
    return dateString < today
  }

  /**
   * Get current user timezone info
   */
  static getUserTimezone() {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const now = new Date()
      const offsetMinutes = now.getTimezoneOffset()
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60)
      const offsetMins = Math.abs(offsetMinutes) % 60
      const offsetSign = offsetMinutes <= 0 ? "+" : "-"

      return {
        timezone,
        offset: `UTC${offsetSign}${offsetHours.toString().padStart(2, "0")}:${offsetMins.toString().padStart(2, "0")}`,
        offsetMinutes,
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
}

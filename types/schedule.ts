export interface SelectedTimeSlot {
  date: string
  startTime: string
  endTime: string
  dayOfWeek: string
  endDate?: string // For multi-day bookings
  totalDays?: number // For multi-day bookings
}

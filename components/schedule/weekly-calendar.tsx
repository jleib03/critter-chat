"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Service, SelectedTimeSlot, WorkingDay, Booking } from "@/types/schedule"
import type { ProfessionalConfig } from "@/types/professional-config"
import type { BookingType, RecurringConfig } from "./booking-type-selection"

interface WeeklyCalendarProps {
  workingDays: WorkingDay[]
  bookingData: Booking[]
  selectedServices: Service[]
  onTimeSlotSelect: (slot: SelectedTimeSlot) => void
  selectedTimeSlot: SelectedTimeSlot | null
  professionalId: string
  professionalConfig: ProfessionalConfig | null
  bookingType: BookingType | null
  recurringConfig: RecurringConfig | null
}

export function WeeklyCalendar({
  workingDays,
  bookingData,
  selectedServices,
  onTimeSlotSelect,
  selectedTimeSlot,
  professionalConfig,
  bookingType,
  recurringConfig,
}: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  const handlePreviousWeek = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)
      newDate.setDate(newDate.getDate() - 7)
      return newDate
    })
  }

  const handleNextWeek = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)
      newDate.setDate(newDate.getDate() + 7)
      return newDate
    })
  }

  const generateWeekDates = (start: Date): Date[] => {
    const week = []
    const startDate = new Date(start)
    const dayOfWeek = startDate.getDay()
    startDate.setDate(startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)) // Start week on Monday

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      week.push(date)
    }
    return week
  }

  const weekDates = useMemo(() => generateWeekDates(currentDate), [currentDate])

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((total, service) => {
      let durationInMinutes = service.duration_number
      if (service.duration_unit === "Hours") {
        durationInMinutes *= 60
      } else if (service.duration_unit === "Days") {
        durationInMinutes *= 24 * 60
      }
      return total + durationInMinutes
    }, 0)
  }, [selectedServices])

  const calculateAvailableSlots = (date: Date): string[] => {
    if (!professionalConfig) return []

    const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
    const workingDay = workingDays.find((d) => d.day === dayName)

    if (!workingDay || !workingDay.isWorking) {
      return []
    }

    const slots: string[] = []
    const startTime = new Date(`${date.toDateString()} ${workingDay.start}`)
    const endTime = new Date(`${date.toDateString()} ${workingDay.end}`)
    const bufferTime = professionalConfig.capacityRules.bufferTimeBetweenBookings || 0

    const dateString = date.toISOString().split("T")[0]

    const todaysBookings = bookingData.filter((b) => b.booking_date_formatted === dateString)
    const todaysBlockedTimes = professionalConfig.blockedTimes.filter((bt) => bt.date === dateString)

    const currentTime = new Date(startTime)

    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + totalDuration * 60000)
      if (slotEnd > endTime) break

      let isAvailable = true

      // Check against existing bookings
      for (const booking of todaysBookings) {
        const bookingStart = new Date(booking.start)
        const bookingEnd = new Date(booking.end)
        if (currentTime < bookingEnd && slotEnd > bookingStart) {
          isAvailable = false
          break
        }
      }
      if (!isAvailable) {
        currentTime.setMinutes(currentTime.getMinutes() + 15)
        continue
      }

      // Check against blocked times
      for (const block of todaysBlockedTimes) {
        const blockStart = new Date(`${date.toDateString()} ${block.startTime}`)
        const blockEnd = new Date(`${date.toDateString()} ${block.endTime}`)
        if (currentTime < blockEnd && slotEnd > blockStart) {
          isAvailable = false
          break
        }
      }
      if (!isAvailable) {
        currentTime.setMinutes(currentTime.getMinutes() + 15)
        continue
      }

      // For recurring bookings, check all future occurrences
      if (bookingType === "recurring" && recurringConfig) {
        if (!isSlotValidForRecurring(currentTime, recurringConfig)) {
          isAvailable = false
        }
      }

      if (isAvailable) {
        slots.push(
          currentTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        )
      }

      currentTime.setMinutes(currentTime.getMinutes() + 15 + bufferTime)
    }

    return slots
  }

  const isSlotValidForRecurring = (slotStartDate: Date, config: RecurringConfig): boolean => {
    const recurringDates = []
    const start = new Date(slotStartDate)
    const endDate = new Date(config.endDate)
    let occurrenceCount = 0

    // Generate future dates, skipping the first one (which we are currently checking)
    const nextOccurrence = new Date(start)
    if (config.unit === "day") nextOccurrence.setDate(nextOccurrence.getDate() + config.frequency)
    if (config.unit === "week") nextOccurrence.setDate(nextOccurrence.getDate() + config.frequency * 7)
    if (config.unit === "month") nextOccurrence.setMonth(nextOccurrence.getMonth() + config.frequency)

    while (nextOccurrence <= endDate && occurrenceCount < config.totalAppointments - 1) {
      recurringDates.push(new Date(nextOccurrence))
      if (config.unit === "day") nextOccurrence.setDate(nextOccurrence.getDate() + config.frequency)
      if (config.unit === "week") nextOccurrence.setDate(nextOccurrence.getDate() + config.frequency * 7)
      if (config.unit === "month") nextOccurrence.setMonth(nextOccurrence.getMonth() + config.frequency)
      occurrenceCount++
    }

    for (const futureDate of recurringDates) {
      const dayName = futureDate.toLocaleDateString("en-US", { weekday: "long" })
      const workingDay = workingDays.find((d) => d.day === dayName)
      if (!workingDay || !workingDay.isWorking) return false

      const slotStartTime = new Date(futureDate)
      slotStartTime.setHours(slotStartDate.getHours(), slotStartDate.getMinutes(), slotStartDate.getSeconds())
      const slotEndTime = new Date(slotStartTime.getTime() + totalDuration * 60000)

      const dateString = futureDate.toISOString().split("T")[0]
      const futureBookings = bookingData.filter((b) => b.booking_date_formatted === dateString)
      const futureBlockedTimes = professionalConfig?.blockedTimes.filter((bt) => bt.date === dateString) || []

      for (const booking of futureBookings) {
        const bookingStart = new Date(booking.start)
        const bookingEnd = new Date(booking.end)
        if (slotStartTime < bookingEnd && slotEndTime > bookingStart) return false
      }

      for (const block of futureBlockedTimes) {
        const blockStart = new Date(`${dateString} ${block.startTime}`)
        const blockEnd = new Date(`${dateString} ${block.endTime}`)
        if (slotStartTime < blockEnd && slotEndTime > blockStart) return false
      }
    }

    return true
  }

  const availableSlotsByDate = useMemo(() => {
    setIsLoading(true)
    const slots: { [key: string]: string[] } = {}
    for (const date of weekDates) {
      const dateString = date.toISOString().split("T")[0]
      slots[dateString] = calculateAvailableSlots(date)
    }
    setIsLoading(false)
    return slots
  }, [weekDates, selectedServices, bookingData, professionalConfig, bookingType, recurringConfig, totalDuration])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold header-font">
          {weekDates[0].toLocaleString("default", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#E75837]" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date) => {
            const dateString = date.toISOString().split("T")[0]
            const slots = availableSlotsByDate[dateString] || []
            const isPast = date < today
            const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
            const workingDay = workingDays.find((d) => d.day === dayName)

            return (
              <div key={dateString} className="space-y-2">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                  <p className="text-lg font-semibold">{date.getDate()}</p>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto p-1">
                  {isPast ? (
                    <div className="text-center text-sm text-gray-400 py-4">Past</div>
                  ) : !workingDay || !workingDay.isWorking ? (
                    <div className="text-center text-sm text-gray-400 py-4">Closed</div>
                  ) : slots.length > 0 ? (
                    slots.map((slot) => (
                      <Button
                        key={slot}
                        variant={
                          selectedTimeSlot?.date === dateString && selectedTimeSlot?.startTime === slot
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "w-full",
                          selectedTimeSlot?.date === dateString && selectedTimeSlot?.startTime === slot
                            ? "bg-[#E75837] hover:bg-[#d14a2a] text-white"
                            : "",
                        )}
                        onClick={() =>
                          onTimeSlotSelect({
                            date: dateString,
                            startTime: slot,
                            dayOfWeek: date.toLocaleDateString("en-US", { weekday: "long" }),
                          })
                        }
                      >
                        {slot}
                      </Button>
                    ))
                  ) : (
                    <div className="text-center text-sm text-gray-400 py-4">No Slots</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

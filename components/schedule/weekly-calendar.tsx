"use client"

import { useState, useMemo } from "react"
import type { BookingData, WorkingDay, Service, SelectedTimeSlot } from "@/types/schedule"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Clock, ChevronDown, ChevronUp, Users, Calendar } from "lucide-react"
import {
  calculateAvailableSlots,
  timeToMinutes,
  isTimeSlotBlocked,
  hasFullDayServices,
  getTotalDurationInDays,
  calculateDayAvailability,
  isDayBlocked,
} from "@/utils/professional-config"
import type { ProfessionalConfig } from "@/types/professional-config"
import type { BookingType, RecurringConfig } from "./booking-type-selection"

type WeeklyCalendarProps = {
  workingDays: WorkingDay[]
  bookingData: BookingData[]
  selectedServices: Service[] | null
  onTimeSlotSelect: (slot: SelectedTimeSlot) => void
  selectedTimeSlot: SelectedTimeSlot | null
  professionalId: string
  professionalConfig: ProfessionalConfig | null
  bookingType?: BookingType
  recurringConfig?: RecurringConfig | null
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
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  // Detect if we're dealing with full-day services
  const isFullDayBooking = useMemo(() => hasFullDayServices(selectedServices), [selectedServices])
  const totalDays = useMemo(() => getTotalDurationInDays(selectedServices), [selectedServices])

  const getWeekDates = (startDate: Date) => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      return date
    })
  }

  const weekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart])

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7))
      return newDate
    })
    setExpandedDays(new Set())
  }

  const toggleDayExpansion = (dateStr: string) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr)
      } else {
        newSet.add(dateStr)
      }
      return newSet
    })
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" })
  }

  const getTotalServiceDurationInMinutes = (services: Service[] | null) => {
    if (!services) return 0
    return services.reduce((total, service) => {
      let duration = 0
      if (service.duration_unit === "Minutes") duration = service.duration_number
      else if (service.duration_unit === "Hours") duration = service.duration_number * 60
      else if (service.duration_unit === "Days") duration = service.duration_number * 24 * 60
      return total + duration
    }, 0)
  }

  const serviceDuration = useMemo(() => getTotalServiceDurationInMinutes(selectedServices), [selectedServices])

  const isSlotValidForRecurring = (firstDate: Date, startTime: string, endTime: string, dayName: string): boolean => {
    if (bookingType !== "recurring" || !recurringConfig) return true
    if (!recurringConfig.daysOfWeek?.includes(dayName)) return false

    const recurringDates: Date[] = []
    const currentDate = new Date(firstDate)
    const stopDate = new Date(recurringConfig.endDate)

    // Move to the next occurrence to start checking from there
    currentDate.setDate(currentDate.getDate() + 7)

    while (currentDate <= stopDate) {
      if (recurringConfig.daysOfWeek.includes(getDayName(currentDate))) {
        recurringDates.push(new Date(currentDate))
      }
      currentDate.setDate(currentDate.getDate() + 7) // Assuming weekly recurrence for now
    }

    for (const recurringDate of recurringDates) {
      const recurringDateStr = formatDate(recurringDate)
      const recurringDayName = getDayName(recurringDate)
      const availability = calculateAvailableSlots(
        professionalConfig,
        workingDays,
        recurringDateStr,
        startTime,
        endTime,
        recurringDayName,
        bookingData,
      )
      if (availability.availableSlots <= 0) {
        console.log(`Recurring slot invalid on ${recurringDateStr} at ${startTime}. Reason: ${availability.reason}`)
        return false
      }
    }

    return true
  }

  // New function to generate day-level slots for full-day services
  const generateDaySlots = (date: Date) => {
    const dayName = getDayName(date)
    const workingDay = workingDays.find((wd) => wd.day === dayName && wd.isWorking)
    if (!workingDay) return []

    const dateStr = formatDate(date)

    // Check if this day is blocked
    if (professionalConfig?.blockedTimes && isDayBlocked(dateStr, professionalConfig.blockedTimes)) {
      return []
    }

    const availability = calculateDayAvailability(professionalConfig, workingDays, dateStr, dayName, bookingData)

    if (availability.availableSlots > 0) {
      return [
        {
          date: dateStr,
          startTime: "All Day",
          endTime: "All Day",
          dayOfWeek: dayName,
          ...availability,
        },
      ]
    }

    return []
  }

  // Existing function for time-based slots
  const generateTimeSlots = (date: Date) => {
    const dayName = getDayName(date)
    const workingDay = workingDays.find((wd) => wd.day === dayName && wd.isWorking)
    if (!workingDay || serviceDuration === 0) return []

    const slots = []
    const dateStr = formatDate(date)
    const startMinutes = timeToMinutes(workingDay.start)
    const endMinutes = timeToMinutes(workingDay.end)
    const interval = 15 // Generate slots every 15 minutes

    for (let minutes = startMinutes; minutes + serviceDuration <= endMinutes; minutes += interval) {
      const slotStart = minutes
      const slotEnd = minutes + serviceDuration

      const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60)
        const m = mins % 60
        const period = h >= 12 ? "PM" : "AM"
        const displayHours = h % 12 === 0 ? 12 : h % 12
        return `${displayHours}:${m.toString().padStart(2, "0")} ${period}`
      }

      const startTimeFormatted = formatTime(slotStart)
      const endTimeFormatted = formatTime(slotEnd)

      // Check if this time slot is blocked before calculating availability
      const isBlocked = professionalConfig?.blockedTimes
        ? isTimeSlotBlocked(dateStr, startTimeFormatted, endTimeFormatted, professionalConfig.blockedTimes)
        : false

      // Skip blocked slots entirely
      if (isBlocked) {
        continue
      }

      const availability = calculateAvailableSlots(
        professionalConfig,
        workingDays,
        dateStr,
        startTimeFormatted,
        endTimeFormatted,
        dayName,
        bookingData,
      )

      if (availability.availableSlots > 0) {
        if (bookingType === "recurring") {
          if (!isSlotValidForRecurring(date, startTimeFormatted, endTimeFormatted, dayName)) {
            continue
          }
        }

        slots.push({
          date: dateStr,
          startTime: startTimeFormatted,
          endTime: endTimeFormatted,
          dayOfWeek: dayName,
          ...availability,
        })
      }
    }
    return slots
  }

  if (!selectedServices || selectedServices.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-500 mb-2 header-font">Select a Service</h3>
        <p className="text-gray-400 body-font">Choose a service above to see available appointment times.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 header-font">
            {isFullDayBooking ? "Available Days" : "Available Times"}
          </h2>
          <p className="text-gray-600 body-font">
            {isFullDayBooking ? (
              <>
                Select {totalDays > 1 ? `${totalDays} consecutive days` : "a day"} for{" "}
                <span className="font-medium">{selectedServices.map((s) => s.name).join(", ")}</span>
                {totalDays > 1 && (
                  <span className="text-sm text-[#E75837] ml-2 font-medium">(Multi-day booking: {totalDays} days)</span>
                )}
              </>
            ) : (
              <>
                Select a time slot for{" "}
                <span className="font-medium">{selectedServices.map((s) => s.name).join(", ")}</span>
                {bookingType === "recurring" && recurringConfig && (
                  <span className="text-sm text-[#E75837] ml-2 font-medium">
                    (Recurring weekly on {recurringConfig.daysOfWeek?.join(", ")} until{" "}
                    {new Date(recurringConfig.endDate).toLocaleDateString()})
                  </span>
                )}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium body-font px-4 min-w-[120px] text-center">
            {currentWeekStart.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {weekDates.map((date) => {
          const dayName = getDayName(date)
          const isToday = formatDate(date) === formatDate(new Date())
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

          // Use different slot generation based on service type
          const timeSlots = isPast ? [] : isFullDayBooking ? generateDaySlots(date) : generateTimeSlots(date)

          const dateStr = formatDate(date)
          const isExpanded = expandedDays.has(dateStr)
          const initialSlotCount = isFullDayBooking ? 1 : 8 // Show only 1 slot for full-day services
          const hasMoreSlots = timeSlots.length > initialSlotCount
          const displayedSlots = isExpanded ? timeSlots : timeSlots.slice(0, initialSlotCount)
          const isRecurringDay = bookingType === "recurring" && recurringConfig?.daysOfWeek?.includes(dayName)

          return (
            <Card
              key={dateStr}
              className={`${isToday ? "ring-2 ring-[#E75837]" : isRecurringDay ? "ring-1 ring-blue-300 bg-blue-50" : ""} h-fit`}
            >
              <CardHeader className="pb-3 text-center">
                <CardTitle className="space-y-1">
                  <div
                    className={`text-sm font-semibold header-font ${isToday ? "text-[#E75837]" : isRecurringDay ? "text-blue-600" : "text-gray-900"}`}
                  >
                    {dayName}
                    {isRecurringDay && <span className="text-xs block text-blue-500">Recurring</span>}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{date.getDate()}</div>
                  <div className="text-xs text-gray-500 font-normal">
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {isPast ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400 body-font">Past date</p>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400 body-font">
                      {isFullDayBooking ? "Not available" : "No available times"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayedSlots.map((slot, slotIndex) => {
                      const isSelected =
                        selectedTimeSlot?.date === slot.date && selectedTimeSlot?.startTime === slot.startTime
                      const availabilityColor = slot.availableSlots <= 1 ? "text-orange-600" : "text-green-600"
                      const tooltipText = `Capacity: ${slot.availableSlots}/${slot.totalCapacity}. Reason: ${slot.reason}`

                      return (
                        <Button
                          key={slotIndex}
                          variant="outline"
                          size="sm"
                          className={`w-full text-xs py-3 h-auto min-h-[3.5rem] body-font transition-all ${
                            isSelected
                              ? "bg-[#E75837] text-white border-[#E75837] hover:bg-[#d14a2a] shadow-md"
                              : "hover:bg-gray-50 hover:border-gray-300"
                          }`}
                          onClick={() => onTimeSlotSelect(slot)}
                          title={tooltipText}
                        >
                          <div className="flex flex-col items-center w-full">
                            {isFullDayBooking ? (
                              <>
                                <Calendar className="w-4 h-4 mb-1" />
                                <span className="font-medium">Full Day</span>
                              </>
                            ) : (
                              <span className="font-medium">{slot.startTime}</span>
                            )}
                            <div className="flex items-center justify-center mt-1">
                              <div className="flex items-center gap-1">
                                <Users className="w-2.5 h-2.5" />
                                <span
                                  className={`text-[10px] font-medium ${isSelected ? "text-white" : availabilityColor}`}
                                >
                                  {slot.availableSlots}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Button>
                      )
                    })}
                    {hasMoreSlots && !isFullDayBooking && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs py-2 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-50 body-font"
                        onClick={() => toggleDayExpansion(dateStr)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" /> Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" /> +{timeSlots.length - initialSlotCount} more
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

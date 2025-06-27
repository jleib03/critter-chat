"use client"

import { useState } from "react"
import type { BookingData, WorkingDay, Service, SelectedTimeSlot } from "@/types/schedule"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Clock, ChevronDown, ChevronUp, Users, Calendar } from "lucide-react"
import { calculateAvailableSlots } from "@/utils/professional-config"
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
  professionalId,
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
    return monday
  })

  // Track which days are expanded to show all time slots
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  const getWeekDates = (startDate: Date) => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = getWeekDates(currentWeekStart)

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeekStart(newDate)
    // Reset expanded days when navigating weeks
    setExpandedDays(new Set())
  }

  const toggleDayExpansion = (dateStr: string) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(dateStr)) {
      newExpanded.delete(dateStr)
    } else {
      newExpanded.add(dateStr)
    }
    setExpandedDays(newExpanded)
  }

  const formatDate = (date: Date) => {
    // Fix: Use local date components to avoid timezone conversion
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" })
  }

  const getWorkingHours = (dayName: string) => {
    const workingDay = workingDays.find((wd) => wd.day === dayName)
    return workingDay && workingDay.isWorking ? { start: workingDay.start, end: workingDay.end } : null
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = formatDate(date)
    return bookingData.filter((booking) => booking.booking_date_formatted === dateStr)
  }

  const generateTimeSlots = (date: Date, workingHours: { start: string; end: string }, serviceDuration: number) => {
    const slots = []
    const [startHour, startMinute] = workingHours.start.split(":").map(Number)
    const [endHour, endMinute] = workingHours.end.split(":").map(Number)

    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute

    const bookings = getBookingsForDate(date)
    const dayName = getDayName(date)

    // Fix: Use proper date formatting to avoid timezone issues
    const dateStr =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")

    for (let time = startTime; time + serviceDuration <= endTime; time += 30) {
      const slotStart = time
      const slotEnd = time + serviceDuration

      const startHours = Math.floor(slotStart / 60)
      const startMins = slotStart % 60
      const endHours = Math.floor(slotEnd / 60)
      const endMins = slotEnd % 60

      const formatTime = (hours: number, minutes: number) => {
        const period = hours >= 12 ? "PM" : "AM"
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
        return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
      }

      const startTimeFormatted = formatTime(startHours, startMins)
      const endTimeFormatted = formatTime(endHours, endMins)

      // If professional config is available, use enhanced capacity calculation
      if (professionalConfig) {
        const slotInfo = calculateAvailableSlots(
          professionalConfig,
          dateStr,
          startTimeFormatted,
          endTimeFormatted,
          dayName,
          bookings,
        )

        // Only show slots that have availability
        if (slotInfo.availableSlots > 0) {
          // For recurring bookings, check if this slot works for all recurring dates
          if (
            bookingType === "recurring" &&
            !isSlotValidForRecurring(date, startTimeFormatted, endTimeFormatted, dayName)
          ) {
            continue // Skip this slot if it doesn't work for the full recurring schedule
          }

          slots.push({
            date: dateStr,
            startTime: startTimeFormatted,
            endTime: endTimeFormatted,
            dayOfWeek: dayName,
            availableSlots: slotInfo.availableSlots,
            totalCapacity: slotInfo.totalCapacity,
            availableEmployees: slotInfo.workingEmployees.length,
            employeeNames: slotInfo.workingEmployees.map((emp) => emp.name).join(", "),
            existingBookingsCount: slotInfo.existingBookingsCount,
            capacityBreakdown: slotInfo.capacityBreakdown,
          })
        }
      } else {
        // Fallback to original logic for backwards compatibility
        const hasConflict = bookings.some((booking) => {
          if (!booking.start || !booking.end || !booking.booking_id) return false

          const bookingStart = new Date(booking.start)
          const bookingEnd = new Date(booking.end)
          const bookingStartMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes()
          const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes()

          return slotStart < bookingEndMinutes && slotEnd > bookingStartMinutes
        })

        if (!hasConflict) {
          slots.push({
            date: dateStr,
            startTime: startTimeFormatted,
            endTime: endTimeFormatted,
            dayOfWeek: dayName,
            availableSlots: 1,
            totalCapacity: 1,
            availableEmployees: 1,
            employeeNames: "Available",
            existingBookingsCount: 0,
          })
        }
      }
    }

    return slots
  }

  const isSlotValidForRecurring = (date: Date, startTime: string, endTime: string, dayName: string) => {
    if (bookingType !== "recurring" || !recurringConfig) return true

    // Check if this day is selected for recurring appointments
    if (!recurringConfig.daysOfWeek.includes(dayName)) return false

    const serviceDuration = getTotalServiceDurationInMinutes(selectedServices!)
    const startDate = new Date(date)
    const endDate = new Date(recurringConfig.endDate)

    // Generate all recurring dates for this specific day of the week
    const recurringDates = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      if (recurringConfig.daysOfWeek.includes(getDayName(currentDate))) {
        recurringDates.push(new Date(currentDate))
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Check if all recurring dates have availability
    for (const recurringDate of recurringDates) {
      const recurringDayName = getDayName(recurringDate)
      const recurringWorkingHours = getWorkingHours(recurringDayName)

      // Check if the professional works on this day
      if (!recurringWorkingHours) return false

      // Check if the time slot fits within working hours
      const [startHour, startMinute] = startTime.split(/[:\s]/)
      const isPM = startTime.includes("PM")
      let hour24 = Number.parseInt(startHour)
      if (isPM && hour24 !== 12) hour24 += 12
      if (!isPM && hour24 === 12) hour24 = 0

      const slotStartMinutes = hour24 * 60 + Number.parseInt(startMinute)
      const slotEndMinutes = slotStartMinutes + serviceDuration

      const [workStartHour, workStartMinute] = recurringWorkingHours.start.split(":").map(Number)
      const [workEndHour, workEndMinute] = recurringWorkingHours.end.split(":").map(Number)
      const workStartMinutes = workStartHour * 60 + workStartMinute
      const workEndMinutes = workEndHour * 60 + workEndMinute

      if (slotStartMinutes < workStartMinutes || slotEndMinutes > workEndMinutes) {
        return false
      }

      // Check for conflicts with existing bookings on this date
      const recurringDateStr = formatDate(recurringDate)
      const bookingsOnDate = bookingData.filter((booking) => booking.booking_date_formatted === recurringDateStr)

      if (professionalConfig) {
        const slotInfo = calculateAvailableSlots(
          professionalConfig,
          recurringDateStr,
          startTime,
          endTime,
          recurringDayName,
          bookingsOnDate,
        )

        if (slotInfo.availableSlots <= 0) return false
      } else {
        // Fallback logic for basic conflict checking
        const hasConflict = bookingsOnDate.some((booking) => {
          if (!booking.start || !booking.end || !booking.booking_id) return false

          const bookingStart = new Date(booking.start)
          const bookingEnd = new Date(booking.end)
          const bookingStartMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes()
          const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes()

          return slotStartMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes
        })

        if (hasConflict) return false
      }
    }

    return true
  }

  const getTotalServiceDurationInMinutes = (services: Service[]) => {
    return services.reduce((total, service) => {
      let duration = 60 // default
      if (service.duration_unit === "Minutes") duration = service.duration_number
      if (service.duration_unit === "Hours") duration = service.duration_number * 60
      if (service.duration_unit === "Days") duration = service.duration_number * 24 * 60
      return total + duration
    }, 0)
  }

  if (!selectedServices || selectedServices.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-500 mb-3 header-font">Select Services First</h3>
        <p className="text-gray-400 body-font text-lg">Choose your services above to see available appointment times</p>
      </div>
    )
  }

  const serviceDuration = getTotalServiceDurationInMinutes(selectedServices)

  return (
    <div className="space-y-8">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 header-font">Available Times</h2>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-gray-600 body-font">
              Showing times for{" "}
              <span className="font-semibold text-[#E75837]">{selectedServices.map((s) => s.name).join(", ")}</span>
            </p>
            {bookingType === "recurring" && recurringConfig && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Recurring weekly
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("prev")}
            className="rounded-xl hover:bg-gray-50 transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 bg-gray-50 rounded-xl">
            <span className="text-sm font-semibold body-font text-gray-700">
              {currentWeekStart.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("next")}
            className="rounded-xl hover:bg-gray-50 transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const dayName = getDayName(date)
          const workingHours = getWorkingHours(dayName)
          const isToday = formatDate(date) === formatDate(new Date())
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
          const timeSlots = workingHours ? generateTimeSlots(date, workingHours, serviceDuration) : []
          const dateStr = formatDate(date)
          const isExpanded = expandedDays.has(dateStr)
          const initialSlotCount = 6
          const hasMoreSlots = timeSlots.length > initialSlotCount
          const displayedSlots = isExpanded ? timeSlots : timeSlots.slice(0, initialSlotCount)

          // For recurring bookings, highlight days that are selected
          const isRecurringDay = bookingType === "recurring" && recurringConfig?.daysOfWeek.includes(dayName)

          return (
            <div
              key={index}
              className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${
                isToday
                  ? "ring-2 ring-[#E75837] shadow-lg bg-gradient-to-b from-orange-50 to-white"
                  : isRecurringDay
                    ? "ring-2 ring-blue-300 bg-gradient-to-b from-blue-50 to-white shadow-md"
                    : "bg-white border border-gray-200 hover:shadow-md"
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-4 text-center border-b ${
                  isToday
                    ? "bg-gradient-to-r from-[#E75837] to-[#d14a2a] text-white"
                    : isRecurringDay
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      : "bg-gray-50"
                }`}
              >
                <div
                  className={`text-sm font-semibold header-font ${
                    isToday || isRecurringDay ? "text-white" : "text-gray-600"
                  }`}
                >
                  {dayName.slice(0, 3)}
                  {isRecurringDay && <div className="text-xs opacity-90">Recurring</div>}
                </div>
                <div className={`text-2xl font-bold ${isToday || isRecurringDay ? "text-white" : "text-gray-900"}`}>
                  {date.getDate()}
                </div>
                <div className={`text-xs ${isToday || isRecurringDay ? "text-white/80" : "text-gray-500"}`}>
                  {date.toLocaleDateString("en-US", { month: "short" })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="p-3">
                {isPast ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400 body-font">Past date</p>
                  </div>
                ) : !workingHours ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400 body-font">Closed</p>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400 body-font">No times</p>
                    {professionalConfig && <p className="text-xs text-gray-400 body-font mt-1">Fully booked</p>}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayedSlots.map((slot, slotIndex) => {
                      const isSelected =
                        selectedTimeSlot?.date === slot.date && selectedTimeSlot?.startTime === slot.startTime

                      // Color coding based on availability
                      let availabilityColor = "text-green-600 bg-green-50"
                      if (slot.availableSlots <= 2) availabilityColor = "text-yellow-600 bg-yellow-50"
                      if (slot.availableSlots <= 1) availabilityColor = "text-orange-600 bg-orange-50"

                      // Create detailed tooltip showing the layered calculation
                      const tooltipText =
                        professionalConfig && slot.capacityBreakdown
                          ? `Staff: ${slot.capacityBreakdown.employeesWorking} • Capacity: ${slot.capacityBreakdown.finalCapacity} • Available: ${slot.capacityBreakdown.availableSlots}`
                          : undefined

                      return (
                        <Button
                          key={slotIndex}
                          variant="outline"
                          size="sm"
                          className={`w-full text-xs py-3 h-auto min-h-[3rem] body-font transition-all duration-200 rounded-xl ${
                            isSelected
                              ? "bg-gradient-to-r from-[#E75837] to-[#d14a2a] text-white border-[#E75837] hover:from-[#d14a2a] hover:to-[#c13e26] shadow-lg transform scale-105"
                              : "hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm border-gray-200"
                          }`}
                          onClick={() => onTimeSlotSelect(slot)}
                          title={tooltipText}
                        >
                          <div className="flex flex-col items-center w-full">
                            <span className="font-semibold text-sm">{slot.startTime}</span>

                            {professionalConfig && slot.capacityBreakdown && (
                              <div className="flex items-center justify-center mt-1">
                                <div
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                    isSelected ? "bg-white/20 text-white" : availabilityColor
                                  }`}
                                >
                                  <Users className="w-2.5 h-2.5" />
                                  <span>{slot.availableSlots}</span>
                                </div>
                              </div>
                            )}

                            {!professionalConfig && slot.availableEmployees > 0 && (
                              <span
                                className={`text-[10px] mt-0.5 px-2 py-0.5 rounded-full ${
                                  isSelected ? "bg-white/20 text-white" : "bg-green-100 text-green-600"
                                }`}
                              >
                                Available
                              </span>
                            )}
                          </div>
                        </Button>
                      )
                    })}

                    {hasMoreSlots && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs py-2 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-50 body-font rounded-xl transition-colors duration-200"
                        onClick={() => toggleDayExpansion(dateStr)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />+{timeSlots.length - initialSlotCount} more
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

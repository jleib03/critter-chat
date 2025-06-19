"use client"

import { useState } from "react"
import type { BookingData, WorkingDay, Service, SelectedTimeSlot } from "@/types/schedule"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Clock, ChevronDown, ChevronUp } from "lucide-react"

type WeeklyCalendarProps = {
  workingDays: WorkingDay[]
  bookingData: BookingData[]
  selectedService: Service | null
  onTimeSlotSelect: (slot: SelectedTimeSlot) => void
  selectedTimeSlot: SelectedTimeSlot | null
}

export function WeeklyCalendar({
  workingDays,
  bookingData,
  selectedService,
  onTimeSlotSelect,
  selectedTimeSlot,
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
    return date.toISOString().split("T")[0]
  }

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" })
  }

  const getWorkingHours = (dayName: string) => {
    const workingDay = workingDays.find((wd) => wd.day === dayName)
    return workingDay ? { start: workingDay.start, end: workingDay.end } : null
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = formatDate(date)
    return bookingData.filter((booking) => booking.booking_date_formatted === dateStr && booking.booking_id !== null)
  }

  const generateTimeSlots = (date: Date, workingHours: { start: string; end: string }, serviceDuration: number) => {
    const slots = []
    const [startHour, startMinute] = workingHours.start.split(":").map(Number)
    const [endHour, endMinute] = workingHours.end.split(":").map(Number)

    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute

    const bookings = getBookingsForDate(date)

    for (let time = startTime; time + serviceDuration <= endTime; time += 30) {
      const slotStart = time
      const slotEnd = time + serviceDuration

      // Check if this slot conflicts with existing bookings
      const hasConflict = bookings.some((booking) => {
        if (!booking.start || !booking.end) return false

        const bookingStart = new Date(booking.start)
        const bookingEnd = new Date(booking.end)
        const bookingStartMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes()
        const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes()

        return slotStart < bookingEndMinutes && slotEnd > bookingStartMinutes
      })

      if (!hasConflict) {
        const startHours = Math.floor(slotStart / 60)
        const startMins = slotStart % 60

        const formatTime = (hours: number, minutes: number) => {
          const period = hours >= 12 ? "PM" : "AM"
          const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
          return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
        }

        slots.push({
          date: formatDate(date),
          startTime: formatTime(startHours, startMins),
          endTime: formatTime(Math.floor(slotEnd / 60), slotEnd % 60),
          dayOfWeek: getDayName(date),
        })
      }
    }

    return slots
  }

  const getServiceDurationInMinutes = (service: Service) => {
    if (service.duration_unit === "Minutes") return service.duration_number
    if (service.duration_unit === "Hours") return service.duration_number * 60
    if (service.duration_unit === "Days") return service.duration_number * 24 * 60
    return 60 // default
  }

  if (!selectedService) {
    return (
      <div className="text-center py-16">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-500 mb-2 header-font">Select a Service</h3>
        <p className="text-gray-400 body-font">Choose a service above to see available appointment times.</p>
      </div>
    )
  }

  const serviceDuration = getServiceDurationInMinutes(selectedService)

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 header-font">Available Times</h2>
          <p className="text-gray-600 body-font">
            Select a time slot for <span className="font-medium">{selectedService.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium body-font px-4 min-w-[120px] text-center">
            {currentWeekStart.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Full-width Calendar Grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const dayName = getDayName(date)
          const workingHours = getWorkingHours(dayName)
          const isToday = formatDate(date) === formatDate(new Date())
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
          const timeSlots = workingHours ? generateTimeSlots(date, workingHours, serviceDuration) : []
          const dateStr = formatDate(date)
          const isExpanded = expandedDays.has(dateStr)
          const initialSlotCount = 8
          const hasMoreSlots = timeSlots.length > initialSlotCount
          const displayedSlots = isExpanded ? timeSlots : timeSlots.slice(0, initialSlotCount)

          return (
            <Card key={index} className={`${isToday ? "ring-2 ring-[#E75837]" : ""} h-fit`}>
              <CardHeader className="pb-3 text-center">
                <CardTitle className="space-y-1">
                  <div className={`text-sm font-semibold header-font ${isToday ? "text-[#E75837]" : "text-gray-900"}`}>
                    {dayName}
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
                ) : !workingHours ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400 body-font">Closed</p>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400 body-font">No available times</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayedSlots.map((slot, slotIndex) => (
                      <Button
                        key={slotIndex}
                        variant="outline"
                        size="sm"
                        className={`w-full text-xs py-2 h-8 body-font transition-all ${
                          selectedTimeSlot?.date === slot.date && selectedTimeSlot?.startTime === slot.startTime
                            ? "bg-[#E75837] text-white border-[#E75837] hover:bg-[#d14a2a] shadow-md"
                            : "hover:bg-gray-50 hover:border-gray-300"
                        }`}
                        onClick={() => onTimeSlotSelect(slot)}
                      >
                        {slot.startTime}
                      </Button>
                    ))}

                    {hasMoreSlots && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs py-2 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-50 body-font"
                        onClick={() => toggleDayExpansion(dateStr)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />+{timeSlots.length - initialSlotCount} more times
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

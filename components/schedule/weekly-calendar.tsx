"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react"
import type { BookingData, WorkingDay, Service, SelectedTimeSlot } from "@/types/schedule"
import type { ProfessionalConfig } from "@/types/professional-config"
import {
  calculateAvailableSlots,
  isTimeSlotBlocked,
  hasFullDayServices,
  getTotalDurationInDays,
} from "@/utils/professional-config"
import { DayPickerInterface } from "./day-picker-interface"

type WeeklyCalendarProps = {
  workingDays: WorkingDay[]
  bookingData: BookingData[]
  selectedServices: Service[]
  onTimeSlotSelect: (slot: SelectedTimeSlot) => void
  selectedTimeSlot: SelectedTimeSlot | null
  professionalId: string
  professionalConfig: ProfessionalConfig | null
  bookingType?: "one-time" | "recurring"
  recurringConfig?: any
}

type TimeSlot = {
  startTime: string
  endTime: string
  availableSlots: number
  totalCapacity: number
  workingEmployees: any[]
  existingBookingsCount: number
  reason: string
}

type DaySlots = {
  date: string
  dayOfWeek: string
  isWorkingDay: boolean
  slots: TimeSlot[]
  isExpanded: boolean
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
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek)
    return startOfWeek
  })

  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  const weekDates = useMemo(() => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [weekStart])

  // Check if we're dealing with full-day services
  const isFullDayBooking = useMemo(() => hasFullDayServices(selectedServices), [selectedServices])
  const totalDays = useMemo(() => getTotalDurationInDays(selectedServices), [selectedServices])

  // If it's a full-day booking, use the DayPickerInterface
  if (isFullDayBooking) {
    return (
      <DayPickerInterface
        workingDays={workingDays}
        bookingData={bookingData}
        selectedServices={selectedServices}
        onTimeSlotSelect={onTimeSlotSelect}
        selectedTimeSlot={selectedTimeSlot}
        professionalConfig={professionalConfig}
      />
    )
  }

  // Rest of the component handles regular time-based bookings
  const navigateWeek = (direction: "prev" | "next") => {
    setWeekStart((prev) => {
      const newDate = new Date(prev)
      if (direction === "next") {
        newDate.setDate(prev.getDate() + 7)
      } else {
        newDate.setDate(prev.getDate() - 7)
      }
      return newDate
    })
  }

  const getTotalServiceDurationInMinutes = () => {
    return selectedServices.reduce((total, service) => {
      let durationInMinutes = service.duration_number

      if (service.duration_unit === "Hours") {
        durationInMinutes = service.duration_number * 60
      } else if (service.duration_unit === "Days") {
        durationInMinutes = service.duration_number * 24 * 60
      }

      return total + durationInMinutes
    }, 0)
  }

  const generateTimeSlots = (date: Date, workingDay: WorkingDay): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const dateStr = date.toISOString().split("T")[0]
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" })

    if (!workingDay.isWorking) return slots

    const startMinutes = timeToMinutes(workingDay.start)
    const endMinutes = timeToMinutes(workingDay.end)
    const serviceDurationMinutes = getTotalServiceDurationInMinutes()
    const slotInterval = 15 // 15-minute intervals

    for (
      let currentMinutes = startMinutes;
      currentMinutes + serviceDurationMinutes <= endMinutes;
      currentMinutes += slotInterval
    ) {
      const slotStartTime = minutesToTime(currentMinutes)
      const slotEndTime = minutesToTime(currentMinutes + serviceDurationMinutes)

      // Check if this slot is blocked (global blocks are filtered here)
      if (professionalConfig?.blockedTimes) {
        const isBlocked = isTimeSlotBlocked(dateStr, slotStartTime, slotEndTime, professionalConfig.blockedTimes)
        if (isBlocked) {
          continue // Skip blocked slots entirely
        }
      }

      const availability = calculateAvailableSlots(
        professionalConfig,
        workingDays,
        dateStr,
        slotStartTime,
        slotEndTime,
        dayName,
        bookingData,
      )

      slots.push({
        startTime: slotStartTime,
        endTime: slotEndTime,
        availableSlots: availability.availableSlots,
        totalCapacity: availability.totalCapacity,
        workingEmployees: availability.workingEmployees,
        existingBookingsCount: availability.existingBookingsCount,
        reason: availability.reason,
      })
    }

    return slots
  }

  const timeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.split(" ")
    const [hours, minutes] = time.split(":").map(Number)
    let totalMinutes = hours * 60 + minutes

    if (period === "PM" && hours !== 12) {
      totalMinutes += 12 * 60
    } else if (period === "AM" && hours === 12) {
      totalMinutes = minutes
    }

    return totalMinutes
  }

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 === 0 ? 12 : hours % 12
    return `${displayHours}:${mins.toString().padStart(2, "0")} ${period}`
  }

  const daySlots: DaySlots[] = useMemo(() => {
    return weekDates.map((date) => {
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
      const workingDay = workingDays.find((wd) => wd.day === dayName)
      const dateStr = date.toISOString().split("T")[0]

      if (!workingDay) {
        return {
          date: dateStr,
          dayOfWeek: dayName,
          isWorkingDay: false,
          slots: [],
          isExpanded: false,
        }
      }

      const slots = generateTimeSlots(date, workingDay)

      return {
        date: dateStr,
        dayOfWeek: dayName,
        isWorkingDay: workingDay.isWorking,
        slots,
        isExpanded: expandedDays.has(dateStr),
      }
    })
  }, [weekDates, workingDays, bookingData, selectedServices, professionalConfig, expandedDays])

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

  const handleTimeSlotClick = (daySlot: DaySlots, timeSlot: TimeSlot) => {
    if (timeSlot.availableSlots <= 0) return

    onTimeSlotSelect({
      date: daySlot.date,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      dayOfWeek: daySlot.dayOfWeek,
    })
  }

  const isSlotSelected = (daySlot: DaySlots, timeSlot: TimeSlot) => {
    return (
      selectedTimeSlot?.date === daySlot.date &&
      selectedTimeSlot?.startTime === timeSlot.startTime &&
      selectedTimeSlot?.endTime === timeSlot.endTime
    )
  }

  const isPastDate = (date: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    return checkDate < today
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getAvailableSlotsCount = (slots: TimeSlot[]) => {
    return slots.filter((slot) => slot.availableSlots > 0).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 header-font">Available Times</h2>
          <p className="text-gray-600 body-font">
            Select a time slot for <span className="font-medium">{selectedServices.map((s) => s.name).join(", ")}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-medium header-font px-4 min-w-[200px] text-center">
            {weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} -{" "}
            {weekDates[6].toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {daySlots.map((daySlot) => {
          const availableCount = getAvailableSlotsCount(daySlot.slots)
          const isPast = isPastDate(daySlot.date)

          return (
            <Card
              key={daySlot.date}
              className={`transition-all ${
                isPast
                  ? "opacity-50"
                  : !daySlot.isWorkingDay
                    ? "opacity-60"
                    : availableCount === 0
                      ? "border-gray-200"
                      : "border-gray-300 hover:border-[#E75837]/50"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg header-font">{daySlot.dayOfWeek}</CardTitle>
                    <p className="text-sm text-gray-600 body-font">{formatDate(daySlot.date)}</p>
                  </div>
                  <div className="text-right">
                    {isPast ? (
                      <Badge variant="secondary" className="text-xs">
                        Past
                      </Badge>
                    ) : !daySlot.isWorkingDay ? (
                      <Badge variant="secondary" className="text-xs">
                        Closed
                      </Badge>
                    ) : availableCount === 0 ? (
                      <Badge variant="secondary" className="text-xs">
                        Full
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-[#E75837] border-[#E75837]">
                        {availableCount} slots
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              {daySlot.isWorkingDay && !isPast && daySlot.slots.length > 0 && (
                <CardContent className="pt-0">
                  {/* Show first few slots */}
                  <div className="space-y-2">
                    {daySlot.slots.slice(0, daySlot.isExpanded ? undefined : 3).map((slot, index) => (
                      <Button
                        key={index}
                        variant={isSlotSelected(daySlot, slot) ? "default" : "outline"}
                        size="sm"
                        className={`w-full justify-between text-xs body-font ${
                          isSlotSelected(daySlot, slot)
                            ? "bg-[#E75837] hover:bg-[#d14a2a] text-white"
                            : slot.availableSlots > 0
                              ? "hover:border-[#E75837] hover:text-[#E75837]"
                              : "opacity-50 cursor-not-allowed"
                        }`}
                        onClick={() => handleTimeSlotClick(daySlot, slot)}
                        disabled={slot.availableSlots <= 0}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{slot.startTime}</span>
                        </div>
                        {slot.availableSlots > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{slot.availableSlots}</span>
                          </div>
                        )}
                      </Button>
                    ))}

                    {/* Expand/Collapse button */}
                    {daySlot.slots.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-gray-600 hover:text-[#E75837] body-font"
                        onClick={() => toggleDayExpansion(daySlot.date)}
                      >
                        {daySlot.isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Show {daySlot.slots.length - 3} More
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

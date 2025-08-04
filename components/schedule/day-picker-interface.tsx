"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, Users, AlertCircle, CheckCircle2 } from "lucide-react"
import type { BookingData, WorkingDay, Service, SelectedTimeSlot } from "@/types/schedule"
import type { ProfessionalConfig } from "@/types/professional-config"
import { getTotalDurationInDays, calculateDayAvailability, validateMultiDayBooking } from "@/utils/professional-config"

type DayPickerInterfaceProps = {
  workingDays: WorkingDay[]
  bookingData: BookingData[]
  selectedServices: Service[]
  onTimeSlotSelect: (slot: SelectedTimeSlot) => void
  selectedTimeSlot: SelectedTimeSlot | null
  professionalConfig: ProfessionalConfig | null
}

export function DayPickerInterface({
  workingDays,
  bookingData,
  selectedServices,
  onTimeSlotSelect,
  selectedTimeSlot,
  professionalConfig,
}: DayPickerInterfaceProps) {
  const [currentMonthStart, setCurrentMonthStart] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null)

  const totalDays = useMemo(() => getTotalDurationInDays(selectedServices), [selectedServices])

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonthStart((prev) => {
      const newDate = new Date(prev)
      if (direction === "next") {
        newDate.setMonth(prev.getMonth() + 1)
      } else {
        newDate.setMonth(prev.getMonth() - 1)
      }
      return newDate
    })
  }

  const getMonthDates = (monthStart: Date) => {
    const year = monthStart.getFullYear()
    const month = monthStart.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)

    // Start from Sunday of the week containing the first day
    startDate.setDate(firstDay.getDate() - firstDay.getDay())

    const dates = []
    const currentDate = new Date(startDate)

    // Generate 6 weeks worth of dates
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        dates.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    return dates
  }

  const monthDates = useMemo(() => getMonthDates(currentMonthStart), [currentMonthStart])

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" })
  }

  const isInCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonthStart.getMonth()
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const handleDateSelect = (date: Date) => {
    const dateStr = formatDate(date)

    if (totalDays === 1) {
      // Single day booking
      setSelectedStartDate(dateStr)
      onTimeSlotSelect({
        date: dateStr,
        startTime: "All Day",
        endTime: "All Day",
        dayOfWeek: getDayName(date),
      })
    } else {
      // Multi-day booking
      if (selectedStartDate === dateStr) {
        // Deselect if clicking the same date
        setSelectedStartDate(null)
      } else {
        setSelectedStartDate(dateStr)

        // Validate multi-day booking
        const validation = validateMultiDayBooking(dateStr, totalDays, professionalConfig, workingDays, bookingData)

        if (validation.valid) {
          onTimeSlotSelect({
            date: dateStr,
            startTime: "All Day",
            endTime: "All Day",
            dayOfWeek: getDayName(date),
          })
        }
      }
    }
  }

  const getDayAvailability = (date: Date) => {
    const dateStr = formatDate(date)
    const dayName = getDayName(date)

    return calculateDayAvailability(professionalConfig, workingDays, dateStr, dayName, bookingData)
  }

  const getMultiDayValidation = (startDate: string) => {
    if (totalDays <= 1) return null

    return validateMultiDayBooking(startDate, totalDays, professionalConfig, workingDays, bookingData)
  }

  const isDateInSelectedRange = (date: Date) => {
    if (!selectedStartDate || totalDays <= 1) return false

    const dateStr = formatDate(date)
    const startDate = new Date(selectedStartDate)
    const endDate = new Date(selectedStartDate)
    endDate.setDate(startDate.getDate() + totalDays - 1)

    return date >= startDate && date <= endDate
  }

  const getDateStatus = (date: Date) => {
    const dateStr = formatDate(date)
    const availability = getDayAvailability(date)
    const isSelected = selectedTimeSlot?.date === dateStr
    const isInRange = isDateInSelectedRange(date)
    const isPast = isPastDate(date)
    const inCurrentMonth = isInCurrentMonth(date)

    if (isPast) return { type: "past", available: false, reason: "Past date" }
    if (!inCurrentMonth) return { type: "other-month", available: false, reason: "Other month" }
    if (availability.availableSlots <= 0) return { type: "unavailable", available: false, reason: availability.reason }
    if (isSelected) return { type: "selected", available: true, reason: "Selected" }
    if (isInRange) return { type: "in-range", available: true, reason: "In selected range" }

    return { type: "available", available: true, reason: "Available" }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 header-font">Select Your Dates</h2>
          <p className="text-gray-600 body-font">
            Choose {totalDays > 1 ? `${totalDays} consecutive days` : "a day"} for{" "}
            <span className="font-medium">{selectedServices.map((s) => s.name).join(", ")}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-medium header-font px-4 min-w-[180px] text-center">
            {currentMonthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Multi-day booking info */}
      {totalDays > 1 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900 header-font">Multi-Day Booking</span>
            </div>
            <p className="text-sm text-blue-800 body-font">
              Select your check-in date. We'll automatically reserve {totalDays} consecutive days starting from your
              selected date.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Calendar Grid */}
      <Card>
        <CardHeader className="pb-4">
          <div className="grid grid-cols-7 gap-2 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-sm font-medium text-gray-500 py-2 header-font">
                {day}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-7 gap-2">
            {monthDates.map((date, index) => {
              const status = getDateStatus(date)
              const availability = getDayAvailability(date)

              return (
                <Button
                  key={index}
                  variant="ghost"
                  className={`
                    h-12 p-1 relative body-font transition-all
                    ${
                      status.type === "past" || status.type === "other-month"
                        ? "text-gray-300 cursor-not-allowed"
                        : status.type === "unavailable"
                          ? "text-gray-400 cursor-not-allowed"
                          : status.type === "selected"
                            ? "bg-[#E75837] text-white hover:bg-[#d14a2a]"
                            : status.type === "in-range"
                              ? "bg-[#E75837]/20 text-[#E75837] hover:bg-[#E75837]/30"
                              : "hover:bg-gray-100 text-gray-900"
                    }
                  `}
                  onClick={() => status.available && handleDateSelect(date)}
                  disabled={!status.available}
                  title={`${date.toLocaleDateString()}: ${status.reason}`}
                >
                  <div className="flex flex-col items-center w-full">
                    <span className="text-sm font-medium">{date.getDate()}</span>
                    {status.available && availability.availableSlots > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="w-2 h-2" />
                        <span className="text-[10px]">{availability.availableSlots}</span>
                      </div>
                    )}
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Multi-day validation results */}
      {selectedStartDate && totalDays > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg header-font flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Booking Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const validation = getMultiDayValidation(selectedStartDate)
              if (!validation) return null

              return (
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 ${validation.valid ? "text-green-700" : "text-red-700"}`}>
                    {validation.valid ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span className="font-medium body-font">
                      {validation.valid
                        ? `All ${totalDays} days are available!`
                        : `Booking not available: ${validation.reason}`}
                    </span>
                  </div>

                  {validation.availabilityByDay && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {validation.availabilityByDay.map((day, index) => (
                        <div
                          key={day.date}
                          className={`p-2 rounded border text-sm body-font ${
                            day.available
                              ? "border-green-200 bg-green-50 text-green-800"
                              : "border-red-200 bg-red-50 text-red-800"
                          }`}
                        >
                          <div className="font-medium">
                            Day {index + 1}: {new Date(day.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs">
                            {day.available ? `${day.availableSlots} slots available` : day.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm body-font">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#E75837] rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#E75837]/20 border border-[#E75837]/40 rounded"></div>
              <span>In Range</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

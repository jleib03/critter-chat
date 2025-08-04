"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, Users, AlertCircle, CheckCircle2, CalendarDays } from "lucide-react"
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
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null)

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

  const calculateDateDifference = (startDate: string, endDate: string): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end dates
  }

  const handleDateSelect = (date: Date) => {
    const dateStr = formatDate(date)

    if (totalDays === 1) {
      // Single day booking
      setSelectedStartDate(dateStr)
      setSelectedEndDate(dateStr)
      onTimeSlotSelect({
        date: dateStr,
        startTime: "12:01 AM", // Use 12:01 AM as start time for full day
        endTime: "11:59 PM", // Use 11:59 PM as end time for full day
        dayOfWeek: getDayName(date),
      })
    } else {
      // Multi-day booking - allow manual start/end selection
      if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        // Start new selection
        setSelectedStartDate(dateStr)
        setSelectedEndDate(null)
      } else if (selectedStartDate && !selectedEndDate) {
        // Complete the selection
        const startDate = new Date(selectedStartDate)
        const endDate = new Date(dateStr)

        if (endDate < startDate) {
          // If end date is before start date, swap them
          setSelectedStartDate(dateStr)
          setSelectedEndDate(selectedStartDate)
        } else {
          setSelectedEndDate(dateStr)
        }

        // Calculate the actual date range
        const actualStartDate = endDate < startDate ? dateStr : selectedStartDate
        const actualEndDate = endDate < startDate ? selectedStartDate : dateStr
        const actualDays = calculateDateDifference(actualStartDate, actualEndDate)

        // Validate multi-day booking
        const validation = validateMultiDayBooking(
          actualStartDate,
          actualDays,
          professionalConfig,
          workingDays,
          bookingData,
        )

        if (validation.valid) {
          onTimeSlotSelect({
            date: actualStartDate,
            startTime: "12:01 AM", // Use 12:01 AM as start time for full day
            endTime: "11:59 PM", // Use 11:59 PM as end time for full day
            dayOfWeek: getDayName(new Date(actualStartDate)),
            endDate: actualEndDate, // Add end date for multi-day bookings
            totalDays: actualDays,
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

  const getMultiDayValidation = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return null

    const days = calculateDateDifference(startDate, endDate)
    return validateMultiDayBooking(startDate, days, professionalConfig, workingDays, bookingData)
  }

  const isDateInSelectedRange = (date: Date) => {
    if (!selectedStartDate) return false

    const dateStr = formatDate(date)

    if (totalDays === 1) {
      return selectedStartDate === dateStr
    }

    if (!selectedEndDate) {
      return selectedStartDate === dateStr
    }

    const startDate = new Date(selectedStartDate)
    const endDate = new Date(selectedEndDate)
    const actualStart = startDate <= endDate ? startDate : endDate
    const actualEnd = startDate <= endDate ? endDate : startDate

    return date >= actualStart && date <= actualEnd
  }

  const getDateStatus = (date: Date) => {
    const dateStr = formatDate(date)
    const availability = getDayAvailability(date)
    const isSelected = selectedTimeSlot?.date === dateStr
    const isInRange = isDateInSelectedRange(date)
    const isPast = isPastDate(date)
    const inCurrentMonth = isInCurrentMonth(date)
    const isStartDate = selectedStartDate === dateStr
    const isEndDate = selectedEndDate === dateStr

    if (isPast) return { type: "past", available: false, reason: "Past date" }
    if (!inCurrentMonth) return { type: "other-month", available: false, reason: "Other month" }
    if (availability.availableSlots <= 0) return { type: "unavailable", available: false, reason: availability.reason }
    if (isSelected) return { type: "selected", available: true, reason: "Selected" }
    if (isStartDate) return { type: "start-date", available: true, reason: "Start date" }
    if (isEndDate) return { type: "end-date", available: true, reason: "End date" }
    if (isInRange) return { type: "in-range", available: true, reason: "In selected range" }

    return { type: "available", available: true, reason: "Available" }
  }

  const getSelectedDateRange = () => {
    if (!selectedStartDate) return null

    if (totalDays === 1 || !selectedEndDate) {
      return {
        startDate: selectedStartDate,
        endDate: selectedStartDate,
        days: 1,
      }
    }

    const startDate = new Date(selectedStartDate)
    const endDate = new Date(selectedEndDate)
    const actualStart = startDate <= endDate ? selectedStartDate : selectedEndDate
    const actualEnd = startDate <= endDate ? selectedEndDate : selectedStartDate

    return {
      startDate: actualStart,
      endDate: actualEnd,
      days: calculateDateDifference(actualStart, actualEnd),
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 header-font">Select Your Dates</h2>
          <p className="text-gray-600 body-font">
            Choose {totalDays > 1 ? `${totalDays} or more consecutive days` : "a day"} for{" "}
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
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900 header-font">Multi-Day Booking</span>
            </div>
            <p className="text-sm text-blue-800 body-font">
              Click to select your check-in date, then click another date to select your check-out date. Minimum stay:{" "}
              {totalDays} days.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Selected date range display */}
      {(() => {
        const range = getSelectedDateRange()
        if (!range) return null

        return (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900 header-font">
                    {range.days === 1 ? "Selected Date" : "Selected Date Range"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedStartDate(null)
                    setSelectedEndDate(null)
                  }}
                  className="text-green-700 hover:text-green-900"
                >
                  Clear
                </Button>
              </div>
              <p className="text-sm text-green-800 body-font mt-1">
                {range.days === 1
                  ? `${new Date(range.startDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`
                  : `${new Date(range.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(range.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} (${range.days} days)`}
              </p>
            </CardContent>
          </Card>
        )
      })()}

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
                          : status.type === "selected" || status.type === "start-date" || status.type === "end-date"
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
      {selectedStartDate && selectedEndDate && totalDays > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg header-font flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Booking Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const validation = getMultiDayValidation(selectedStartDate, selectedEndDate)
              if (!validation) return null

              return (
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 ${validation.valid ? "text-green-700" : "text-red-700"}`}>
                    {validation.valid ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span className="font-medium body-font">
                      {validation.valid
                        ? `All ${calculateDateDifference(selectedStartDate, selectedEndDate)} days are available!`
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

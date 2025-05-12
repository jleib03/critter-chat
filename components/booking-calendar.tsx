"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Clock, Globe, Repeat, CalendarRange, ChevronUp, ChevronDown } from "lucide-react"

type BookingCalendarProps = {
  onSubmit: (bookingInfo: BookingInfo) => void
  onCancel: () => void
}

export type BookingInfo = {
  date: Date
  time: string
  timezone: string
  isRecurring: boolean
  recurringFrequency?: "weekly" | "daily"
  recurringEndDate?: Date
  isMultiDay: boolean
  endDate?: Date
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function BookingCalendar({ onSubmit, onCancel }: BookingCalendarProps) {
  // Current date for initial values
  const now = new Date()

  // State for calendar navigation
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())

  // State for selected values
  const [selectedDate, setSelectedDate] = useState<Date>(now)
  const [selectedTime, setSelectedTime] = useState("09:00")
  const [selectedTimezone, setSelectedTimezone] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<"weekly" | "daily">("weekly")
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [endDate, setEndDate] = useState<Date>(new Date(now.getTime() + 86400000)) // Next day by default
  const [recurringEndDate, setRecurringEndDate] = useState<Date>(new Date(now.getTime() + 7 * 86400000)) // Default to 1 week later

  // State for date selection dropdowns
  const [showRecurringDatePicker, setShowRecurringDatePicker] = useState(false)
  const [showMultiDayDatePicker, setShowMultiDayDatePicker] = useState(false)

  // Get user's timezone on component mount
  useEffect(() => {
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setSelectedTimezone(userTimezone)
    } catch (e) {
      setSelectedTimezone("America/New_York") // Default fallback
    }
  }, [])

  // Generate calendar days for the current month view
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

    const days = []

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
      })
    }

    // Next month days to fill the calendar grid (6 rows x 7 days = 42 cells)
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: currentMonth + 1,
        year: currentMonth === 11 ? currentYear + 1 : currentYear,
        isCurrentMonth: false,
      })
    }

    return days
  }

  // Generate a list of dates for the date picker
  const generateDateList = (startDate: Date, count: number) => {
    const dates = []
    for (let i = 0; i < count; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  // Navigate to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Check if a date is the selected date
  const isSelectedDate = (day: number, month: number, year: number) => {
    return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year
  }

  // Check if a date is today
  const isToday = (day: number, month: number, year: number) => {
    const today = new Date()
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  // Handle date selection
  const handleDateSelect = (day: number, month: number, year: number) => {
    setSelectedDate(new Date(year, month, day))
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  // Generate time options (every 30 minutes)
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const h = hour.toString().padStart(2, "0")
        const m = minute.toString().padStart(2, "0")
        options.push(`${h}:${m}`)
      }
    }
    return options
  }

  // Format time for display (12-hour format)
  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  // Common timezone options
  const timezoneOptions = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Phoenix",
    "America/Anchorage",
    "Pacific/Honolulu",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Australia/Sydney",
  ]

  // Format timezone for display
  const formatTimezone = (timezone: string) => {
    return timezone.replace("_", " ").replace(/\//g, " - ")
  }

  // Handle form submission
  const handleSubmit = () => {
    onSubmit({
      date: selectedDate,
      time: selectedTime,
      timezone: selectedTimezone,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      recurringEndDate: isRecurring ? recurringEndDate : undefined,
      isMultiDay,
      endDate: isMultiDay ? endDate : undefined,
    })
  }

  return (
    <div className="booking-calendar bg-white rounded-lg shadow-md p-4 max-w-md mx-auto">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100" aria-label="Previous month">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100" aria-label="Next month">
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day headers */}
        {DAYS.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {generateCalendarDays().map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateSelect(day.day, day.month, day.year)}
            className={`
              h-10 w-full rounded-full flex items-center justify-center text-sm
              ${!day.isCurrentMonth ? "text-gray-300" : "text-gray-800"}
              ${isSelectedDate(day.day, day.month, day.year) ? "bg-[#E75837] text-white" : ""}
              ${isToday(day.day, day.month, day.year) && !isSelectedDate(day.day, day.month, day.year) ? "border border-[#E75837]" : ""}
              hover:bg-gray-100
            `}
          >
            {day.day}
          </button>
        ))}
      </div>

      {/* Time Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Time
        </label>
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {generateTimeOptions().map((time) => (
            <option key={time} value={time}>
              {formatTimeForDisplay(time)}
            </option>
          ))}
        </select>
      </div>

      {/* Timezone Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <Globe className="h-4 w-4 mr-1" />
          Timezone
        </label>
        <select
          value={selectedTimezone}
          onChange={(e) => setSelectedTimezone(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {timezoneOptions.map((timezone) => (
            <option key={timezone} value={timezone}>
              {formatTimezone(timezone)}
            </option>
          ))}
        </select>
      </div>

      {/* Recurring Booking Option */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="recurring"
            checked={isRecurring}
            onChange={() => setIsRecurring(!isRecurring)}
            className="mr-2"
          />
          <label htmlFor="recurring" className="text-sm font-medium text-gray-700 flex items-center">
            <Repeat className="h-4 w-4 mr-1" />
            Recurring Booking
          </label>
        </div>

        {isRecurring && (
          <div className="space-y-3">
            <select
              value={recurringFrequency}
              onChange={(e) => setRecurringFrequency(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ends On</label>
              <div className="relative">
                <button
                  onClick={() => setShowRecurringDatePicker(!showRecurringDatePicker)}
                  className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center bg-white"
                >
                  <span>{formatDate(recurringEndDate)}</span>
                  {showRecurringDatePicker ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>

                {showRecurringDatePicker && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-1">
                      {generateDateList(new Date(selectedDate.getTime() + 86400000), 90).map((date, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setRecurringEndDate(date)
                            setShowRecurringDatePicker(false)
                          }}
                          className={`w-full text-left p-2 hover:bg-gray-100 ${
                            date.toDateString() === recurringEndDate.toDateString() ? "bg-gray-100 font-medium" : ""
                          }`}
                        >
                          {formatDate(date)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Multi-day Booking Option */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="multiDay"
            checked={isMultiDay}
            onChange={() => setIsMultiDay(!isMultiDay)}
            className="mr-2"
          />
          <label htmlFor="multiDay" className="text-sm font-medium text-gray-700 flex items-center">
            <CalendarRange className="h-4 w-4 mr-1" />
            Multi-day Booking
          </label>
        </div>

        {isMultiDay && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <div className="relative">
              <button
                onClick={() => setShowMultiDayDatePicker(!showMultiDayDatePicker)}
                className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center bg-white"
              >
                <span>{formatDate(endDate)}</span>
                {showMultiDayDatePicker ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {showMultiDayDatePicker && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-1">
                    {generateDateList(new Date(selectedDate.getTime() + 86400000), 90).map((date, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setEndDate(date)
                          setShowMultiDayDatePicker(false)
                        }}
                        className={`w-full text-left p-2 hover:bg-gray-100 ${
                          date.toDateString() === endDate.toDateString() ? "bg-gray-100 font-medium" : ""
                        }`}
                      >
                        {formatDate(date)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-[#E75837] text-white rounded-md hover:bg-[#d04e30]">
          Submit
        </button>
      </div>
    </div>
  )
}

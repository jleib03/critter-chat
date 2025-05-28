"use client"
import { useState } from "react"
import type React from "react"

import { Calendar, Clock, MapPin, X, Repeat, CalendarRange } from "lucide-react"
import type { BookingInfo } from "./booking-calendar"

interface DateTimePanelProps {
  isVisible: boolean
  isFormValid: boolean
  onSubmit: (bookingInfo: BookingInfo) => void
  onClose: () => void
  onSkip: () => void
}

// Timezone data with display names and actual timezone values
const timezones = [
  // North America
  { display: "Pacific Time (Los Angeles)", value: "America/Los_Angeles" },
  { display: "Mountain Time (Denver)", value: "America/Denver" },
  { display: "Central Time (Chicago)", value: "America/Chicago" },
  { display: "Eastern Time (New York)", value: "America/New_York" },

  // Europe
  { display: "London, UK (GMT/BST)", value: "Europe/London" },
  { display: "Paris, France (CET/CEST)", value: "Europe/Paris" },
  { display: "Berlin, Germany (CET/CEST)", value: "Europe/Berlin" },
  { display: "Rome, Italy (CET/CEST)", value: "Europe/Rome" },
  { display: "Madrid, Spain (CET/CEST)", value: "Europe/Madrid" },
  { display: "Amsterdam, Netherlands (CET/CEST)", value: "Europe/Amsterdam" },
  { display: "Zurich, Switzerland (CET/CEST)", value: "Europe/Zurich" },
  { display: "Stockholm, Sweden (CET/CEST)", value: "Europe/Stockholm" },
  { display: "Dublin, Ireland (GMT/IST)", value: "Europe/Dublin" },

  // Asia
  { display: "Dubai, UAE (GST)", value: "Asia/Dubai" },
  { display: "Mumbai, India (IST)", value: "Asia/Kolkata" },
  { display: "Singapore (SGT)", value: "Asia/Singapore" },
  { display: "Tokyo, Japan (JST)", value: "Asia/Tokyo" },

  // Australia
  { display: "Sydney, Australia (AEST/AEDT)", value: "Australia/Sydney" },
  { display: "Melbourne, Australia (AEST/AEDT)", value: "Australia/Melbourne" },
  { display: "Brisbane, Australia (AEST)", value: "Australia/Brisbane" },
  { display: "Perth, Australia (AWST)", value: "Australia/Perth" },

  // UTC
  { display: "UTC (Coordinated Universal Time)", value: "UTC" },
]

// Generate time options in 30-minute intervals with AM/PM format
const generateTimeOptions = () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    const period = hour < 12 ? "AM" : "PM"
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const hourStr = hour.toString().padStart(2, "0")

    // Add the option for the hour (e.g., "9:00 AM")
    options.push({
      value: `${hourStr}:00`,
      display: `${displayHour}:00 ${period}`,
    })

    // Add the option for the half hour (e.g., "9:30 AM")
    options.push({
      value: `${hourStr}:30`,
      display: `${displayHour}:30 ${period}`,
    })
  }
  return options
}

const timeOptions = generateTimeOptions()

export default function DateTimePanel({ isVisible, isFormValid, onSubmit, onClose, onSkip }: DateTimePanelProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState<string>("10:00")
  const [timezone, setTimezone] = useState<string>("America/Los_Angeles")
  const [isRecurring, setIsRecurring] = useState<boolean>(false)
  const [recurringFrequency, setRecurringFrequency] = useState<string | null>(null)
  const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null)
  const [isMultiDay, setIsMultiDay] = useState<boolean>(false)
  const [endDate, setEndDate] = useState<Date | null>(null)

  if (!isVisible) return null

  // Handle date input change to ensure we get the correct date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isFormValid) return
    const inputDate = e.target.value // Format: YYYY-MM-DD
    const [year, month, day] = inputDate.split("-").map(Number)
    const newDate = new Date(year, month - 1, day)
    setDate(newDate)
  }

  // Handle recurring end date change
  const handleRecurringEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isFormValid) return
    if (!e.target.value) {
      setRecurringEndDate(null)
      return
    }

    const inputDate = e.target.value
    const [year, month, day] = inputDate.split("-").map(Number)
    const newDate = new Date(year, month - 1, day)
    setRecurringEndDate(newDate)
  }

  // Handle multi-day end date change
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isFormValid) return
    if (!e.target.value) {
      setEndDate(null)
      return
    }

    const inputDate = e.target.value
    const [year, month, day] = inputDate.split("-").map(Number)
    const newDate = new Date(year, month - 1, day)
    setEndDate(newDate)
  }

  const handleSubmit = () => {
    if (!isFormValid) return

    const bookingInfo: BookingInfo = {
      date,
      time,
      timezone,
      isRecurring,
      recurringFrequency,
      recurringEndDate,
      isMultiDay,
      endDate,
    }
    onSubmit(bookingInfo)
  }

  const handleSkip = () => {
    if (!isFormValid) return
    onSkip()
  }

  // Format date to YYYY-MM-DD for input value
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return ""

    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  // Check if form is valid
  const isDateTimeFormValid = () => {
    if (!isFormValid) return false
    if (!date || !time) return false
    if (isRecurring && (!recurringFrequency || !recurringEndDate)) return false
    if (isMultiDay && !endDate) return false
    return true
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#E75837] text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold header-font">Select Date and Time</h2>
          <p className="text-sm opacity-90 body-font">
            {isFormValid
              ? "Choose when you'd like to schedule this service"
              : "Complete your information on the left to continue"}
          </p>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Form validation notice */}
      {!isFormValid && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 px-4 py-3 text-sm body-font">
          <p>Please complete your email, first name, and last name on the left to schedule your booking.</p>
        </div>
      )}

      {/* Content */}
      <div className={`flex-grow overflow-y-auto p-4 space-y-4 ${!isFormValid ? "opacity-50" : ""}`}>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            Date:
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="date"
              disabled={!isFormValid}
              className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font ${
                isFormValid ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
              }`}
              value={formatDateForInput(date)}
              onChange={handleDateChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            Time:
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="time"
              disabled={!isFormValid}
              className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font appearance-none ${
                isFormValid ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
              }`}
              value={time}
              onChange={(e) => isFormValid && setTime(e.target.value)}
            >
              {timeOptions.map((timeOption) => (
                <option key={timeOption.value} value={timeOption.value}>
                  {timeOption.display}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            Timezone:
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="timezone"
              disabled={!isFormValid}
              className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font ${
                isFormValid ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
              }`}
              value={timezone}
              onChange={(e) => isFormValid && setTimezone(e.target.value)}
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.display}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recurring Booking Option */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center mb-3">
            <Repeat className="h-5 w-5 text-[#E75837] mr-2" />
            <h3 className="text-md font-medium header-font">Recurring Booking</h3>
          </div>

          <div className="mb-4">
            <label className="flex items-center body-font">
              <input
                type="checkbox"
                disabled={!isFormValid}
                className="mr-2 h-4 w-4 text-[#E75837] focus:ring-2 focus:ring-[#E75837] border-gray-300 rounded"
                checked={isRecurring}
                onChange={(e) => isFormValid && setIsRecurring(e.target.checked)}
              />
              This is a recurring booking
            </label>
          </div>

          {isRecurring && (
            <div className="pl-6 space-y-4">
              <div>
                <label
                  htmlFor="recurringFrequency"
                  className="block text-sm font-medium text-gray-700 mb-2 header-font"
                >
                  Frequency*
                </label>
                <select
                  id="recurringFrequency"
                  disabled={!isFormValid}
                  value={recurringFrequency || ""}
                  onChange={(e) => isFormValid && setRecurringFrequency(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font ${
                    isFormValid ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
                  }`}
                  required={isRecurring}
                >
                  <option value="">Select frequency</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label htmlFor="recurringEndDate" className="block text-sm font-medium text-gray-700 mb-2 header-font">
                  End Date*
                </label>
                <input
                  type="date"
                  id="recurringEndDate"
                  disabled={!isFormValid}
                  value={formatDateForInput(recurringEndDate)}
                  onChange={handleRecurringEndDateChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font ${
                    isFormValid ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
                  }`}
                  required={isRecurring}
                />
              </div>
            </div>
          )}
        </div>

        {/* Multi-Day Booking Option */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center mb-3">
            <CalendarRange className="h-5 w-5 text-[#E75837] mr-2" />
            <h3 className="text-md font-medium header-font">Multi-Day Booking</h3>
          </div>

          <div className="mb-4">
            <label className="flex items-center body-font">
              <input
                type="checkbox"
                disabled={!isFormValid}
                className="mr-2 h-4 w-4 text-[#E75837] focus:ring-2 focus:ring-[#E75837] border-gray-300 rounded"
                checked={isMultiDay}
                onChange={(e) => isFormValid && setIsMultiDay(e.target.checked)}
              />
              This booking spans multiple days
            </label>
          </div>

          {isMultiDay && (
            <div className="pl-6">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2 header-font">
                End Date*
              </label>
              <input
                type="date"
                id="endDate"
                disabled={!isFormValid}
                value={formatDateForInput(endDate)}
                onChange={handleEndDateChange}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font ${
                  isFormValid ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
                }`}
                required={isMultiDay}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex justify-between">
        <button
          onClick={handleSkip}
          disabled={!isFormValid}
          className={`text-sm underline focus:outline-none body-font ${
            isFormValid ? "text-gray-500 hover:text-gray-700" : "text-gray-300 cursor-not-allowed"
          }`}
        >
          I don't need a calendar
        </button>

        <button
          onClick={handleSubmit}
          disabled={!isDateTimeFormValid()}
          className={`px-6 py-2 rounded-lg body-font ${
            isDateTimeFormValid()
              ? "bg-[#745E25] text-white hover:bg-[#5d4b1e] transition-colors"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit
        </button>
      </div>
    </div>
  )
}

"use client"
import { useState } from "react"
import type React from "react"

export type BookingInfo = {
  date: Date
  time: string
  timezone: string
  isRecurring: boolean
  recurringFrequency: string | null
  recurringEndDate: Date | null
  isMultiDay: boolean
  endDate: Date | null
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
  { display: "Edinburgh, UK (GMT/BST)", value: "Europe/London" },
  { display: "Manchester, UK (GMT/BST)", value: "Europe/London" },

  // Africa
  { display: "Johannesburg, South Africa (SAST)", value: "Africa/Johannesburg" },
  { display: "Cape Town, South Africa (SAST)", value: "Africa/Johannesburg" },
  { display: "Durban, South Africa (SAST)", value: "Africa/Johannesburg" },
  { display: "Cairo, Egypt (EET/EEST)", value: "Africa/Cairo" },

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
  { display: "Adelaide, Australia (ACST/ACDT)", value: "Australia/Adelaide" },
  { display: "Hobart, Australia (AEST/AEDT)", value: "Australia/Hobart" },
  { display: "Darwin, Australia (ACST)", value: "Australia/Darwin" },

  // New Zealand
  { display: "Auckland, New Zealand (NZST/NZDT)", value: "Pacific/Auckland" },
  { display: "Wellington, New Zealand (NZST/NZDT)", value: "Pacific/Auckland" },
  { display: "Christchurch, New Zealand (NZST/NZDT)", value: "Pacific/Auckland" },

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

export default function BookingCalendar({
  onSubmit,
  onCancel,
}: { onSubmit: (bookingInfo: BookingInfo) => void; onCancel: () => void }) {
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState<string>("10:00")
  const [timezone, setTimezone] = useState<string>("America/Los_Angeles")
  const [isRecurring, setIsRecurring] = useState<boolean>(false)
  const [recurringFrequency, setRecurringFrequency] = useState<string | null>(null)
  const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null)
  const [isMultiDay, setIsMultiDay] = useState<boolean>(false)
  const [endDate, setEndDate] = useState<Date | null>(null)

  // Handle date input change to ensure we get the correct date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Create a date object from the input value (which is in YYYY-MM-DD format)
    // This ensures we get the date as selected without timezone issues
    const inputDate = e.target.value // Format: YYYY-MM-DD
    const [year, month, day] = inputDate.split("-").map(Number)

    // Create a new date using local components to avoid timezone issues
    // Month is 0-indexed in JavaScript Date, so subtract 1
    const newDate = new Date(year, month - 1, day)
    setDate(newDate)
  }

  // Handle recurring end date change
  const handleRecurringEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Format date to YYYY-MM-DD for input value
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return ""

    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  return (
    <div className="booking-calendar">
      <h3 className="text-lg font-medium mb-4 header-font">Select Date and Time</h3>

      <div className="mb-4">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 body-font">
          Date:
        </label>
        <input
          type="date"
          id="date"
          className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-[#E75837] focus:outline-none body-font"
          value={formatDateForInput(date)}
          onChange={handleDateChange}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="time" className="block text-sm font-medium text-gray-700 body-font">
          Time:
        </label>
        <select
          id="time"
          className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-[#E75837] focus:outline-none body-font"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        >
          {timeOptions.map((timeOption) => (
            <option key={timeOption.value} value={timeOption.value}>
              {timeOption.display}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 body-font">
          Timezone:
        </label>
        <select
          id="timezone"
          className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-[#E75837] focus:outline-none body-font"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.display}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="flex items-center body-font">
          <input
            type="checkbox"
            className="mr-2 h-4 w-4 text-[#E75837] focus:ring-2 focus:ring-[#E75837] border-gray-300 rounded"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
          Recurring Booking
        </label>
      </div>

      {isRecurring && (
        <>
          <div className="mb-4">
            <label htmlFor="recurringFrequency" className="block text-sm font-medium text-gray-700 body-font">
              Frequency:
            </label>
            <select
              id="recurringFrequency"
              className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-[#E75837] focus:outline-none body-font"
              value={recurringFrequency || ""}
              onChange={(e) => setRecurringFrequency(e.target.value)}
            >
              <option value="">Select Frequency</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="recurringEndDate" className="block text-sm font-medium text-gray-700 body-font">
              End Date:
            </label>
            <input
              type="date"
              id="recurringEndDate"
              className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-[#E75837] focus:outline-none body-font"
              value={formatDateForInput(recurringEndDate)}
              onChange={handleRecurringEndDateChange}
            />
          </div>
        </>
      )}

      <div className="mb-4">
        <label className="flex items-center body-font">
          <input
            type="checkbox"
            className="mr-2 h-4 w-4 text-[#E75837] focus:ring-2 focus:ring-[#E75837] border-gray-300 rounded"
            checked={isMultiDay}
            onChange={(e) => setIsMultiDay(e.target.checked)}
          />
          Multi-Day Booking
        </label>
      </div>

      {isMultiDay && (
        <div className="mb-4">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 body-font">
            End Date:
          </label>
          <input
            type="date"
            id="endDate"
            className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-[#E75837] focus:outline-none body-font"
            value={formatDateForInput(endDate)}
            onChange={handleEndDateChange}
          />
        </div>
      )}

      <div className="flex justify-between items-center mt-6">
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 text-sm underline focus:outline-none body-font"
          onClick={onCancel}
        >
          I don't need a calendar
        </button>

        <button
          type="button"
          className="bg-[#745E25] text-white border-none py-2 px-4 rounded-full cursor-pointer font-medium text-sm transition-colors duration-300 hover:bg-[#5d4b1e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(116,94,37,0.3)] body-font"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  )
}

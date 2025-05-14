"use client"
import { useState } from "react"

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

const timezones = ["America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York", "UTC"]

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
          value={date.toISOString().split("T")[0]}
          onChange={(e) => setDate(new Date(e.target.value))}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="time" className="block text-sm font-medium text-gray-700 body-font">
          Time:
        </label>
        <input
          type="time"
          id="time"
          className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-[#E75837] focus:outline-none body-font"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
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
            <option key={tz} value={tz}>
              {tz}
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
              value={recurringEndDate ? recurringEndDate.toISOString().split("T")[0] : ""}
              onChange={(e) => setRecurringEndDate(new Date(e.target.value))}
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
            value={endDate ? endDate.toISOString().split("T")[0] : ""}
            onChange={(e) => setEndDate(new Date(e.target.value))}
          />
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          className="bg-gray-200 text-gray-700 border-none py-2 px-4 rounded-full cursor-pointer font-medium text-sm transition-colors duration-300 hover:bg-gray-300 focus:outline-none focus:shadow-[0_0_0_3px_rgba(156,163,175,0.3)] mr-2 body-font"
          onClick={onCancel}
        >
          Cancel
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

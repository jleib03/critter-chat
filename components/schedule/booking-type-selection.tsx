"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Repeat, ArrowLeft, ArrowRight, Clock, CalendarDays } from "lucide-react"
import type { Service } from "@/types/schedule"

export type BookingType = "one-time" | "recurring" | "multi-day"

export type RecurringConfig = {
  frequency: number
  unit: "day" | "week" | "month"
  endDate: string
  totalAppointments: number
  daysOfWeek: string[]
  selectedDays: string[]
  originalEndDate: string
  originalUnit?: "day" | "week"
  originalFrequency?: number
}

type BookingTypeSelectionProps = {
  selectedServices: Service[]
  onBookingTypeSelect: (type: BookingType, recurringConfig?: RecurringConfig) => void
  onBack: () => void
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const FREQUENCY_OPTIONS = [
  { value: 1, label: "Every week" },
  { value: 2, label: "Every 2 weeks" },
  { value: 3, label: "Every 3 weeks" },
  { value: 4, label: "Every 4 weeks" },
]

const DAILY_FREQUENCY_OPTIONS = [
  { value: 1, label: "Every day" },
  { value: 2, label: "Every 2 days" },
  { value: 3, label: "Every 3 days" },
  { value: 4, label: "Every 4 days" },
  { value: 5, label: "Every 5 days" },
  { value: 6, label: "Every 6 days" },
  { value: 7, label: "Every 7 days" },
]

export function BookingTypeSelection({ selectedServices, onBookingTypeSelect, onBack }: BookingTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<BookingType | null>(null)
  const [isCustomFrequency, setIsCustomFrequency] = useState(false)
  const [customFrequencyValue, setCustomFrequencyValue] = useState("")
  const [isDailyMode, setIsDailyMode] = useState(false)

  const [recurringConfig, setRecurringConfig] = useState<RecurringConfig>({
    frequency: 1,
    unit: "week",
    endDate: "",
    totalAppointments: 0,
    daysOfWeek: [],
    selectedDays: [],
    originalEndDate: "",
  })

  const { serviceNames, totalDurationString } = useMemo(() => {
    const totalMinutes = selectedServices.reduce((acc, service) => {
      let durationInMinutes = service.duration_number
      const unit = service.duration_unit.toLowerCase()
      if (unit.startsWith("hour")) {
        durationInMinutes = service.duration_number * 60
      } else if (unit.startsWith("day")) {
        durationInMinutes = service.duration_number * 24 * 60
      }
      return acc + durationInMinutes
    }, 0)

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    let durationString = ""
    if (hours > 0) {
      durationString += `${hours} hour${hours > 1 ? "s" : ""} `
    }
    if (minutes > 0) {
      durationString += `${minutes} minute${minutes > 1 ? "s" : ""}`
    }

    return {
      serviceNames: selectedServices.map((s) => s.name).join(", "),
      totalDurationString: durationString.trim() || "0 minutes",
    }
  }, [selectedServices])

  const handleContinue = () => {
    window.scrollTo(0, 0)

    if (selectedType === "one-time") {
      onBookingTypeSelect("one-time")
    } else if (selectedType === "recurring") {
      let configForWebhook = { ...recurringConfig }

      if (isDailyMode) {
        configForWebhook = {
          ...recurringConfig,
          unit: "week",
          frequency: 1,
          daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          selectedDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          originalUnit: "day" as any,
          originalFrequency: recurringConfig.frequency,
        }
      }

      const configWithOriginals = {
        ...configForWebhook,
        selectedDays: configForWebhook.daysOfWeek,
        originalEndDate: configForWebhook.endDate,
      }
      onBookingTypeSelect("recurring", configWithOriginals)
    }
  }

  const isFormValid = () => {
    if (selectedType === "one-time") return true
    if (selectedType === "recurring") {
      if (isDailyMode) {
        return recurringConfig.endDate !== ""
      }
      return recurringConfig.daysOfWeek.length > 0 && recurringConfig.endDate !== ""
    }
    return false
  }

  const handleDayToggle = (day: string) => {
    setRecurringConfig((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)),
    }))
  }

  const handleFrequencyChange = (frequency: number) => {
    setIsCustomFrequency(false)
    setCustomFrequencyValue("")
    setRecurringConfig((prev) => ({
      ...prev,
      frequency,
    }))
  }

  const handleDailyFrequencyChange = (frequency: number) => {
    setIsCustomFrequency(false)
    setCustomFrequencyValue("")
    setRecurringConfig((prev) => ({
      ...prev,
      frequency,
      unit: "day",
    }))
  }

  const handleCustomFrequencySelect = () => {
    setIsCustomFrequency(true)
    const customValue = customFrequencyValue ? Number.parseInt(customFrequencyValue) : isDailyMode ? 2 : 5
    setRecurringConfig((prev) => ({
      ...prev,
      frequency: customValue,
    }))
  }

  const handleCustomFrequencyChange = (value: string) => {
    setCustomFrequencyValue(value)
    const numValue = Number.parseInt(value)
    if (!isNaN(numValue) && numValue > 0) {
      setRecurringConfig((prev) => ({
        ...prev,
        frequency: numValue,
      }))
    }
  }

  const getMinEndDate = () => {
    const today = new Date()
    const minDate = new Date(today)
    minDate.setDate(today.getDate() + (isDailyMode ? recurringConfig.frequency : 7))
    return minDate.toISOString().split("T")[0]
  }

  const getFrequencyLabel = () => {
    if (isCustomFrequency) {
      if (isDailyMode) {
        return `every ${recurringConfig.frequency} days`
      }
      return `every ${recurringConfig.frequency} weeks`
    }

    if (isDailyMode) {
      const option = DAILY_FREQUENCY_OPTIONS.find((opt) => opt.value === recurringConfig.frequency)
      return option ? option.label.toLowerCase() : `every ${recurringConfig.frequency} days`
    }

    const option = FREQUENCY_OPTIONS.find((opt) => opt.value === recurringConfig.frequency)
    return option ? option.label.toLowerCase() : `every ${recurringConfig.frequency} weeks`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#E75837] mb-2 header-font">Booking Type</h2>
        <p className="text-gray-600 body-font">
          How would you like to schedule <span className="font-medium">{serviceNames}</span>?
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <Card
          className={`cursor-pointer transition-all ${
            selectedType === "one-time" ? "ring-2 ring-[#E75837] bg-[#fff8f6]" : "hover:bg-gray-50"
          }`}
          onClick={() => setSelectedType("one-time")}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-full ${
                  selectedType === "one-time" ? "bg-[#E75837] text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 header-font">One-time Service</h3>
                <p className="text-gray-600 body-font">Schedule a single appointment for {serviceNames}.</p>
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  Total Duration: {totalDurationString}
                </div>
              </div>
              {selectedType === "one-time" && (
                <div className="w-6 h-6 bg-[#E75837] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            selectedType === "recurring" ? "ring-2 ring-[#E75837] bg-[#fff8f6]" : "hover:bg-gray-50"
          }`}
          onClick={() => setSelectedType("recurring")}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-full ${
                  selectedType === "recurring" ? "bg-[#E75837] text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                <Repeat className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 header-font">Recurring Service</h3>
                <p className="text-gray-600 body-font">
                  Schedule regular appointments for {serviceNames} with custom frequency options.
                </p>
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <CalendarDays className="w-4 h-4 mr-1" />
                  Perfect for ongoing pet care needs
                </div>
              </div>
              {selectedType === "recurring" && (
                <div className="w-6 h-6 bg-[#E75837] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedType === "recurring" && (
        <Card className="mb-8 border-[#E75837]/20">
          <CardHeader>
            <CardTitle className="text-lg text-[#E75837] header-font">Recurring Schedule Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 header-font">Recurrence Type*</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDailyMode(true)
                      setRecurringConfig((prev) => ({ ...prev, unit: "day", frequency: 1, daysOfWeek: [] }))
                    }}
                    className={`p-3 text-sm rounded-lg border transition-all body-font text-center ${
                      isDailyMode
                        ? "bg-[#E75837] text-white border-[#E75837]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#E75837] hover:bg-[#fff8f6]"
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDailyMode(false)
                      setRecurringConfig((prev) => ({ ...prev, unit: "week", frequency: 1, daysOfWeek: [] }))
                    }}
                    className={`p-3 text-sm rounded-lg border transition-all body-font text-center ${
                      !isDailyMode
                        ? "bg-[#E75837] text-white border-[#E75837]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#E75837] hover:bg-[#fff8f6]"
                    }`}
                  >
                    Weekly
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 body-font">
                  {isDailyMode
                    ? "Daily appointments will run every day during your selected period"
                    : "Weekly appointments let you choose specific days of the week"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 header-font">
                  {isDailyMode
                    ? "How often should daily appointments repeat?*"
                    : "How often should appointments repeat?*"}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(isDailyMode ? DAILY_FREQUENCY_OPTIONS : FREQUENCY_OPTIONS).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        isDailyMode ? handleDailyFrequencyChange(option.value) : handleFrequencyChange(option.value)
                      }
                      className={`p-3 text-sm rounded-lg border transition-all body-font text-left ${
                        !isCustomFrequency && recurringConfig.frequency === option.value
                          ? "bg-[#E75837] text-white border-[#E75837]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#E75837] hover:bg-[#fff8f6]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleCustomFrequencySelect}
                    className={`p-3 text-sm rounded-lg border transition-all body-font text-left ${
                      isCustomFrequency
                        ? "bg-[#E75837] text-white border-[#E75837]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#E75837] hover:bg-[#fff8f6]"
                    }`}
                  >
                    Custom
                  </button>
                </div>
                {isCustomFrequency && (
                  <div className="mt-3 flex items-center space-x-2">
                    <span className="text-sm text-gray-700 body-font">Every</span>
                    <input
                      type="number"
                      min="1"
                      max={isDailyMode ? "30" : "52"}
                      value={customFrequencyValue}
                      onChange={(e) => handleCustomFrequencyChange(e.target.value)}
                      placeholder={isDailyMode ? "2" : "5"}
                      className="w-20 p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font text-center"
                    />
                    <span className="text-sm text-gray-700 body-font">{isDailyMode ? "days" : "weeks"}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2 body-font">
                  {isDailyMode
                    ? "Choose how frequently your daily appointments should repeat"
                    : "Choose how frequently your appointments should repeat"}
                </p>
              </div>

              {!isDailyMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 header-font">
                    Select days of the week*
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`p-3 text-sm rounded-lg border transition-all body-font ${
                          recurringConfig.daysOfWeek.includes(day)
                            ? "bg-[#E75837] text-white border-[#E75837]"
                            : "bg-white text-gray-700 border-gray-300 hover:border-[#E75837] hover:bg-[#fff8f6]"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 body-font">
                    Select one or more days for your recurring appointments
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2 header-font">
                  End date*
                </label>
                <input
                  type="date"
                  id="endDate"
                  min={getMinEndDate()}
                  value={recurringConfig.endDate}
                  onChange={(e) =>
                    setRecurringConfig((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
                />
                <p className="text-xs text-gray-500 mt-1 body-font">Last possible appointment date</p>
              </div>
            </div>

            {((isDailyMode && recurringConfig.endDate) ||
              (!isDailyMode && recurringConfig.daysOfWeek.length > 0 && recurringConfig.endDate)) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 header-font">Schedule Preview</h4>
                <p className="text-sm text-gray-600 body-font">
                  {isDailyMode ? (
                    <>
                      Appointments will repeat <span className="font-medium">{getFrequencyLabel()}</span> until{" "}
                      <span className="font-medium">
                        {new Date(recurringConfig.endDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </>
                  ) : (
                    <>
                      Appointments will repeat <span className="font-medium">{getFrequencyLabel()}</span> on{" "}
                      <span className="font-medium">
                        {recurringConfig.daysOfWeek.length === 1
                          ? recurringConfig.daysOfWeek[0]
                          : recurringConfig.daysOfWeek.length === 2
                            ? `${recurringConfig.daysOfWeek[0]} and ${recurringConfig.daysOfWeek[1]}`
                            : `${recurringConfig.daysOfWeek.slice(0, -1).join(", ")}, and ${recurringConfig.daysOfWeek.slice(
                                -1,
                              )}`}
                      </span>{" "}
                      until{" "}
                      <span className="font-medium">
                        {new Date(recurringConfig.endDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1 body-font">
                  {isDailyMode
                    ? "We'll show you time slots available for your daily schedule"
                    : "We'll show you time slots that work for your entire recurring schedule"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center body-font bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Services
        </Button>

        <Button
          onClick={handleContinue}
          disabled={!isFormValid()}
          className={`flex items-center body-font ${
            isFormValid()
              ? "bg-[#E75837] hover:bg-[#d04e30] text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue to Calendar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

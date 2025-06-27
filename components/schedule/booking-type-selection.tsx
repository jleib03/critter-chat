"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Repeat, ArrowLeft, ArrowRight, Clock, CalendarDays } from "lucide-react"
import type { Service } from "@/types/schedule"

export type BookingType = "one-time" | "recurring"

export type RecurringConfig = {
  daysOfWeek: string[] // e.g., ["Monday", "Wednesday", "Friday"]
  endDate: string
}

type BookingTypeSelectionProps = {
  selectedService: Service
  onBookingTypeSelect: (type: BookingType, recurringConfig?: RecurringConfig) => void
  onBack: () => void
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function BookingTypeSelection({ selectedService, onBookingTypeSelect, onBack }: BookingTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<BookingType | null>(null)
  const [recurringConfig, setRecurringConfig] = useState<RecurringConfig>({
    daysOfWeek: [],
    endDate: "",
  })

  const handleContinue = () => {
    if (selectedType === "one-time") {
      onBookingTypeSelect("one-time")
    } else if (selectedType === "recurring") {
      onBookingTypeSelect("recurring", recurringConfig)
    }
  }

  const isFormValid = () => {
    if (selectedType === "one-time") return true
    if (selectedType === "recurring") {
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

  // Generate minimum end date (at least 1 week from today)
  const getMinEndDate = () => {
    const today = new Date()
    const minDate = new Date(today)
    minDate.setDate(today.getDate() + 7) // At least 1 week from now
    return minDate.toISOString().split("T")[0]
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#E75837] mb-2 header-font">Booking Type</h2>
        <p className="text-gray-600 body-font">
          How would you like to schedule <span className="font-medium">{selectedService.name}</span>?
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {/* One-time booking option */}
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
                <p className="text-gray-600 body-font">Schedule a single appointment for {selectedService.name}.</p>
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  Duration: {selectedService.duration_number} {selectedService.duration_unit.toLowerCase()}
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

        {/* Recurring booking option */}
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
                  Schedule regular weekly appointments for {selectedService.name}.
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

      {/* Recurring booking configuration */}
      {selectedType === "recurring" && (
        <Card className="mb-8 border-[#E75837]/20">
          <CardHeader>
            <CardTitle className="text-lg text-[#E75837] header-font">Recurring Schedule Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
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
                  Select one or more days for your weekly recurring appointments
                </p>
              </div>

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

            {/* Preview of recurring schedule */}
            {recurringConfig.daysOfWeek.length > 0 && recurringConfig.endDate && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 header-font">Schedule Preview</h4>
                <p className="text-sm text-gray-600 body-font">
                  Appointments will repeat every{" "}
                  <span className="font-medium">
                    {recurringConfig.daysOfWeek.length === 1
                      ? recurringConfig.daysOfWeek[0]
                      : recurringConfig.daysOfWeek.length === 2
                        ? `${recurringConfig.daysOfWeek[0]} and ${recurringConfig.daysOfWeek[1]}`
                        : `${recurringConfig.daysOfWeek.slice(0, -1).join(", ")}, and ${recurringConfig.daysOfWeek.slice(-1)}`}
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
                </p>
                <p className="text-xs text-gray-500 mt-1 body-font">
                  We'll show you time slots that work for your entire recurring schedule
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center body-font">
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

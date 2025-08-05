"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Repeat, CalendarDays, ArrowLeft } from "lucide-react"
import type { Service } from "@/types/schedule"

export type BookingType = "one-time" | "recurring" | "multi-day"

export type RecurringConfig = {
  frequency: number
  unit: "day" | "week" | "month"
  endDate: string
  totalAppointments: number
  daysOfWeek?: string[]
  selectedDays?: string[]
  originalEndDate?: string
}

type BookingTypeSelectionProps = {
  selectedService: Service
  onBookingTypeSelect: (type: BookingType, config?: RecurringConfig) => void
  onBack: () => void
}

export function BookingTypeSelection({ selectedService, onBookingTypeSelect, onBack }: BookingTypeSelectionProps) {
  const [showRecurringOptions, setShowRecurringOptions] = useState(false)
  const [recurringConfig, setRecurringConfig] = useState<RecurringConfig>({
    frequency: 1,
    unit: "week",
    endDate: "",
    totalAppointments: 4,
  })

  // Check if service is longer than 12 hours
  const isLongDurationService = () => {
    const { duration_number, duration_unit } = selectedService
    if (duration_unit === "Hours" && duration_number > 12) return true
    if (duration_unit === "Days" && duration_number >= 1) return true
    return false
  }

  const handleRecurringSubmit = () => {
    onBookingTypeSelect("recurring", recurringConfig)
  }

  if (showRecurringOptions) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-0 rounded-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Button
                onClick={() => setShowRecurringOptions(false)}
                variant="ghost"
                size="sm"
                className="absolute left-6 top-6"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Repeat className="w-6 h-6 text-[#E75837]" />
            </div>
            <CardTitle className="text-xl header-font">Set Up Recurring Booking</CardTitle>
            <p className="text-gray-600 body-font">Configure your recurring appointment schedule</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Repeat every</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={recurringConfig.frequency}
                    onChange={(e) =>
                      setRecurringConfig({ ...recurringConfig, frequency: Number.parseInt(e.target.value) || 1 })
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                  />
                  <select
                    value={recurringConfig.unit}
                    onChange={(e) =>
                      setRecurringConfig({ ...recurringConfig, unit: e.target.value as "day" | "week" | "month" })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                  >
                    <option value="day">Day(s)</option>
                    <option value="week">Week(s)</option>
                    <option value="month">Month(s)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End date</label>
                <input
                  type="date"
                  value={recurringConfig.endDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setRecurringConfig({ ...recurringConfig, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum appointments</label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={recurringConfig.totalAppointments}
                  onChange={(e) =>
                    setRecurringConfig({ ...recurringConfig, totalAppointments: Number.parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setShowRecurringOptions(false)} variant="outline" className="flex-1 rounded-lg">
                Cancel
              </Button>
              <Button
                onClick={handleRecurringSubmit}
                disabled={!recurringConfig.endDate}
                className="flex-1 bg-[#E75837] hover:bg-[#d14a2a] text-white rounded-lg font-medium transition-colors"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Button onClick={onBack} variant="ghost" size="sm" className="absolute left-6 top-6">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Calendar className="w-6 h-6 text-[#E75837]" />
          </div>
          <CardTitle className="text-xl header-font">Choose Booking Type</CardTitle>
          <p className="text-gray-600 body-font">How would you like to schedule your {selectedService.name}?</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* One-time booking */}
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-[#E75837]"
              onClick={() => onBookingTypeSelect("one-time")}
            >
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-[#E75837] mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2 header-font">One-time</h3>
                <p className="text-sm text-gray-600 body-font">Schedule a single appointment</p>
              </CardContent>
            </Card>

            {/* Recurring booking */}
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-[#E75837]"
              onClick={() => setShowRecurringOptions(true)}
            >
              <CardContent className="p-6 text-center">
                <Repeat className="w-8 h-8 text-[#E75837] mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2 header-font">Recurring</h3>
                <p className="text-sm text-gray-600 body-font">Set up regular appointments</p>
              </CardContent>
            </Card>

            {/* Multi-day booking - only show for long duration services */}
            {isLongDurationService() && (
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-[#E75837]"
                onClick={() => onBookingTypeSelect("multi-day")}
              >
                <CardContent className="p-6 text-center">
                  <CalendarDays className="w-8 h-8 text-[#E75837] mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2 header-font">Multi-day</h3>
                  <p className="text-sm text-gray-600 body-font">Book extended stay or overnight service</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

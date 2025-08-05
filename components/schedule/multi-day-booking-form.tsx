"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"
import type { Service } from "@/types/schedule"

type MultiDayBookingFormProps = {
  selectedService: Service
  onAvailabilityCheck: (start: Date, end: Date) => Promise<{ available: boolean; reason?: string }>
  onBookingConfirm: (start: Date, end: Date) => void
  onBack: () => void
}

export function MultiDayBookingForm({
  selectedService,
  onAvailabilityCheck,
  onBookingConfirm,
  onBack,
}: MultiDayBookingFormProps) {
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("17:00")
  const [checking, setChecking] = useState(false)
  const [availabilityResult, setAvailabilityResult] = useState<{
    available: boolean
    reason?: string
  } | null>(null)

  const handleAvailabilityCheck = async () => {
    if (!startDate || !endDate) return

    setChecking(true)
    setAvailabilityResult(null)

    try {
      const start = new Date(`${startDate}T${startTime}`)
      const end = new Date(`${endDate}T${endTime}`)

      if (start >= end) {
        setAvailabilityResult({
          available: false,
          reason: "End date and time must be after start date and time.",
        })
        setChecking(false)
        return
      }

      const result = await onAvailabilityCheck(start, end)
      setAvailabilityResult(result)
    } catch (error) {
      setAvailabilityResult({
        available: false,
        reason: "Error checking availability. Please try again.",
      })
    } finally {
      setChecking(false)
    }
  }

  const handleConfirmBooking = () => {
    if (!startDate || !endDate || !availabilityResult?.available) return

    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)
    onBookingConfirm(start, end)
  }

  const canCheckAvailability = startDate && endDate && startTime && endTime
  const canConfirmBooking = availabilityResult?.available

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Button onClick={onBack} variant="ghost" size="sm" className="absolute left-6 top-6">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CalendarDays className="w-6 h-6 text-[#E75837]" />
          </div>
          <CardTitle className="text-xl header-font">Multi-Day Booking</CardTitle>
          <p className="text-gray-600 body-font">Select your start and end dates for {selectedService.name}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-1 header-font">{selectedService.name}</h3>
            <p className="text-sm text-gray-600 body-font">{selectedService.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>
                Duration: {selectedService.duration_number} {selectedService.duration_unit.toLowerCase()}
              </span>
              <span>Cost: ${Number.parseFloat(selectedService.customer_cost).toFixed(0)}</span>
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate}
                min={startDate || new Date().toISOString().split("T")[0]}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
              />
            </div>
          </div>

          {/* Availability Check */}
          <div className="space-y-4">
            <Button
              onClick={handleAvailabilityCheck}
              disabled={!canCheckAvailability || checking}
              className="w-full bg-[#E75837] hover:bg-[#d14a2a] text-white rounded-lg font-medium transition-colors"
            >
              {checking ? "Checking Availability..." : "Check Availability"}
            </Button>

            {availabilityResult && (
              <div
                className={`flex items-center gap-3 p-4 rounded-lg ${
                  availabilityResult.available
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {availabilityResult.available ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-medium ${availabilityResult.available ? "text-green-800" : "text-red-800"}`}>
                    {availabilityResult.available ? "Available!" : "Not Available"}
                  </p>
                  {availabilityResult.reason && (
                    <p className={`text-sm ${availabilityResult.available ? "text-green-600" : "text-red-600"}`}>
                      {availabilityResult.reason}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Booking */}
          {canConfirmBooking && (
            <div className="pt-4 border-t">
              <Button
                onClick={handleConfirmBooking}
                className="w-full bg-[#E75837] hover:bg-[#d14a2a] text-white rounded-lg font-medium transition-colors"
              >
                Continue to Customer Information
              </Button>
            </div>
          )}

          {/* Alternative Contact */}
          {availabilityResult && !availabilityResult.available && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 text-center mb-3">
                Can't find the dates you need? Contact the professional directly.
              </p>
              <Button
                onClick={() => window.open("https://critter.app", "_blank")}
                variant="outline"
                className="w-full rounded-lg"
              >
                Contact via Critter App
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

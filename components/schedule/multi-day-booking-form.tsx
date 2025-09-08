"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, ArrowLeft, ArrowRight, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import type { Service } from "@/types/schedule"

interface MultiDayBookingFormProps {
  selectedService: Service
  onAvailabilityCheck: (
    start: Date,
    end: Date,
  ) => Promise<{ available: boolean; reason: string; availableSlots?: number }>
  onBookingConfirm: (start: Date, end: Date) => void
  onBack: () => void
}

export function MultiDayBookingForm({
  selectedService,
  onAvailabilityCheck,
  onBookingConfirm,
  onBack,
}: MultiDayBookingFormProps) {
  const [startDate, setStartDate] = useState<string>("")
  const [startTime, setStartTime] = useState<string>("09:00")
  const [endDate, setEndDate] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("17:00")
  const [availability, setAvailability] = useState<{
    checked: boolean
    available: boolean
    reason: string
    availableSlots?: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckAvailability = async () => {
    if (!startDate || !endDate || !startTime || !endTime) {
      alert("Please select start and end dates and times.")
      return
    }
    setIsLoading(true)
    setAvailability(null)
    const startDateTime = new Date(`${startDate}T${startTime}`)
    const endDateTime = new Date(`${endDate}T${endTime}`)

    if (endDateTime <= startDateTime) {
      alert("End date and time must be after the start date and time.")
      setIsLoading(false)
      return
    }

    const result = await onAvailabilityCheck(startDateTime, endDateTime)
    setAvailability({ checked: true, ...result })
    setIsLoading(false)
  }

  const handleConfirm = () => {
    window.scrollTo(0, 0)
    const startDateTime = new Date(`${startDate}T${startTime}`)
    const endDateTime = new Date(`${endDate}T${endTime}`)
    onBookingConfirm(startDateTime, endDateTime)
  }

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = i % 2 === 0 ? "00" : "30"
    return `${String(hour).padStart(2, "0")}:${minute}`
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#E75837] header-font">
          Select Stay Duration for {selectedService.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date/Time */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg header-font">Drop-off</h3>
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1 body-font">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 p-2 border rounded-md"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div>
              <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-1 body-font">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  id="start-time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 p-2 border rounded-md appearance-none"
                >
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>
                      {new Date(`1970-01-01T${t}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* End Date/Time */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg header-font">Pick-up</h3>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1 body-font">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 p-2 border rounded-md"
                  min={startDate || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div>
              <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-1 body-font">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  id="end-time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-10 p-2 border rounded-md appearance-none"
                >
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>
                      {new Date(`1970-01-01T${t}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCheckAvailability}
          disabled={isLoading}
          className="w-full bg-[#E75837] hover:bg-[#d04e30]"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? "Checking..." : "Check Availability"}
        </Button>

        {availability?.checked && (
          <div
            className={`p-4 rounded-md flex items-center gap-3 ${
              availability.available ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
          >
            {availability.available ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <div>
              <p className={`font-semibold ${availability.available ? "text-green-800" : "text-red-800"}`}>
                {availability.available ? "Dates are available!" : "Dates are not available"}
                {availability.available && availability.availableSlots !== undefined && (
                  <span className="ml-2 text-sm font-normal">
                    ({availability.availableSlots} overnight {availability.availableSlots === 1 ? "slot" : "slots"}{" "}
                    available)
                  </span>
                )}
              </p>
              <p className={`text-sm ${availability.available ? "text-green-700" : "text-red-700"}`}>
                {availability.reason}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              window.scrollTo(0, 0)
              onBack()
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!availability?.available}
            className="bg-[#E75837] hover:bg-[#d04e30]"
          >
            Continue to Booking
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

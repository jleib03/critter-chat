"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Service, SelectedTimeSlot, CustomerInfo, Pet } from "@/types/schedule"
import type { RecurringConfig } from "./booking-type-selection"

type BookingConfirmationProps = {
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  customerInfo: CustomerInfo
  selectedPet: Pet
  professionalName: string
  onNewBooking: () => void
  bookingType?: "one-time" | "recurring"
  recurringConfig?: RecurringConfig | null
  isDirectBooking: boolean
}

export function BookingConfirmation({
  selectedServices,
  selectedTimeSlot,
  customerInfo,
  selectedPet,
  professionalName,
  onNewBooking,
  bookingType,
  recurringConfig,
  isDirectBooking,
}: BookingConfirmationProps) {
  const formatPrice = (price: string) => {
    return `$${Number.parseFloat(price).toFixed(0)}`
  }

  const formatDuration = (duration: number, unit?: string) => {
    if (!unit) return `${duration}` //––early exit if unit is missing

    if (unit === "Minutes") {
      if (duration >= 60) {
        const hours = Math.floor(duration / 60)
        const minutes = duration % 60
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
      }
      return `${duration}m`
    }
    if (unit === "Hours") return duration === 1 ? `${duration} hour` : `${duration} hours`
    if (unit === "Days") return duration === 1 ? `${duration} day` : `${duration} days`

    // Fallback – lowercase only when unit exists
    return `${duration} ${unit.toLowerCase()}`
  }

  const totalDurationMinutes = selectedServices.reduce((acc, service) => {
    let duration = service.duration_number
    if (service.duration_unit === "Hours") {
      duration *= 60
    } else if (service.duration_unit === "Days") {
      duration *= 60 * 24
    }
    return acc + duration
  }, 0)

  const formatTotalDuration = () => {
    if (totalDurationMinutes >= 60) {
      const hours = Math.floor(totalDurationMinutes / 60)
      const minutes = totalDurationMinutes % 60
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
    return `${totalDurationMinutes}m`
  }

  const totalPrice = selectedServices.reduce((acc, service) => {
    return acc + Number.parseFloat(service.customer_cost)
  }, 0)

  const formatTotalPrice = () => {
    return `$${totalPrice.toFixed(0)}`
  }

  const formatRecurringDays = (days: string[]) => {
    if (!days || days.length === 0) return ""

    const dayNames = {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    }

    const formattedDays = days.map((day) => dayNames[day.toLowerCase() as keyof typeof dayNames] || day)

    if (formattedDays.length === 1) {
      return formattedDays[0]
    } else if (formattedDays.length === 2) {
      return `${formattedDays[0]} and ${formattedDays[1]}`
    } else {
      return `${formattedDays.slice(0, -1).join(", ")}, and ${formattedDays[formattedDays.length - 1]}`
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50 shadow-lg border-0 rounded-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl header-font">
            {isDirectBooking ? "Booking Confirmed!" : "Request Submitted!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 body-font">
              {isDirectBooking
                ? `Your appointment has been successfully scheduled with ${professionalName}.`
                : `Your appointment request has been successfully submitted to ${professionalName}.`}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Services:</span>
              <span className="font-medium">{selectedServices.map((s) => s.name).join(", ")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {selectedTimeSlot.dayOfWeek}, {selectedTimeSlot.date}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{selectedTimeSlot.startTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pet:</span>
              <span className="font-medium">
                {selectedPet.pet_name} ({selectedPet.pet_type})
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">
                {customerInfo.firstName} {customerInfo.lastName}
              </span>
            </div>
            {bookingType === "recurring" && recurringConfig && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Recurring:</span>
                <span className="font-medium text-blue-600">
                  Every {recurringConfig.daysOfWeek?.join(", ")} until{" "}
                  {new Date(recurringConfig.endDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button
              onClick={onNewBooking}
              className="bg-[#E75837] hover:bg-[#d14a2a] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Book Another Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

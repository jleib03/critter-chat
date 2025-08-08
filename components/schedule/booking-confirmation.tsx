"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Service, SelectedTimeSlot, CustomerInfo, Pet } from "@/types/schedule"
import type { BookingType, RecurringConfig } from "./booking-type-selection"

type BookingConfirmationProps = {
  selectedServices: Service[]
  selectedTimeSlots: SelectedTimeSlot[] // Changed from selectedTimeSlot
  customerInfo: CustomerInfo
  selectedPets: Pet[]
  professionalName: string
  onNewBooking: () => void
  bookingType?: BookingType | "one-time"
  recurringConfig?: RecurringConfig | null
  multiDayTimeSlot?: { start: Date; end: Date } | null
  isDirectBooking: boolean
  showPrices: boolean
}

export function BookingConfirmation({
  selectedServices,
  selectedTimeSlots, // Changed
  customerInfo,
  selectedPets,
  professionalName,
  onNewBooking,
  bookingType,
  recurringConfig,
  multiDayTimeSlot,
  isDirectBooking,
  showPrices,
}: BookingConfirmationProps) {
  const formatMultiDayDateTime = (date: Date) => {
    if (!date) return ""
    return new Date(date).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const calculateMultiDayInfo = () => {
    if (!multiDayTimeSlot || !selectedServices.length) {
      return { durationLabel: "", totalCost: 0 }
    }
    const service = selectedServices[0]
    const rate = Number(service.customer_cost)
    const unit = service.duration_unit.toLowerCase()
    const diffMs = new Date(multiDayTimeSlot.end).getTime() - new Date(multiDayTimeSlot.start).getTime()

    let billableUnits = 0
    let durationLabel = ""

    if (unit.startsWith("day")) {
      billableUnits = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      const nights = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      durationLabel = `${nights} Night${nights !== 1 ? "s" : ""} / ${billableUnits} Day${billableUnits !== 1 ? "s" : ""}`
    } else if (unit.startsWith("hour")) {
      billableUnits = Math.ceil(diffMs / (1000 * 60 * 60))
      durationLabel = `${billableUnits} Hour${billableUnits !== 1 ? "s" : ""}`
    } else {
      billableUnits = 1
      durationLabel = "1 Stay"
    }

    return {
      durationLabel,
      totalCost: billableUnits * rate,
    }
  }

  const multiDayInfo = calculateMultiDayInfo()

  return (
    <Card className="shadow-lg border-0 rounded-2xl">
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

          {bookingType === "multi-day" && multiDayTimeSlot ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Drop-off:</span>
                <span className="font-medium">{formatMultiDayDateTime(multiDayTimeSlot.start)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pick-up:</span>
                <span className="font-medium">{formatMultiDayDateTime(multiDayTimeSlot.end)}</span>
              </div>
            </>
          ) : (
            <>
              {selectedTimeSlots.length > 1 ? (
                <div className="text-sm">
                  <span className="text-gray-600">Appointments:</span>
                  <ul className="list-disc list-inside font-medium text-right -mt-4">
                    {selectedTimeSlots.map((slot, index) => (
                      <li key={index}>
                        {slot.dayOfWeek}, {slot.date} at {slot.startTime}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {selectedTimeSlots[0].dayOfWeek}, {selectedTimeSlots[0].date}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{selectedTimeSlots[0].startTime}</span>
                  </div>
                </>
              )}
            </>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pet(s):</span>
            <span className="font-medium text-right">
              {selectedPets.map((pet) => pet.pet_name).join(", ")}
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
  )
}

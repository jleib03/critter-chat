"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Service, SelectedTimeSlot, CustomerInfo, Pet } from "@/types/schedule"
import type { RecurringConfig, BookingType } from "./booking-type-selection"

type BookingConfirmationProps = {
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  customerInfo: CustomerInfo
  selectedPet: Pet
  professionalName: string
  onNewBooking: () => void
  bookingType?: BookingType
  recurringConfig?: RecurringConfig | null
  isDirectBooking: boolean
  multiDayTimeSlot?: { start: Date; end: Date } | null
  showPrices: boolean
}

const formatMultiDayRange = (start: Date, end: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }
  return `${start.toLocaleString("en-US", options)} - ${end.toLocaleString("en-US", options)}`
}

const calculateMultiDayCost = (start: Date, end: Date, service: Service): number => {
  if (!service) return 0
  const durationMs = end.getTime() - start.getTime()
  const rate = Number(service.customer_cost)

  const unit = service.duration_unit.toLowerCase()
  if (unit.startsWith("day")) {
    const durationInDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24))
    return durationInDays * rate
  } else if (unit.startsWith("hour")) {
    const durationInHours = Math.ceil(durationMs / (1000 * 60 * 60))
    return durationInHours * rate
  }

  return rate
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
  multiDayTimeSlot,
  showPrices,
}: BookingConfirmationProps) {
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
                <span className="text-gray-600">Stay Duration:</span>
                <span className="font-medium text-right">
                  {formatMultiDayRange(multiDayTimeSlot.start, multiDayTimeSlot.end)}
                </span>
              </div>
              {showPrices && selectedServices.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Cost:</span>
                  <span className="font-medium">
                    $
                    {calculateMultiDayCost(multiDayTimeSlot.start, multiDayTimeSlot.end, selectedServices[0]).toFixed(
                      2,
                    )}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
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
            </>
          )}

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
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { SelectedTimeSlot, Service, CustomerInfo, Pet } from "@/types/schedule"
import type { BookingType, RecurringConfig } from "./booking-type-selection"

type BookingConfirmationProps = {
  selectedTimeSlot?: SelectedTimeSlot | null
  selectedTimeSlots?: SelectedTimeSlot[]
  customerInfo: CustomerInfo
  selectedPets: Pet[]
  professionalName: string
  onNewBooking: () => void
  bookingType: BookingType | null
  recurringConfig: RecurringConfig | null
  selectedServices: Service[]
  isDirectBooking: boolean
  multiDayTimeSlot?: { start: Date; end: Date } | null
  showPrices: boolean
}

export function BookingConfirmation({
  selectedTimeSlot,
  selectedTimeSlots = [],
  customerInfo,
  selectedPets,
  professionalName,
  onNewBooking,
  bookingType,
  recurringConfig,
  selectedServices,
  isDirectBooking,
  multiDayTimeSlot,
  showPrices,
}: BookingConfirmationProps) {
  const multipleWindows = Array.isArray(selectedTimeSlots) && selectedTimeSlots.length > 0

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number)
    const dt = new Date(y, m - 1, d)
    return dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="rounded-2xl shadow-lg border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl header-font">
            {isDirectBooking ? "Booking Confirmed" : "Request Submitted"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Professional:</span>
              <span className="font-medium">{professionalName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Services:</span>
              <span className="font-medium">{selectedServices.map((s) => s.name).join(", ")}</span>
            </div>

            {bookingType === "multi-day" && multiDayTimeSlot ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Drop-off:</span>
                  <span className="font-medium">
                    {new Date(multiDayTimeSlot.start).toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pick-up:</span>
                  <span className="font-medium">
                    {new Date(multiDayTimeSlot.end).toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </>
            ) : multipleWindows ? (
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Selected Times:</div>
                <ul className="text-sm">
                  {selectedTimeSlots.map((slot, idx) => (
                    <li key={`${slot.date}-${slot.startTime}-${idx}`} className="flex justify-between">
                      <span>{formatDate(slot.date)}</span>
                      <span className="font-medium">{slot.startTime}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : selectedTimeSlot ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(selectedTimeSlot.date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedTimeSlot.startTime}</span>
                </div>
              </>
            ) : null}

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

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pet(s):</span>
              <span className="font-medium text-right">{selectedPets.map((p) => p.pet_name).join(", ")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">
                {customerInfo.firstName} {customerInfo.lastName}
              </span>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={onNewBooking}
              className="bg-[#E75837] hover:bg-[#d14a2a] text-white rounded-lg font-medium transition-colors"
            >
              Book Another
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

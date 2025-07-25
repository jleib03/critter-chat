import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  )
}

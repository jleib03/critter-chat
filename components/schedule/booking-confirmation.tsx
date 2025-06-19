"use client"

import type { Service, SelectedTimeSlot, CustomerInfo, Pet } from "@/types/schedule"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Clock, User, Mail, DollarSign, Heart } from "lucide-react"

type BookingConfirmationProps = {
  selectedService: Service
  selectedTimeSlot: SelectedTimeSlot
  customerInfo: CustomerInfo
  selectedPet: Pet
  professionalName: string
  onNewBooking: () => void
}

export function BookingConfirmation({
  selectedService,
  selectedTimeSlot,
  customerInfo,
  selectedPet,
  professionalName,
  onNewBooking,
}: BookingConfirmationProps) {
  const formatPrice = (price: string) => {
    return `$${Number.parseFloat(price).toFixed(0)}`
  }

  const formatDuration = (duration: number, unit: string) => {
    if (unit === "Minutes") {
      if (duration >= 60) {
        const hours = Math.floor(duration / 60)
        const minutes = duration % 60
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
      }
      return `${duration}m`
    }
    if (unit === "Hours") {
      return duration === 1 ? `${duration} hour` : `${duration} hours`
    }
    if (unit === "Days") {
      return duration === 1 ? `${duration} day` : `${duration} days`
    }
    return `${duration} ${unit.toLowerCase()}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center bg-green-50 rounded-t-lg">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl header-font text-green-700 mb-2">Booking Successfully Created!</CardTitle>
          <p className="text-green-600 body-font text-lg">Your appointment has been confirmed. We'll see you soon!</p>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 header-font mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#E75837]" />
              Appointment Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-gray-500 text-sm body-font block">Date</span>
                    <p className="font-semibold body-font text-gray-900">{formatDate(selectedTimeSlot.date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-gray-500 text-sm body-font block">Time</span>
                    <p className="font-semibold body-font text-gray-900">
                      {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service & Cost */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-gray-500 text-sm body-font block">Professional</span>
                    <p className="font-semibold body-font text-gray-900">{professionalName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-gray-500 text-sm body-font block">Total Cost</span>
                    <p className="font-semibold body-font text-gray-900 text-lg">
                      {formatPrice(selectedService.customer_cost)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 body-font text-lg mb-3">Service Details</h4>
            <div className="space-y-2">
              <p className="font-medium body-font text-gray-900">{selectedService.name}</p>
              <p className="text-sm text-gray-600 body-font">
                Duration: {formatDuration(selectedService.duration_number, selectedService.duration_unit)}
              </p>
              {selectedService.description && (
                <p className="text-sm text-gray-600 body-font">{selectedService.description}</p>
              )}
            </div>
          </div>

          {/* Customer & Pet Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="bg-orange-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 body-font text-lg mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#E75837]" />
                Customer Information
              </h4>
              <div className="space-y-2">
                <p className="font-medium body-font text-gray-900">
                  {customerInfo.firstName} {customerInfo.lastName}
                </p>
                <p className="text-sm text-gray-600 body-font">{customerInfo.email}</p>
              </div>
            </div>

            {/* Pet Info */}
            <div className="bg-purple-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 body-font text-lg mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-600" />
                Pet Information
              </h4>
              <div className="space-y-2">
                <p className="font-medium body-font text-gray-900">{selectedPet.pet_name}</p>
                <p className="text-sm text-gray-600 body-font capitalize">
                  {selectedPet.pet_type} • {selectedPet.breed}
                </p>
                {selectedPet.age && <p className="text-sm text-gray-600 body-font">Age: {selectedPet.age}</p>}
                {selectedPet.weight && <p className="text-sm text-gray-600 body-font">Weight: {selectedPet.weight}</p>}
                {selectedPet.special_notes && (
                  <p className="text-sm text-gray-600 body-font">
                    <span className="font-medium">Special Notes:</span> {selectedPet.special_notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-yellow-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 body-font text-lg mb-4">What's Next?</h4>
            <ul className="space-y-3 text-sm text-gray-700 body-font">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                You'll receive a confirmation email with all the details shortly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                {professionalName} will contact you if any changes are needed
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                Please arrive 5-10 minutes early for your appointment
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                If you need to reschedule, contact the professional directly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                Bring any special items your pet might need for the service
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={onNewBooking}
              className="bg-[#E75837] hover:bg-[#d14d2a] text-white px-8 py-3 text-lg body-font"
            >
              Book Another Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

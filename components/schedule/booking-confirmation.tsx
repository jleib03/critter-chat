"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, Clock, DollarSign, User, PawPrint, Mail } from "lucide-react"
import type { Service, SelectedTimeSlot, CustomerInfo, Pet } from "@/types/schedule"

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-800 mb-2 header-font">Booking Confirmed!</h1>
            <p className="text-green-700 body-font text-lg">
              Your appointment has been successfully scheduled with {professionalName}.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl header-font text-[#E75837] flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Information */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 header-font">Service</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900 body-font">{selectedService.name}</p>
                  {selectedService.description && (
                    <p className="text-sm text-gray-600 body-font mt-1">{selectedService.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="body-font">
                        {formatDuration(selectedService.duration_number, selectedService.duration_unit)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="body-font font-medium">{formatPrice(selectedService.customer_cost)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 header-font">Date & Time</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium body-font">
                      {selectedTimeSlot.dayOfWeek},{" "}
                      {new Date(selectedTimeSlot.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium body-font">
                      {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Pet Information */}
            <div className="space-y-4">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 header-font">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium body-font">
                      {customerInfo.firstName} {customerInfo.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 body-font">{customerInfo.email}</span>
                  </div>
                </div>
              </div>

              {/* Pet Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 header-font">Pet Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PawPrint className="w-4 h-4 text-gray-500" />
                    <span className="font-medium body-font">
                      {selectedPet.pet_name} ({selectedPet.pet_type})
                    </span>
                  </div>
                  {selectedPet.breed && (
                    <div className="mb-2">
                      <Badge variant="secondary" className="text-xs body-font">
                        {selectedPet.breed}
                      </Badge>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 body-font">
                    {selectedPet.age && <span>Age: {selectedPet.age}</span>}
                    {selectedPet.weight && <span>Weight: {selectedPet.weight}</span>}
                  </div>
                  {selectedPet.special_notes && (
                    <div className="mt-2 p-2 bg-white rounded border">
                      <p className="text-xs text-gray-600 body-font">
                        <span className="font-medium">Notes:</span> {selectedPet.special_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl header-font text-[#E75837]">Professional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900 body-font mb-2">{professionalName}</p>
            <p className="text-sm text-gray-600 body-font">
              You will receive a confirmation email shortly with additional details and contact information.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl header-font text-[#E75837]">What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm body-font">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#E75837] text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Confirmation Email</p>
                <p className="text-gray-600">
                  You'll receive a confirmation email at {customerInfo.email} with your appointment details.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#E75837] text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Prepare for Your Appointment</p>
                <p className="text-gray-600">
                  Make sure {selectedPet.pet_name} is ready for their {selectedService.name.toLowerCase()} appointment.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#E75837] text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Contact if Needed</p>
                <p className="text-gray-600">
                  If you need to reschedule or have questions, contact {professionalName} directly.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onNewBooking} className="bg-[#E75837] hover:bg-[#d14a2a] text-white body-font">
          Book Another Appointment
        </Button>
        <Button variant="outline" onClick={() => window.print()} className="body-font">
          Print Confirmation
        </Button>
      </div>
    </div>
  )
}

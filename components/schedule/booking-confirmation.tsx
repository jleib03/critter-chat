"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, Clock, DollarSign, User, PawPrint, Mail, Repeat } from "lucide-react"
import type { Service, SelectedTimeSlot, CustomerInfo, Pet, RecurringConfig } from "@/types/schedule"

type BookingConfirmationProps = {
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  customerInfo: CustomerInfo
  selectedPet: Pet
  professionalName: string
  onNewBooking: () => void
  bookingType?: "one-time" | "recurring"
  recurringConfig?: RecurringConfig | null
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
                <h3 className="font-semibold text-gray-900 mb-2 header-font">Services</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {selectedServices.map((service) => (
                      <li key={service.id} className="mb-2">
                        <p className="font-medium text-gray-900 body-font">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-gray-600 body-font mt-1">{service.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="body-font">
                              {formatDuration(service.duration_number, service.duration_unit)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span className="body-font font-medium">{formatPrice(service.customer_cost)}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 header-font">Total Duration:</span>
                      <span className="font-medium text-gray-900 body-font">{formatTotalDuration()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold text-gray-900 header-font">Total Cost:</span>
                      <span className="font-medium text-gray-900 body-font">{formatTotalPrice()}</span>
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

              {bookingType === "recurring" && recurringConfig && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 header-font">Recurring Schedule</h3>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Repeat className="w-4 h-4 text-blue-500" />
                      <span className="font-medium body-font text-blue-900">
                        Every {recurringConfig.frequency} {recurringConfig.unit.toLowerCase()}
                        {recurringConfig.frequency > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="text-sm text-blue-700 body-font space-y-1">
                      <div>
                        Until:{" "}
                        {new Date(recurringConfig.endDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                  Make sure {selectedPet.pet_name} is ready for their{" "}
                  {selectedServices.map((s) => s.name.toLowerCase()).join(", ")} appointment
                  {selectedServices.length > 1 ? "s" : ""}.
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

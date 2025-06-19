"use client"

import type { Service, SelectedTimeSlot, CustomerInfo } from "@/types/schedule"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Clock, User, Mail, DollarSign } from "lucide-react"

type BookingConfirmationProps = {
  selectedService: Service
  selectedTimeSlot: SelectedTimeSlot
  customerInfo: CustomerInfo
  professionalName: string
  onNewBooking: () => void
}

export function BookingConfirmation({
  selectedService,
  selectedTimeSlot,
  customerInfo,
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
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl header-font text-green-600">Booking Confirmed!</CardTitle>
          <p className="text-gray-600 body-font">
            Your appointment has been successfully scheduled. You'll receive a confirmation email shortly.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 header-font text-lg">Appointment Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-gray-500 text-sm body-font">Professional:</span>
                  <p className="font-medium body-font">{professionalName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-gray-500 text-sm body-font">Date:</span>
                  <p className="font-medium body-font">
                    {selectedTimeSlot.dayOfWeek},{" "}
                    {new Date(selectedTimeSlot.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-gray-500 text-sm body-font">Time:</span>
                  <p className="font-medium body-font">
                    {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-gray-500 text-sm body-font">Cost:</span>
                  <p className="font-medium body-font">{formatPrice(selectedService.customer_cost)}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 body-font">{selectedService.name}</h4>
              <p className="text-sm text-gray-600 body-font">
                Duration: {formatDuration(selectedService.duration_number, selectedService.duration_unit)}
              </p>
              {selectedService.description && (
                <p className="text-sm text-gray-600 body-font mt-1">{selectedService.description}</p>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 header-font text-lg mb-3">Customer Information</h3>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium body-font">
                  {customerInfo.firstName} {customerInfo.lastName}
                </p>
                <p className="text-sm text-gray-600 body-font">{customerInfo.email}</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 header-font text-lg mb-3">What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-700 body-font">
              <li>• You'll receive a confirmation email with all the details</li>
              <li>• The professional will contact you if any changes are needed</li>
              <li>• Please arrive 5-10 minutes early for your appointment</li>
              <li>• If you need to reschedule, contact the professional directly</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <Button onClick={onNewBooking} variant="outline" className="body-font">
              Book Another Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

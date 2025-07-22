"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Clock, Calendar, DollarSign, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import type { Service, SelectedTimeSlot, CustomerInfo, Pet } from "@/types/schedule"
import type { BookingType, RecurringConfig } from "./booking-type-selection"

type NotificationPreference = "1_hour" | "1_day" | "1_week"

interface PetSelectionProps {
  pets: Pet[]
  customerInfo: CustomerInfo
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  professionalName: string
  isDirectBooking: boolean
  onPetSelect: (pet: Pet, notifications: NotificationPreference[]) => void
  onBack: () => void
  bookingType?: BookingType | null
  recurringConfig?: RecurringConfig | null
}

export function PetSelection({
  pets,
  customerInfo,
  selectedServices,
  selectedTimeSlot,
  professionalName,
  isDirectBooking,
  onPetSelect,
  onBack,
  bookingType,
  recurringConfig,
}: PetSelectionProps) {
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [selectedNotifications, setSelectedNotifications] = useState<NotificationPreference[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate totals
  const totalCost = selectedServices.reduce((sum, service) => {
    return sum + Number.parseFloat(service.customer_cost.toString())
  }, 0)

  const totalDuration = selectedServices.reduce((sum, service) => {
    let durationInMinutes = service.duration_number
    if (service.duration_unit === "Hours") {
      durationInMinutes = service.duration_number * 60
    } else if (service.duration_unit === "Days") {
      durationInMinutes = service.duration_number * 24 * 60
    }
    return sum + durationInMinutes
  }, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}m`
    }
  }

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatRecurringInfo = () => {
    if (!recurringConfig || !bookingType || bookingType !== "recurring") {
      return null
    }

    const daysText = recurringConfig.daysOfWeek?.join(", ") || ""
    const endDateFormatted = new Date(recurringConfig.endDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    return `Every ${daysText} until ${endDateFormatted}`
  }

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet)
  }

  const handleNotificationToggle = (value: NotificationPreference) => {
    setSelectedNotifications((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value)
      } else {
        return [...prev, value]
      }
    })
  }

  const handleSubmit = () => {
    if (!selectedPet) {
      toast({
        title: "Please select a pet",
        description: "You need to select a pet to continue.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    onPetSelect(selectedPet, selectedNotifications)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="text-gray-600 hover:text-gray-900 body-font">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Customer Information
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pet Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl header-font text-[#E75837]">Select Your Pet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 body-font">No pets found for this account.</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4">
                    {pets.map((pet) => (
                      <div
                        key={pet.pet_id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPet?.pet_id === pet.pet_id
                            ? "border-[#E75837] bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handlePetSelect(pet)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-5 h-5 rounded-full border ${
                                selectedPet?.pet_id === pet.pet_id
                                  ? "border-4 border-[#E75837]"
                                  : "border border-gray-300"
                              }`}
                            />
                            <div>
                              <h3 className="font-medium text-gray-900 body-font">{pet.pet_name}</h3>
                              <p className="text-sm text-gray-500 body-font">
                                {pet.pet_type}
                                {pet.breed ? ` • ${pet.breed}` : ""}
                                {pet.age ? ` • ${pet.age}` : ""}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs body-font">
                            {pet.pet_type}
                          </Badge>
                        </div>
                        {selectedPet?.pet_id === pet.pet_id && pet.special_notes && (
                          <div className="mt-3 text-sm text-gray-600 body-font">
                            <p className="font-medium">Special Notes:</p>
                            <p className="mt-1">{pet.special_notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Notification Preferences - Only for Direct Bookings */}
                  {isDirectBooking && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2 body-font">
                        <Bell className="w-4 h-4 text-gray-500" />
                        Notification Preferences
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="notification-1hour"
                            checked={selectedNotifications.includes("1_hour")}
                            onCheckedChange={() => handleNotificationToggle("1_hour")}
                          />
                          <label
                            htmlFor="notification-1hour"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 body-font"
                          >
                            1 hour before appointment
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="notification-1day"
                            checked={selectedNotifications.includes("1_day")}
                            onCheckedChange={() => handleNotificationToggle("1_day")}
                          />
                          <label
                            htmlFor="notification-1day"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 body-font"
                          >
                            1 day before appointment
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="notification-1week"
                            checked={selectedNotifications.includes("1_week")}
                            onCheckedChange={() => handleNotificationToggle("1_week")}
                          />
                          <label
                            htmlFor="notification-1week"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 body-font"
                          >
                            1 week before appointment
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedPet || isSubmitting}
                    className="w-full mt-4 bg-[#E75837] hover:bg-[#d14a2a] text-white body-font"
                  >
                    {isDirectBooking ? "Confirm Booking" : "Submit Request"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl header-font text-[#E75837]">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date & Time */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <h3 className="font-medium text-gray-900 body-font">Date & Time</h3>
              </div>
              <p className="text-gray-700 body-font">{formatDate(selectedTimeSlot.date)}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <p className="text-gray-700 body-font">{selectedTimeSlot.startTime}</p>
              </div>
            </div>

            {/* Services */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <h3 className="font-medium text-gray-900 body-font">Services</h3>
              </div>
              <div className="space-y-3">
                {selectedServices.map((service, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 body-font">{service.name}</p>
                      <p className="text-sm text-gray-600 body-font">
                        {service.duration_number}{" "}
                        {service.duration_unit === "Minutes"
                          ? service.duration_number === 1
                            ? "minute"
                            : "minutes"
                          : service.duration_unit.toLowerCase()}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900 body-font">
                      {formatCurrency(Number.parseFloat(service.customer_cost.toString()))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-900 body-font">Total</p>
                <p className="font-semibold text-gray-900 body-font text-lg">{formatCurrency(totalCost)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 body-font">Duration</p>
                <p className="text-sm text-gray-600 body-font">{formatDuration(totalDuration)}</p>
              </div>
            </div>

            {/* Booking Type */}
            {bookingType && (
              <div className="pt-4 border-t">
                <Badge
                  className={`body-font ${
                    bookingType === "one-time"
                      ? "bg-[#E75837] hover:bg-[#d14a2a] text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {bookingType === "one-time" ? "One-time Booking" : "Recurring Booking"}
                </Badge>
                {recurringConfig && bookingType === "recurring" && (
                  <p className="text-sm text-gray-600 mt-2 body-font">{formatRecurringInfo()}</p>
                )}
              </div>
            )}

            {/* Customer Info */}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 body-font">
                <span className="font-medium">Customer:</span> {customerInfo.firstName} {customerInfo.lastName}
              </p>
              <p className="text-sm text-gray-600 body-font">
                <span className="font-medium">Email:</span> {customerInfo.email}
              </p>
            </div>

            {/* Professional Info */}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 body-font">
                <span className="font-medium">with</span> {professionalName}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Export both named and default
export default PetSelection

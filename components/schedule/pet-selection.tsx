"use client"

import { useState } from "react"
import type { Pet, Service, SelectedTimeSlot, CustomerInfo } from "@/types/schedule"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, PawPrint, User, Calendar, Clock, DollarSign, Bell, CheckCircle, AlertCircle } from "lucide-react"

type NotificationPreference = "1_hour" | "1_day" | "1_week"

type PetSelectionProps = {
  pets: Pet[]
  customerInfo: CustomerInfo
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  professionalName: string
  isDirectBooking: boolean
  onPetSelect: (pet: Pet, notifications: NotificationPreference[]) => void
  onBack: () => void
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
}: PetSelectionProps) {
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [selectedNotifications, setSelectedNotifications] = useState<NotificationPreference[]>([])

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet)
  }

  const handleNotificationChange = (notification: NotificationPreference, checked: boolean) => {
    setSelectedNotifications((prev) => {
      if (checked) {
        return [...prev, notification]
      } else {
        return prev.filter((n) => n !== notification)
      }
    })
  }

  const handleContinue = () => {
    if (selectedPet) {
      // For request bookings, pass empty notifications array
      const notifications = isDirectBooking ? selectedNotifications : []
      onPetSelect(selectedPet, notifications)
    }
  }

  const formatPrice = (price: string | number) => {
    return `$${Number.parseFloat(price.toString()).toFixed(0)}`
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

  // Calculate totals for all selected services
  const totalDuration = selectedServices.reduce((sum, service) => {
    let durationInMinutes = service.duration_number
    if (service.duration_unit === "Hours") {
      durationInMinutes = service.duration_number * 60
    } else if (service.duration_unit === "Days") {
      durationInMinutes = service.duration_number * 24 * 60
    }
    return sum + durationInMinutes
  }, 0)

  const totalCost = selectedServices.reduce((sum, service) => {
    return sum + Number.parseFloat(service.customer_cost.toString())
  }, 0)

  const notificationOptions = [
    {
      id: "1_hour" as NotificationPreference,
      label: "1 hour before",
      description: "Get reminded 1 hour before your appointment",
      icon: "🔔",
    },
    {
      id: "1_day" as NotificationPreference,
      label: "1 day before",
      description: "Get reminded 1 day before your appointment",
      icon: "📅",
    },
    {
      id: "1_week" as NotificationPreference,
      label: "1 week before",
      description: "Get reminded 1 week before your appointment",
      icon: "📆",
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-gray-600 hover:text-gray-900 body-font hover:bg-gray-50 rounded-xl transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Customer Info
      </Button>

      {/* Booking Summary */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E75837] to-[#d14a2a]"></div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E75837] to-[#d14a2a] rounded-2xl flex items-center justify-center shadow-lg">
              {isDirectBooking ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <AlertCircle className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold header-font text-gray-900">
                {isDirectBooking ? "Booking Summary" : "Booking Request Summary"}
              </h2>
              <p className="text-gray-600 body-font">
                {isDirectBooking ? "Review your appointment details" : "Your request will be sent for approval"}
              </p>
            </div>
          </div>

          {!isDirectBooking && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 body-font mb-1">Approval Required</p>
                  <p className="text-sm text-blue-800 body-font">
                    This will be submitted as a booking request that requires approval from {professionalName}.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 body-font">Professional</span>
                <p className="font-semibold body-font text-gray-900">{professionalName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 body-font">Date</span>
                <p className="font-semibold body-font text-gray-900">
                  {selectedTimeSlot.dayOfWeek}, {(() => {
                    const [year, month, day] = selectedTimeSlot.date.split("-").map(Number)
                    const date = new Date(year, month - 1, day)
                    return date.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  })()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 body-font">Time</span>
                <p className="font-semibold body-font text-gray-900">
                  {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 body-font">Total Cost</span>
                <p className="font-semibold body-font text-gray-900">${totalCost.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Services List */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="font-semibold text-gray-900 body-font mb-4">Selected Services</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedServices.map((service, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <p className="font-semibold text-gray-900 body-font">{service.name}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-600 body-font flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(service.duration_number, service.duration_unit)}
                    </span>
                    <span className="text-sm font-semibold text-[#E75837] body-font flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatPrice(service.customer_cost)}
                    </span>
                  </div>
                  {service.description && <p className="text-sm text-gray-600 body-font mt-2">{service.description}</p>}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 body-font">Total Duration:</span>
                <span className="font-semibold text-gray-900 body-font">
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 body-font">Customer</span>
                <p className="font-semibold text-gray-900 body-font">
                  {customerInfo.firstName} {customerInfo.lastName}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 body-font">Email</span>
                <p className="font-semibold text-gray-900 body-font">{customerInfo.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pet Selection */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold header-font text-gray-900">Select Your Pet</h3>
          </div>
          <p className="text-gray-600 body-font">
            We found {pets.length} pet{pets.length !== 1 ? "s" : ""} associated with your account. Please select which
            pet this {isDirectBooking ? "appointment" : "booking request"} is for.
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet) => (
              <div
                key={pet.pet_id}
                className={`group relative rounded-xl p-5 cursor-pointer transition-all duration-200 border-2 ${
                  selectedPet?.pet_id === pet.pet_id
                    ? "border-[#E75837] bg-gradient-to-br from-orange-50 to-red-50 shadow-lg transform scale-105"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md bg-white"
                }`}
                onClick={() => handlePetSelect(pet)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 header-font">{pet.pet_name}</h4>
                    <p className="text-sm text-gray-600 body-font capitalize">{pet.pet_type}</p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      selectedPet?.pet_id === pet.pet_id
                        ? "border-[#E75837] bg-[#E75837] shadow-lg"
                        : "border-gray-300 bg-white group-hover:border-[#E75837]"
                    }`}
                  >
                    {selectedPet?.pet_id === pet.pet_id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>

                <div className="space-y-3">
                  {pet.breed && (
                    <div>
                      <Badge variant="secondary" className="text-xs body-font bg-gray-100 text-gray-700">
                        {pet.breed}
                      </Badge>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs text-gray-600 body-font">
                    {pet.age && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">Age: {pet.age}</span>}
                    {pet.weight && (
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg">Weight: {pet.weight}</span>
                    )}
                  </div>

                  {pet.special_notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 body-font">
                        <span className="font-semibold">Notes:</span> {pet.special_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pets.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PawPrint className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 body-font text-lg">No pets found for this account.</p>
              <p className="text-sm text-gray-500 body-font mt-2">
                You may need to add pet information to your account first.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Preferences - Only show for direct bookings */}
      {isDirectBooking && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold header-font text-gray-900">Notification Preferences</h3>
            </div>
            <p className="text-gray-600 body-font">
              Choose when you'd like to receive reminders about your upcoming appointment. You can select multiple
              options or none at all.
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {notificationOptions.map((option) => (
                <div
                  key={option.id}
                  className={`group relative rounded-xl p-4 border-2 cursor-pointer transition-all duration-200 ${
                    selectedNotifications.includes(option.id)
                      ? "border-blue-300 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"
                  }`}
                  onClick={() => handleNotificationChange(option.id, !selectedNotifications.includes(option.id))}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={option.id}
                      checked={selectedNotifications.includes(option.id)}
                      onCheckedChange={(checked) => handleNotificationChange(option.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{option.icon}</span>
                        <label htmlFor={option.id} className="font-semibold text-gray-900 body-font cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                      <p className="text-sm text-gray-600 body-font">{option.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedNotifications.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 body-font mb-1">Selected notifications:</p>
                    <p className="text-sm text-blue-800 body-font">
                      {selectedNotifications
                        .map((n) => notificationOptions.find((opt) => opt.id === n)?.label)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {selectedPet && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-t-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 body-font">Selected pet</p>
              <p className="text-lg font-bold text-gray-900 body-font">
                {selectedPet.pet_name} ({selectedPet.pet_type})
              </p>
              {isDirectBooking && selectedNotifications.length > 0 && (
                <p className="text-sm text-blue-600 body-font mt-1 flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? "s" : ""} selected
                </p>
              )}
              {!isDirectBooking && (
                <p className="text-sm text-blue-600 body-font mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Booking request - no notifications available
                </p>
              )}
            </div>
            <Button
              onClick={handleContinue}
              className="bg-gradient-to-r from-[#E75837] to-[#d14a2a] hover:from-[#d14a2a] hover:to-[#c13e26] text-white body-font px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              {isDirectBooking ? "Continue to Booking" : "Submit Booking Request"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

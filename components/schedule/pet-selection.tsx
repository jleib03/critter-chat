"use client"

import { useState } from "react"
import type { Pet, Service, SelectedTimeSlot, CustomerInfo } from "@/types/schedule"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, PawPrint, User, Calendar, Clock, DollarSign, Bell } from "lucide-react"

type NotificationPreference = "1_hour" | "1_day" | "1_week"

type PetSelectionProps = {
  pets: Pet[]
  customerInfo: CustomerInfo
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  professionalName: string
  onPetSelect: (pet: Pet, notifications: NotificationPreference[]) => void
  onBack: () => void
}

export function PetSelection({
  pets,
  customerInfo,
  selectedServices,
  selectedTimeSlot,
  professionalName,
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
      onPetSelect(selectedPet, selectedNotifications)
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
    },
    {
      id: "1_day" as NotificationPreference,
      label: "1 day before",
      description: "Get reminded 1 day before your appointment",
    },
    {
      id: "1_week" as NotificationPreference,
      label: "1 week before",
      description: "Get reminded 1 week before your appointment",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="text-gray-600 hover:text-gray-900 body-font">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Customer Info
      </Button>

      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl header-font text-[#E75837]">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <span className="text-gray-500 body-font">Professional:</span>
                <p className="font-medium body-font">{professionalName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <span className="text-gray-500 body-font">Date:</span>
                <p className="font-medium body-font">
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
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <span className="text-gray-500 body-font">Time:</span>
                <p className="font-medium body-font">
                  {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <div>
                <span className="text-gray-500 body-font">Total Cost:</span>
                <p className="font-medium body-font">${totalCost.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Services List */}
          <div className="mt-4 pt-4 border-t">
            <p className="font-medium text-gray-900 body-font mb-2">Selected Services:</p>
            {selectedServices.map((service, index) => (
              <div key={index} className="mb-2">
                <p className="font-medium text-gray-900 body-font">{service.name}</p>
                <p className="text-sm text-gray-600 body-font">
                  {formatDuration(service.duration_number, service.duration_unit)} •{" "}
                  {formatPrice(service.customer_cost)}
                </p>
                {service.description && <p className="text-sm text-gray-600 body-font mt-1">{service.description}</p>}
              </div>
            ))}
            <div className="mt-2 pt-2 border-t text-sm">
              <p className="font-medium text-gray-900 body-font">
                Total Duration: {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 body-font">
              <span className="font-medium">Customer:</span> {customerInfo.firstName} {customerInfo.lastName}
            </p>
            <p className="text-sm text-gray-600 body-font">
              <span className="font-medium">Email:</span> {customerInfo.email}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pet Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl header-font text-[#E75837] flex items-center gap-2">
            <PawPrint className="w-5 h-5" />
            Select Your Pet
          </CardTitle>
          <p className="text-gray-600 body-font">
            We found {pets.length} pet{pets.length !== 1 ? "s" : ""} associated with your account. Please select which
            pet this appointment is for.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet) => (
              <div
                key={pet.pet_id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedPet?.pet_id === pet.pet_id
                    ? "border-[#E75837] bg-orange-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handlePetSelect(pet)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 header-font">{pet.pet_name}</h3>
                    <p className="text-sm text-gray-600 body-font capitalize">{pet.pet_type}</p>
                  </div>
                  {selectedPet?.pet_id === pet.pet_id && (
                    <div className="w-5 h-5 bg-[#E75837] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {pet.breed && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs body-font">
                        {pet.breed}
                      </Badge>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 body-font">
                    {pet.age && <span>Age: {pet.age}</span>}
                    {pet.weight && <span>Weight: {pet.weight}</span>}
                  </div>

                  {pet.special_notes && (
                    <p className="text-xs text-gray-600 body-font mt-2 p-2 bg-gray-50 rounded">
                      <span className="font-medium">Notes:</span> {pet.special_notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pets.length === 0 && (
            <div className="text-center py-8">
              <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 body-font">No pets found for this account.</p>
              <p className="text-sm text-gray-500 body-font mt-2">
                You may need to add pet information to your account first.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl header-font text-[#E75837] flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <p className="text-gray-600 body-font">
            Choose when you'd like to receive reminders about your upcoming appointment. You can select multiple options
            or none at all.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationOptions.map((option) => (
              <div key={option.id} className="flex items-start space-x-3">
                <Checkbox
                  id={option.id}
                  checked={selectedNotifications.includes(option.id)}
                  onCheckedChange={(checked) => handleNotificationChange(option.id, checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor={option.id} className="text-sm font-medium text-gray-900 body-font cursor-pointer">
                    {option.label}
                  </label>
                  <p className="text-sm text-gray-600 body-font">{option.description}</p>
                </div>
              </div>
            ))}
          </div>

          {selectedNotifications.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 body-font">
                <span className="font-medium">Selected notifications:</span>{" "}
                {selectedNotifications.map((n) => notificationOptions.find((opt) => opt.id === n)?.label).join(", ")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      {selectedPet && (
        <div className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 body-font">Selected pet:</p>
            <p className="font-medium text-gray-900 body-font">
              {selectedPet.pet_name} ({selectedPet.pet_type})
            </p>
            {selectedNotifications.length > 0 && (
              <p className="text-sm text-gray-600 body-font mt-1">
                Notifications: {selectedNotifications.length} selected
              </p>
            )}
          </div>
          <Button onClick={handleContinue} className="bg-[#E75837] hover:bg-[#d14a2a] text-white body-font">
            Continue to Booking
          </Button>
        </div>
      )}
    </div>
  )
}

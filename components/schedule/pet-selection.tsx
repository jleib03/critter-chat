"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, PawPrint, Bell } from "lucide-react"
import type { Service, SelectedTimeSlot, CustomerInfo, Pet } from "@/types/schedule"
import type { RecurringConfig } from "./booking-type-selection"

type NotificationPreference = "1_hour" | "1_day" | "1_week"

type PetSelectionProps = {
  pets: Pet[]
  customerInfo: CustomerInfo
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  professionalName: string
  isDirectBooking: boolean
  onPetSelect: (pets: Pet[], notifications: NotificationPreference[]) => void
  onBack: () => void
  bookingType?: "one-time" | "recurring"
  recurringConfig?: RecurringConfig | null
  showPrices: boolean
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
  showPrices,
}: PetSelectionProps) {
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([])
  const [selectedNotifications, setSelectedNotifications] = useState<NotificationPreference[]>([])

  const handleNotificationChange = (notification: NotificationPreference) => {
    setSelectedNotifications((prev) =>
      prev.includes(notification) ? prev.filter((n) => n !== notification) : [...prev, notification],
    )
  }

  const handlePetToggle = (petId: string) => {
    setSelectedPetIds((prev) => (prev.includes(petId) ? prev.filter((id) => id !== petId) : [...prev, petId]))
  }

  const handleSubmit = () => {
    if (selectedPetIds.length === 0) {
      alert("Please select at least one pet.")
      return
    }
    const selectedPets = pets.filter((p) => selectedPetIds.includes(p.pet_id))
    if (selectedPets.length > 0) {
      onPetSelect(selectedPets, selectedNotifications)
    }
  }

  const totalCost = selectedServices.reduce((sum, service) => sum + Number(service.customer_cost), 0)
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="text-gray-600 hover:text-gray-900 body-font">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Contact Info
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pet Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl header-font text-[#E75837] flex items-center gap-2">
              <PawPrint className="w-5 h-5" />
              Select Your Pets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pets.length > 0 ? (
              <div className="space-y-4">
                {pets.map((pet) => (
                  <Label
                    key={pet.pet_id}
                    htmlFor={pet.pet_id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPetIds.includes(pet.pet_id) ? "border-[#E75837] bg-orange-50" : "border-gray-200"
                    }`}
                  >
                    <Checkbox
                      id={pet.pet_id}
                      checked={selectedPetIds.includes(pet.pet_id)}
                      onCheckedChange={() => handlePetToggle(pet.pet_id)}
                      className="mr-4"
                    />
                    <div>
                      <p className="font-semibold body-font">{pet.pet_name}</p>
                      <p className="text-sm text-gray-600 body-font">
                        {pet.breed} ({pet.pet_type})
                      </p>
                    </div>
                  </Label>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 body-font">No pets found for this account.</p>
            )}

            {isDirectBooking && (
              <div className="mt-8">
                <h3 className="text-lg font-medium header-font text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gray-500" />
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  {(["1_hour", "1_day", "1_week"] as NotificationPreference[]).map((pref) => (
                    <div key={pref} className="flex items-center space-x-2">
                      <Checkbox
                        id={pref}
                        checked={selectedNotifications.includes(pref)}
                        onCheckedChange={() => handleNotificationChange(pref)}
                      />
                      <Label htmlFor={pref} className="body-font">
                        Remind me {pref.replace("_", " ")} before
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleSubmit} className="w-full mt-8 bg-[#E75837] hover:bg-[#d14a2a] text-white body-font">
              {isDirectBooking ? "Confirm Booking" : "Submit Request"}
            </Button>
          </CardContent>
        </Card>

        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl header-font text-[#E75837]">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 body-font">Customer</span>
                <span className="font-medium body-font">
                  {customerInfo.firstName} {customerInfo.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 body-font">Date</span>
                <span className="font-medium body-font">{selectedTimeSlot.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 body-font">Time</span>
                <span className="font-medium body-font">{selectedTimeSlot.startTime}</span>
              </div>
            </div>
            <div className="border-t pt-4 space-y-2">
              <h4 className="font-semibold header-font">Selected Services</h4>
              {selectedServices.map((service) => (
                <div key={service.name} className="flex justify-between">
                  <span className="text-gray-600 body-font">{service.name}</span>
                  {showPrices && (
                    <span className="font-medium body-font">{formatCurrency(Number(service.customer_cost))}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              {showPrices && (
                <div className="flex justify-between items-center font-semibold mb-2">
                  <span className="header-font">Total</span>
                  <span className="header-font">{formatCurrency(totalCost)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 body-font">Total Duration</span>
                <span className="text-gray-600 body-font">{formatDuration(totalDuration)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

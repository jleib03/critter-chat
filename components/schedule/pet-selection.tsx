"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Bell, Dog, Cat, Bird } from "lucide-react"
import type { Service, SelectedTimeSlot, CustomerInfo, Pet } from "@/types/schedule"
import type { BookingType, RecurringConfig } from "./booking-type-selection"
import { Checkbox } from "@/components/ui/checkbox"

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
  bookingType: BookingType | null
  recurringConfig: RecurringConfig | null
  showPrices: boolean
  multiDayTimeSlot: { start: Date; end: Date } | null
}

const formatMultiDayRange = (start: Date, end: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }
  return `${start.toLocaleString("en-US", options)} - ${end.toLocaleString("en-US", options)}`
}

const calculateMultiDayCost = (start: Date, end: Date, service: Service): number => {
  if (!service) return 0
  const durationMs = end.getTime() - start.getTime()
  const rate = Number(service.customer_cost)

  const unit = service.duration_unit.toLowerCase()
  if (unit.startsWith("day")) {
    const durationInDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24))
    return durationInDays * rate
  } else if (unit.startsWith("hour")) {
    const durationInHours = Math.ceil(durationMs / (1000 * 60 * 60))
    return durationInHours * rate
  }

  return rate
}

const PetIcon = ({ type }: { type: string }) => {
  const petType = type.toLowerCase()
  if (petType.includes("dog")) return <Dog className="w-8 h-8 text-gray-500" />
  if (petType.includes("cat")) return <Cat className="w-8 h-8 text-gray-500" />
  if (petType.includes("bird")) return <Bird className="w-8 h-8 text-gray-500" />
  return <Dog className="w-8 h-8 text-gray-500" /> // Default icon
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
  multiDayTimeSlot,
}: PetSelectionProps) {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(pets.length > 0 ? pets[0].pet_id : null)
  const [selectedNotifications, setSelectedNotifications] = useState<NotificationPreference[]>([])

  const handleNotificationChange = (notification: NotificationPreference) => {
    setSelectedNotifications((prev) =>
      prev.includes(notification) ? prev.filter((n) => n !== notification) : [...prev, notification],
    )
  }

  const handleSubmit = () => {
    if (!selectedPetId) {
      alert("Please select a pet.")
      return
    }
    const selectedPet = pets.find((p) => p.pet_id === selectedPetId)
    if (selectedPet) {
      onPetSelect(selectedPet, selectedNotifications)
    }
  }

  const formatDateTime = () => {
    if (!selectedTimeSlot?.date) return ""
    const [year, month, day] = selectedTimeSlot.date.split("-").map(Number)
    const localDate = new Date(year, month - 1, day)
    return localDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const calculateTotalCost = () => {
    return selectedServices.reduce((total, service) => total + Number(service.customer_cost), 0)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Booking Summary */}
      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl header-font">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 body-font">Professional:</span>
              <p className="font-medium header-font">{professionalName}</p>
            </div>
            <div>
              <span className="text-gray-500 body-font">Customer:</span>
              <p className="font-medium header-font">
                {customerInfo.firstName} {customerInfo.lastName}
              </p>
            </div>
            <div>
              <span className="text-gray-500 body-font">Services:</span>
              <p className="font-medium header-font">{selectedServices.map((s) => s.name).join(", ")}</p>
            </div>
            {bookingType === "multi-day" && multiDayTimeSlot ? (
              <>
                <div className="md:col-span-2">
                  <span className="text-gray-500 body-font">Stay Duration:</span>
                  <p className="font-medium header-font">
                    {formatMultiDayRange(multiDayTimeSlot.start, multiDayTimeSlot.end)}
                  </p>
                </div>
                {showPrices && selectedServices.length > 0 && (
                  <div>
                    <span className="text-gray-500 body-font">Estimated Cost:</span>
                    <p className="font-medium header-font">
                      $
                      {calculateMultiDayCost(multiDayTimeSlot.start, multiDayTimeSlot.end, selectedServices[0]).toFixed(
                        2,
                      )}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <span className="text-gray-500 body-font">Date & Time:</span>
                  <p className="font-medium header-font">
                    {formatDateTime()} at {selectedTimeSlot.startTime}
                  </p>
                </div>
                {showPrices && (
                  <div>
                    <span className="text-gray-500 body-font">Total Cost:</span>
                    <p className="font-medium header-font">${calculateTotalCost()}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pet Selection */}
      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl header-font">Select Your Pet</CardTitle>
          {pets.length === 0 && (
            <p className="text-gray-600 body-font">No pets found for this customer. Please add a pet first.</p>
          )}
        </CardHeader>
        <CardContent>
          {pets.length > 0 && (
            <RadioGroup value={selectedPetId ?? ""} onValueChange={setSelectedPetId} className="space-y-4">
              {pets.map((pet) => (
                <Label
                  key={pet.pet_id}
                  htmlFor={pet.pet_id}
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPetId === pet.pet_id ? "border-[#E75837] bg-orange-50" : "border-gray-200"
                  }`}
                >
                  <RadioGroupItem value={pet.pet_id} id={pet.pet_id} />
                  <PetIcon type={pet.pet_type} />
                  <div className="flex-grow">
                    <p className="font-semibold header-font">{pet.pet_name}</p>
                    <p className="text-sm text-gray-600 body-font">
                      {pet.breed} ({pet.pet_type})
                    </p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      {isDirectBooking && (
        <Card className="shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl header-font flex items-center gap-2">
              <Bell className="w-5 h-5" /> Notification Preferences
            </CardTitle>
            <p className="text-gray-600 body-font">Get reminders for your upcoming appointment.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "1_hour", label: "1 hour before" },
              { id: "1_day", label: "1 day before" },
              { id: "1_week", label: "1 week before" },
            ].map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={item.id}
                  checked={selectedNotifications.includes(item.id as NotificationPreference)}
                  onCheckedChange={() => handleNotificationChange(item.id as NotificationPreference)}
                />
                <label
                  htmlFor={item.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 body-font"
                >
                  {item.label}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2 px-6 py-2 rounded-lg border-gray-300 hover:bg-gray-50 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Your Info
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={!selectedPetId}
          className="px-6 py-2 bg-[#E75837] hover:bg-[#d14a2a] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {isDirectBooking ? "Confirm Booking" : "Submit Request"}
        </Button>
      </div>
    </div>
  )
}

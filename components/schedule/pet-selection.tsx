"use client"

import { useState } from "react"
import { ArrowLeft, PawPrint, Bell, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
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
  onPetSelect: (pets: Pet[], notifications: NotificationPreference[]) => void
  onBack: () => void
  bookingType: BookingType | null
  recurringConfig: RecurringConfig | null
  multiDayTimeSlot?: { start: Date; end: Date } | null
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
  multiDayTimeSlot,
  showPrices,
}: PetSelectionProps) {
  const [selectedPets, setSelectedPets] = useState<Pet[]>(pets.length === 1 ? [pets[0]] : [])
  const [selectedNotifications, setSelectedNotifications] = useState<NotificationPreference[]>(["1_day"])

  const handlePetToggle = (pet: Pet) => {
    setSelectedPets((prev) => {
      const isSelected = prev.some((p) => p.pet_id === pet.pet_id)
      if (isSelected) {
        return prev.filter((p) => p.pet_id !== pet.pet_id)
      } else {
        return [...prev, pet]
      }
    })
  }

  const handleNotificationChange = (preference: NotificationPreference) => {
    setSelectedNotifications((prev) =>
      prev.includes(preference) ? prev.filter((p) => p !== preference) : [...prev, preference],
    )
  }

  const handleSubmit = () => {
    if (selectedPets.length > 0) {
      onPetSelect(selectedPets, selectedNotifications)
    } else if (pets.length === 0) {
      // Allow submission if there are no existing pets (new customer)
      const newPetPlaceholder: Pet = {
        pet_id: "new_pet",
        pet_name: "New Pet",
        pet_type: "Unknown",
        breed: "Unknown",
        age: "Unknown",
        weight: "Unknown",
        special_notes: "",
      }
      onPetSelect([newPetPlaceholder], selectedNotifications)
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

  const calculateTotalDuration = () => {
    let totalMinutes = 0
    selectedServices.forEach((service) => {
      let minutes = service.duration_number
      if (service.duration_unit === "Hours") {
        minutes = service.duration_number * 60
      } else if (service.duration_unit === "Days") {
        minutes = service.duration_number * 24 * 60
      }
      totalMinutes += minutes
    })

    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${totalMinutes}m`
  }

  const formatMultiDayDateTime = (date: Date) => {
    if (!date) return ""
    return new Date(date).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const calculateMultiDayInfo = () => {
    if (!multiDayTimeSlot || !selectedServices.length) {
      return { durationLabel: "", totalCost: 0 }
    }
    const service = selectedServices[0]
    const rate = Number(service.customer_cost)
    const diffMs = new Date(multiDayTimeSlot.end).getTime() - new Date(multiDayTimeSlot.start).getTime()

    let billableUnits = 0
    let durationLabel = ""
    const nights = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
    const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

    const serviceUnit = service.duration_unit.toLowerCase()
    const serviceDuration = service.duration_number

    if (serviceUnit.includes("day")) {
      // Priced per day or block of days
      const serviceDurationMs = serviceDuration * 24 * 60 * 60 * 1000
      billableUnits = Math.ceil(diffMs / serviceDurationMs)
      durationLabel = `${nights} Night${nights !== 1 ? "s" : ""} / ${totalDays} Day${totalDays !== 1 ? "s" : ""}`
    } else if (serviceUnit.includes("hour")) {
      // Priced per hour or block of hours (e.g., a 24-hour block)
      const serviceDurationMs = serviceDuration * 60 * 60 * 1000
      billableUnits = Math.ceil(diffMs / serviceDurationMs)
      if (serviceDuration >= 24) {
        durationLabel = `${nights} Night${nights !== 1 ? "s" : ""} / ${totalDays} Day${totalDays !== 1 ? "s" : ""}`
      } else {
        const totalHours = Math.ceil(diffMs / (1000 * 60 * 60))
        durationLabel = `${totalHours} Hour${totalHours !== 1 ? "s" : ""}`
      }
    } else if (serviceUnit.includes("minute")) {
      const serviceDurationMs = serviceDuration * 60 * 1000
      billableUnits = Math.ceil(diffMs / serviceDurationMs)
      const totalMinutes = Math.ceil(diffMs / (1000 * 60))
      durationLabel = `${totalMinutes} minutes`
    } else {
      // Fallback for unknown units, charge as a single stay
      billableUnits = 1
      durationLabel = "1 Stay"
    }

    return {
      durationLabel,
      totalCost: billableUnits * rate,
    }
  }

  const multiDayInfo = calculateMultiDayInfo()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Booking Summary */}
      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl header-font">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookingType === "multi-day" && multiDayTimeSlot ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 body-font">Professional:</span>
                <p className="font-medium header-font">{professionalName}</p>
              </div>
              <div>
                <span className="text-gray-500 body-font">Service:</span>
                <p className="font-medium header-font">{selectedServices.map((s) => s.name).join(", ")}</p>
              </div>
              <div>
                <span className="text-gray-500 body-font">Drop-off:</span>
                <p className="font-medium header-font">{formatMultiDayDateTime(multiDayTimeSlot.start)}</p>
              </div>
              <div>
                <span className="text-gray-500 body-font">Pick-up:</span>
                <p className="font-medium header-font">{formatMultiDayDateTime(multiDayTimeSlot.end)}</p>
              </div>
              <div>
                <span className="text-gray-500 body-font">Duration:</span>
                <p className="font-medium header-font">{multiDayInfo.durationLabel}</p>
              </div>
              {showPrices && (
                <div>
                  <span className="text-gray-500 body-font">Estimated Cost:</span>
                  <p className="font-medium header-font">${multiDayInfo.totalCost.toFixed(2)}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 body-font">Professional:</span>
                <p className="font-medium header-font">{professionalName}</p>
              </div>
              <div>
                <span className="text-gray-500 body-font">Date & Time:</span>
                <p className="font-medium header-font">
                  {formatDateTime()} at {selectedTimeSlot.startTime}
                </p>
              </div>
              <div>
                <span className="text-gray-500 body-font">Services:</span>
                <p className="font-medium header-font">{selectedServices.map((s) => s.name).join(", ")}</p>
              </div>
              <div>
                <span className="text-gray-500 body-font">Duration:</span>
                <p className="font-medium header-font">{calculateTotalDuration()}</p>
              </div>
              {showPrices && (
                <div>
                  <span className="text-gray-500 body-font">Total Cost:</span>
                  <p className="font-medium header-font">${calculateTotalCost()}</p>
                </div>
              )}
              {bookingType === "recurring" && recurringConfig && (
                <div>
                  <span className="text-gray-500 body-font">Recurring:</span>
                  <p className="font-medium header-font text-blue-600">
                    Every {recurringConfig.frequency} {recurringConfig.unit}
                    {recurringConfig.frequency > 1 ? "s" : ""} until{" "}
                    {new Date(recurringConfig.endDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pet Selection */}
      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl header-font">Select Your Pet</CardTitle>
          <p className="text-gray-600 body-font">
            Choose which of your pets this appointment is for, {customerInfo.firstName}.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {pets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <div
                  key={pet.pet_id}
                  onClick={() => handlePetToggle(pet)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPets.some((p) => p.pet_id === pet.pet_id)
                      ? "border-[#E75837] bg-orange-50 ring-2 ring-[#E75837]"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <PawPrint className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 header-font">{pet.pet_name}</p>
                        <p className="text-sm text-gray-500 body-font">
                          {pet.breed} ({pet.pet_type})
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={selectedPets.some((p) => p.pet_id === pet.pet_id)}
                      className="data-[state=checked]:bg-[#E75837] data-[state=checked]:border-[#E75837]"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4 bg-gray-50 rounded-xl">
              <Sparkles className="w-10 h-10 text-[#E75837] mx-auto mb-3" />
              <p className="font-semibold text-gray-800 header-font">You're a new customer!</p>
              <p className="text-gray-600 body-font mt-1">
                Your pet's information will be added to your profile automatically.
              </p>
            </div>
          )}

          {isDirectBooking && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium text-gray-800 header-font flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#E75837]" />
                Notification Preferences
              </h3>
              <div className="flex flex-wrap gap-4">
                {(["1_hour", "1_day", "1_week"] as NotificationPreference[]).map((pref) => (
                  <div key={pref} className="flex items-center space-x-2">
                    <Checkbox
                      id={pref}
                      checked={selectedNotifications.includes(pref)}
                      onCheckedChange={() => handleNotificationChange(pref)}
                      className="data-[state=checked]:bg-[#E75837] data-[state=checked]:border-[#E75837]"
                    />
                    <Label htmlFor={pref} className="text-sm font-medium text-gray-700 body-font cursor-pointer">
                      {pref.replace("_", " ")} before
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="flex items-center gap-2 px-6 py-2 rounded-lg border-gray-300 hover:bg-gray-50 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedPets.length === 0 && pets.length > 0}
              className="px-6 py-2 bg-[#E75837] hover:bg-[#d14a2a] text-white rounded-lg font-medium transition-colors"
            >
              {isDirectBooking ? "Confirm Booking" : "Submit Request"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

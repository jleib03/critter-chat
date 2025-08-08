"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Bell } from 'lucide-react'
import type { Service, SelectedTimeSlot, CustomerInfo, Pet } from "@/types/schedule"
import type { BookingType, RecurringConfig } from "./booking-type-selection"

type NotificationPreference = "1_hour" | "1_day" | "1_week"

interface PetSelectionProps {
  pets: Pet[]
  customerInfo: CustomerInfo
  selectedServices: Service[]
  selectedTimeSlots: SelectedTimeSlot[]
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
  selectedTimeSlots,
  professionalName,
  isDirectBooking,
  onPetSelect,
  onBack,
  bookingType,
  recurringConfig,
  multiDayTimeSlot,
  showPrices,
}: PetSelectionProps) {
  const [selectedPets, setSelectedPets] = useState<Pet[]>([])
  const [selectedNotifications, setSelectedNotifications] = useState<NotificationPreference[]>([])

  const firstSlot = selectedTimeSlots[0]

  const handlePetToggle = (pet: Pet) => {
    setSelectedPets((prev) =>
      prev.some((p) => p.pet_id === pet.pet_id)
        ? prev.filter((p) => p.pet_id !== pet.pet_id)
        : [...prev, pet],
    )
  }

  const handleNotificationToggle = (notification: NotificationPreference) => {
    setSelectedNotifications((prev) =>
      prev.includes(notification) ? prev.filter((n) => n !== notification) : [...prev, notification],
    )
  }

  const handleSubmit = () => {
    if (selectedPets.length === 0) {
      alert("Please select at least one pet.")
      return
    }
    onPetSelect(selectedPets, selectedNotifications)
  }

  const formatDateTime = () => {
    if (!firstSlot?.date) return ""
    const [year, month, day] = firstSlot.date.split("-").map(Number)
    const localDate = new Date(year, month - 1, day)
    return localDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const calculateTotalCost = () => {
    const costPerSlot = selectedServices.reduce((total, service) => total + Number(service.customer_cost), 0)
    const totalCost = costPerSlot * selectedTimeSlots.length
    return isNaN(totalCost) ? 0 : totalCost
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
      const serviceDurationMs = serviceDuration * 24 * 60 * 60 * 1000
      billableUnits = Math.ceil(diffMs / serviceDurationMs)
      durationLabel = `${nights} Night${nights !== 1 ? "s" : ""} / ${totalDays} Day${totalDays !== 1 ? "s" : ""}`
    } else if (serviceUnit.includes("hour")) {
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
      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl header-font">Confirm Your Booking</CardTitle>
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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 body-font">Professional:</span>
                <p className="font-medium header-font">{professionalName}</p>
              </div>
              <div>
                <span className="text-gray-500 body-font">Date & Time:</span>
                {selectedTimeSlots.length > 1 ? (
                  <div>
                    <p className="font-medium header-font">{selectedTimeSlots.length} appointments selected</p>
                    <ul className="text-xs list-disc list-inside text-gray-600">
                      {selectedTimeSlots.map((slot, i) => (
                        <li key={i}>{new Date(slot.date).toLocaleDateString("en-US", { month: "short", day: "numeric"})} at {slot.startTime}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="font-medium header-font">
                    {formatDateTime()} at {firstSlot.startTime}
                  </p>
                )}
              </div>
              <div>
                <span className="text-gray-500 body-font">Services:</span>
                <p className="font-medium header-font">{selectedServices.map((s) => s.name).join(", ")}</p>
              </div>
              <div>
                <span className="text-gray-500 body-font">Duration (per appt):</span>
                <p className="font-medium header-font">{calculateTotalDuration()}</p>
              </div>
              {showPrices && (
                <div>
                  <span className="text-gray-500 body-font">Total Cost:</span>
                  <p className="font-medium header-font">${calculateTotalCost().toFixed(2)}</p>
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

      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl header-font">Select Your Pet(s)</CardTitle>
          <p className="text-gray-600 body-font">
            {pets.length > 0
              ? "Choose which pets will be attending."
              : "No pets found for this customer. You can add them in the Critter app."}
          </p>
        </CardHeader>
        <CardContent>
          {pets.length > 0 ? (
            <div className="space-y-4">
              {pets.map((pet) => (
                <div
                  key={pet.pet_id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                    selectedPets.some((p) => p.pet_id === pet.pet_id)
                      ? "bg-[#E75837]/10 border-[#E75837]"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                  onClick={() => handlePetToggle(pet)}
                >
                  <div>
                    <h3 className="font-semibold text-gray-800 header-font">{pet.pet_name}</h3>
                    <p className="text-sm text-gray-600 body-font">
                      {pet.pet_type} - {pet.breed}
                    </p>
                  </div>
                  <Checkbox
                    checked={selectedPets.some((p) => p.pet_id === pet.pet_id)}
                    onCheckedChange={() => handlePetToggle(pet)}
                    className="h-5 w-5"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 body-font">No pets to display.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {isDirectBooking && (
        <Card className="shadow-lg border-0 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl header-font">Notification Preferences</CardTitle>
            <p className="text-gray-600 body-font">Choose how you'd like to be reminded.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["1_hour", "1_day", "1_week"] as NotificationPreference[]).map((pref) => (
              <div
                key={pref}
                className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700 body-font">
                    {pref.replace("_", " ")} before
                  </span>
                </div>
                <Checkbox
                  checked={selectedNotifications.includes(pref)}
                  onCheckedChange={() => handleNotificationToggle(pref)}
                  className="h-5 w-5"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-4">
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
          disabled={selectedPets.length === 0}
          className="px-6 py-2 bg-[#E75837] hover:bg-[#d14a2a] text-white rounded-lg font-medium transition-colors"
        >
          {isDirectBooking ? "Confirm Booking" : "Submit Request"}
        </Button>
      </div>
    </div>
  )
}

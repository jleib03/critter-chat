"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { CustomerInfo, Pet, Service, SelectedTimeSlot } from "@/types/schedule"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import { Label } from "@/components/ui/label"
import type { BookingType, RecurringConfig } from "./booking-type-selection"

interface PetSelectionProps {
  pets: Pet[]
  customerInfo: CustomerInfo
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  professionalName: string
  isDirectBooking: boolean
  onPetSelect: (pet: Pet, notifications: string[]) => void
  onBack: () => void
  bookingType: BookingType | null
  recurringConfig: RecurringConfig | null
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
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const [notificationPreferences, setNotificationPreferences] = useState<string[]>([])

  const handlePetSelection = (petId: string) => {
    setSelectedPetId(petId)
  }

  const handleNotificationPreference = (preference: string) => {
    setNotificationPreferences((prevPreferences) => {
      if (prevPreferences.includes(preference)) {
        return prevPreferences.filter((p) => p !== preference)
      } else {
        return [...prevPreferences, preference]
      }
    })
  }

  const selectedPet = pets.find((pet) => pet.pet_id === selectedPetId)

  const handleSubmit = () => {
    if (!selectedPet) {
      toast({
        title: "Please select a pet",
        description: "You must select a pet to continue with the booking.",
      })
      return
    }

    onPetSelect(selectedPet, notificationPreferences)
  }

  const formatRecurringInfo = () => {
    if (bookingType === "recurring" && recurringConfig) {
      const days = recurringConfig.daysOfWeek?.join(", ")
      const endDate = new Date(recurringConfig.endDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      return `Every ${days} until ${endDate}`
    }
    return null
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Pet Selection */}
      <div className="md:w-1/2">
        <Card className="shadow-lg border-0 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl header-font">Select Your Pet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pets.length === 0 ? (
              <p className="text-gray-500 body-font">No pets found for this customer.</p>
            ) : (
              <div className="space-y-3">
                {pets.map((pet) => (
                  <Button
                    key={pet.pet_id}
                    variant={selectedPetId === pet.pet_id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handlePetSelection(pet.pet_id)}
                  >
                    {pet.pet_name} ({pet.pet_type})
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {isDirectBooking && pets.length > 0 && (
          <Card className="shadow-lg border-0 rounded-2xl mt-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl header-font">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="1_hour"
                  checked={notificationPreferences.includes("1_hour")}
                  onCheckedChange={(checked) => {
                    handleNotificationPreference("1_hour")
                  }}
                />
                <Label htmlFor="1_hour">1 hour before</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="1_day"
                  checked={notificationPreferences.includes("1_day")}
                  onCheckedChange={(checked) => {
                    handleNotificationPreference("1_day")
                  }}
                />
                <Label htmlFor="1_day">1 day before</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="1_week"
                  checked={notificationPreferences.includes("1_week")}
                  onCheckedChange={(checked) => {
                    handleNotificationPreference("1_week")
                  }}
                />
                <Label htmlFor="1_week">1 week before</Label>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking Summary */}
      <div className="md:w-1/2">
        <Card className="shadow-lg border-0 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl header-font">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time:</span>
              <span className="font-medium">
                {selectedTimeSlot.dayOfWeek}, {selectedTimeSlot.date} at {selectedTimeSlot.startTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Services:</span>
              <span className="font-medium">{selectedServices.map((s) => s.name).join(", ")}</span>
            </div>
            {bookingType === "recurring" && recurringConfig && (
              <div className="flex justify-between">
                <span className="text-gray-600">Recurring Booking:</span>
                <span className="font-medium">{formatRecurringInfo()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Pet:</span>
              <span className="font-medium">{selectedPet?.pet_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">
                {customerInfo.firstName} {customerInfo.lastName}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customer Info
          </Button>
          <Button className="bg-[#E75837] hover:bg-[#d14a2a] text-white" onClick={handleSubmit}>
            {isDirectBooking ? "Confirm Booking" : "Submit Request"}
          </Button>
        </div>
      </div>
    </div>
  )
}

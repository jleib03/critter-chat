"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, User, Mail, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Service, SelectedTimeSlot, CustomerInfo, PetResponse } from "@/types/schedule"
import type { BookingType, RecurringConfig } from "./booking-type-selection"

interface CustomerFormProps {
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  professionalId: string
  professionalName: string
  sessionId: string
  onPetsReceived: (customerInfo: CustomerInfo, petResponse: PetResponse) => void
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

export function CustomerForm({
  selectedServices,
  selectedTimeSlot,
  professionalId,
  professionalName,
  sessionId,
  onPetsReceived,
  onBack,
  bookingType,
  recurringConfig,
  showPrices,
  multiDayTimeSlot,
}: CustomerFormProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!customerInfo.firstName.trim() || !customerInfo.lastName.trim() || !customerInfo.email.trim()) {
        throw new Error("Please fill in all required fields")
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerInfo.email.trim())) {
        throw new Error("Please enter a valid email address")
      }

      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook-test/4ae0fb3d-17dc-482f-be27-1c7ab5c31b16"

      console.log("Sending webhook to:", webhookUrl)

      const payload = {
        professional_id: professionalId,
        action: "get_customer_pets",
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        customer_info: {
          first_name: customerInfo.firstName.trim(),
          last_name: customerInfo.lastName.trim(),
          email: customerInfo.email.trim().toLowerCase(),
          phone: customerInfo.phone.trim(),
          notes: customerInfo.notes.trim(),
        },
        booking_context: {
          selected_services: selectedServices.map((service) => service.name),
          selected_date: selectedTimeSlot.date,
          selected_time: selectedTimeSlot.startTime,
          booking_type: bookingType,
          recurring_config: recurringConfig,
          multi_day_slot: multiDayTimeSlot,
        },
      }

      console.log("Sending customer pets webhook with payload:", payload)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Customer pets response:", result)

      // Parse the response to extract pets
      let pets: any[] = []
      if (Array.isArray(result)) {
        // Look for pets in the response array
        const petsData = result.find((item) => item.pets || (Array.isArray(item) && item.length > 0))
        if (petsData?.pets) {
          pets = petsData.pets
        } else if (Array.isArray(petsData)) {
          pets = petsData
        }
      }

      const petResponse: PetResponse = {
        pets: pets,
        success: true,
      }

      onPetsReceived(customerInfo, petResponse)
    } catch (err) {
      console.error("Error fetching customer pets:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch customer information")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateTime = () => {
    if (!selectedTimeSlot?.date) return ""
    // Fix: Create date in local timezone to prevent day-off errors
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Booking Summary */}
      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl header-font">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 body-font">Professional:</span>
              <p className="font-medium header-font">{professionalName}</p>
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
              </>
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
        </CardContent>
      </Card>

      {/* Customer Information Form */}
      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl header-font">Your Information</CardTitle>
          <p className="text-gray-600 body-font">Please provide your contact details to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm body-font">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 body-font">
                  First Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="firstName"
                    type="text"
                    value={customerInfo.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="pl-10 rounded-lg border-gray-300 focus:border-[#E75837] focus:ring-[#E75837]"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 body-font">
                  Last Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="lastName"
                    type="text"
                    value={customerInfo.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="pl-10 rounded-lg border-gray-300 focus:border-[#E75837] focus:ring-[#E75837]"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 body-font">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10 rounded-lg border-gray-300 focus:border-[#E75837] focus:ring-[#E75837]"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 body-font">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="pl-10 rounded-lg border-gray-300 focus:border-[#E75837] focus:ring-[#E75837]"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700 body-font">
                Additional Notes
              </Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <Textarea
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="pl-10 pt-3 rounded-lg border-gray-300 focus:border-[#E75837] focus:ring-[#E75837] min-h-[100px]"
                  placeholder="Any special requests or information for the professional..."
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="flex items-center gap-2 px-6 py-2 rounded-lg border-gray-300 hover:bg-gray-50 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Schedule
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-[#E75837] hover:bg-[#d14a2a] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  "Continue to Pet Selection"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

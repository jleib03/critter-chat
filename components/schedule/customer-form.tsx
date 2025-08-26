"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, User, Mail, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Service, SelectedTimeSlot, CustomerInfo, PetResponse } from "@/types/schedule"
import type { BookingType, RecurringConfig } from "./booking-type-selection"
import { getWebhookEndpoint, logWebhookUsage } from "@/types/webhook-endpoints"

interface CustomerFormProps {
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  selectedTimeSlots?: SelectedTimeSlot[] // New for Drop-In
  professionalId: string
  professionalName: string
  sessionId: string
  onPetsReceived: (customerInfo: CustomerInfo, petResponse: PetResponse) => void
  onBack: () => void
  bookingType: BookingType | null
  recurringConfig: RecurringConfig | null
  multiDayTimeSlot?: { start: Date; end: Date } | null
  showPrices: boolean
  verifiedCustomerInfo?: {
    first_name: string
    last_name: string
    email: string
    user_id?: string
    customer_id?: string | null
  }
}

export function CustomerForm({
  selectedServices,
  selectedTimeSlot,
  selectedTimeSlots = [],
  professionalId,
  professionalName,
  sessionId,
  onPetsReceived,
  onBack,
  bookingType,
  recurringConfig,
  multiDayTimeSlot,
  showPrices,
  verifiedCustomerInfo,
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

  useEffect(() => {
    if (verifiedCustomerInfo) {
      setCustomerInfo((prev) => ({
        ...prev,
        firstName: verifiedCustomerInfo.first_name || "",
        lastName: verifiedCustomerInfo.last_name || "",
        email: verifiedCustomerInfo.email || "",
      }))
    }
  }, [verifiedCustomerInfo])

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
      if (!customerInfo.firstName?.trim() || !customerInfo.lastName?.trim() || !customerInfo.email?.trim()) {
        throw new Error("Please fill in all required fields")
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerInfo.email.trim())) {
        throw new Error("Please enter a valid email address")
      }

      const webhookUrl = getWebhookEndpoint("PROFESSIONAL_CONFIG")
      logWebhookUsage("PROFESSIONAL_CONFIG", "get_customer_pets")

      const payload = {
        professional_id: professionalId,
        action: "get_customer_pets",
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        customer_info: {
          first_name: customerInfo.firstName.trim(),
          last_name: customerInfo.lastName.trim(),
          email: customerInfo.email.trim().toLowerCase(),
          phone: customerInfo.phone?.trim() || "",
          notes: customerInfo.notes?.trim() || "",
        },
        booking_context: {
          selected_services: selectedServices.map((service) => service.name),
          selected_date: selectedTimeSlot.date,
          selected_time: selectedTimeSlot.startTime,
          selected_times: selectedTimeSlots.map((s) => ({ date: s.date, time: s.startTime })), // Multi
          booking_type: bookingType,
          recurring_config: recurringConfig,
          multi_day_slot: multiDayTimeSlot,
        },
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      let pets: any[] = []
      if (Array.isArray(result)) {
        const petsData = result.find((item) => item.pets || (Array.isArray(item) && item.length > 0))
        if (petsData?.pets) pets = petsData.pets
        else if (Array.isArray(petsData)) pets = petsData
      }

      const petResponse: PetResponse = { pets, success: true } as any
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
      if (service.duration_unit === "Hours") minutes = service.duration_number * 60
      else if (service.duration_unit === "Days") minutes = service.duration_number * 24 * 60
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

  const isDropIn = selectedServices.some(
    (s) => (s.service_type_name || "").toLowerCase().replace("-", " ") === "drop in",
  )
  const multipleWindows = isDropIn && selectedTimeSlots.length > 0

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
            </div>
          ) : multipleWindows ? (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 body-font">Professional:</span>
                  <p className="font-medium header-font">{professionalName}</p>
                </div>
                <div>
                  <span className="text-gray-500 body-font">Service:</span>
                  <p className="font-medium header-font">{selectedServices.map((s) => s.name).join(", ")}</p>
                </div>
              </div>
              <div>
                <span className="text-gray-500 body-font">Selected Times:</span>
                <ul className="mt-1 space-y-1">
                  {selectedTimeSlots.map((s, i) => (
                    <li key={`${s.date}-${s.startTime}-${i}`} className="flex justify-between">
                      <span className="header-font">{formatDateTimeFromISODate(s.date)}</span>
                      <span className="header-font font-medium">{s.startTime}</span>
                    </li>
                  ))}
                </ul>
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
                  <p className="font-medium header-font">
                    ${selectedServices.reduce((t, s) => t + Number(s.customer_cost), 0)}
                  </p>
                </div>
              )}
            </div>
          )}
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
                  value={customerInfo.phone || ""}
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
                  value={customerInfo.notes || ""}
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
                Back
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

  function formatDateTimeFromISODate(dateStr: string) {
    const [year, month, day] = dateStr.split("-").map(Number)
    const localDate = new Date(year, month - 1, day)
    return localDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, User, Mail } from "lucide-react"
import type { Service, SelectedTimeSlot, CustomerInfo, PetResponse } from "@/types/schedule"
import type { RecurringConfig } from "./booking-type-selection"

type CustomerFormProps = {
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  professionalId: string
  professionalName: string
  sessionId: string
  onPetsReceived: (customerInfo: CustomerInfo, petResponse: PetResponse) => void
  onBack: () => void
  bookingType?: "one-time" | "recurring"
  recurringConfig?: RecurringConfig | null
  showPrices?: boolean
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
  showPrices = true,
}: CustomerFormProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook-test/b550ab35-0e19-48d0-a831-a12dd775dfce"

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "lookup_pets",
          professional_id: professionalId,
          session_id: sessionId,
          timestamp: new Date().toISOString(),
          customer_info: {
            first_name: customerInfo.firstName.trim(),
            last_name: customerInfo.lastName.trim(),
            email: customerInfo.email.trim().toLowerCase(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Pet lookup result:", result)

      // Parse the pet response - handle the nested array structure
      let petResponse: PetResponse = { pets: [] }

      if (Array.isArray(result) && result.length > 0 && result[0].pets) {
        // Handle the case where result is an array with pets nested inside
        petResponse = { pets: result[0].pets }
      } else if (result.pets) {
        // Handle the case where pets are directly in the result
        petResponse = { pets: result.pets }
      } else if (Array.isArray(result)) {
        // Handle the case where result is directly an array of pets
        petResponse = { pets: result }
      }

      console.log("Parsed pet response:", petResponse)
      onPetsReceived(customerInfo, petResponse)
    } catch (err) {
      console.error("Error looking up pets:", err)
      setError("Failed to look up pets. Please try again.")
    } finally {
      setLoading(false)
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
        Back to Schedule
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Information Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl header-font text-[#E75837] flex items-center gap-2">
              <User className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="body-font">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={customerInfo.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="body-font">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={customerInfo.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="body-font flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              {error && <div className="text-red-600 text-sm body-font">{error}</div>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E75837] hover:bg-[#d14a2a] text-white body-font"
              >
                {loading ? "Looking up pets..." : "Continue to Pet Selection"}
              </Button>
            </form>
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
                <span className="text-gray-600 body-font">Professional</span>
                <span className="font-medium body-font">{professionalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 body-font">Date</span>
                <span className="font-medium body-font">
                  {new Date(selectedTimeSlot.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 body-font">Time</span>
                <span className="font-medium body-font">{selectedTimeSlot.startTime}</span>
              </div>
              {bookingType === "recurring" && recurringConfig && (
                <div className="flex justify-between">
                  <span className="text-gray-600 body-font">Recurring</span>
                  <span className="font-medium text-blue-600 body-font">
                    Every {recurringConfig.frequency} {recurringConfig.unit}
                    {recurringConfig.frequency > 1 ? "s" : ""}
                  </span>
                </div>
              )}
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

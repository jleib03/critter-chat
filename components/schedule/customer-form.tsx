"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, User, Mail, Calendar, Clock } from "lucide-react"
import type { Service, SelectedTimeSlot, CustomerInfo, PetResponse } from "@/types/schedule"
import type { BookingType, RecurringConfig } from "@/components/schedule/booking-type-selection"

interface CustomerFormProps {
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  professionalId: string
  professionalName: string
  sessionId: string
  onPetsReceived: (customerInfo: CustomerInfo, petResponse: PetResponse) => void
  onBack: () => void
  bookingType?: BookingType | null
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
          action: "get_customer_pets",
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

      // Handle the response - it should contain pets data
      const petResponse: PetResponse = {
        pets: result.pets || [],
        customer_exists: result.customer_exists || false,
      }

      onPetsReceived(customerInfo, petResponse)
    } catch (err) {
      console.error("Error fetching pets:", err)
      setError("Failed to load customer information. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const totalCost = selectedServices.reduce((sum, service) => sum + Number(service.customer_cost), 0)
  const totalDuration = selectedServices.reduce((sum, service) => {
    let duration = service.duration_number
    if (service.duration_unit === "Hours") {
      duration = duration * 60
    } else if (service.duration_unit === "Days") {
      duration = duration * 24 * 60
    }
    return sum + duration
  }, 0)

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
    } else {
      const days = Math.floor(minutes / 1440)
      const remainingHours = Math.floor((minutes % 1440) / 60)
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Button onClick={onBack} variant="outline" className="flex items-center gap-2 rounded-lg bg-transparent">
        <ArrowLeft className="w-4 h-4" />
        Back to Schedule
      </Button>

      {/* Booking Summary */}
      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl header-font">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#E75837]" />
              <div>
                <p className="font-medium body-font">
                  {selectedTimeSlot.dayOfWeek},{" "}
                  {new Date(selectedTimeSlot.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-600 body-font">Date</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#E75837]" />
              <div>
                <p className="font-medium body-font">{selectedTimeSlot.startTime}</p>
                <p className="text-sm text-gray-600 body-font">Start Time</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 header-font">Selected Services</h4>
            <div className="space-y-2">
              {selectedServices.map((service, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium body-font">{service.name}</p>
                    <p className="text-sm text-gray-600 body-font">
                      {service.duration_number} {service.duration_unit.toLowerCase()}
                    </p>
                  </div>
                  {showPrices && (
                    <p className="font-medium body-font">
                      {service.customer_cost_currency}
                      {Number(service.customer_cost).toFixed(2)}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-3 flex justify-between items-center">
              <div>
                <p className="font-semibold body-font">Total</p>
                <p className="text-sm text-gray-600 body-font">{formatDuration(totalDuration)}</p>
              </div>
              {showPrices && (
                <p className="font-semibold text-lg body-font">
                  {selectedServices[0]?.customer_cost_currency || "$"}
                  {totalCost.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {bookingType === "recurring" && recurringConfig && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2 header-font text-blue-600">Recurring Booking</h4>
              <p className="text-sm text-gray-600 body-font">
                This appointment will repeat every {recurringConfig.frequency} {recurringConfig.unit}
                {recurringConfig.frequency > 1 ? "s" : ""} until{" "}
                {new Date(recurringConfig.endDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              {recurringConfig.totalAppointments && (
                <p className="text-sm text-blue-600 body-font mt-1">
                  Total appointments: {recurringConfig.totalAppointments}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Information Form */}
      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl header-font">
            <User className="w-5 h-5 text-[#E75837]" />
            Your Information
          </CardTitle>
          <p className="text-gray-600 body-font">Please provide your contact details</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="body-font font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                  required
                  className="mt-1 rounded-lg"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="body-font font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={customerInfo.lastName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                  required
                  className="mt-1 rounded-lg"
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="body-font font-medium">
                Email Address
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  required
                  className="pl-10 rounded-lg"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm body-font">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E75837] hover:bg-[#d14a2a] text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading your pets...
                </>
              ) : (
                "Continue to Pet Selection"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

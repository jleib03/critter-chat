"use client"

import type React from "react"

import { useState } from "react"
import type { Service, SelectedTimeSlot, CustomerInfo, PetResponse } from "@/types/schedule"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, User, Calendar, Clock, DollarSign, ArrowLeft } from "lucide-react"

type CustomerFormProps = {
  selectedService: Service
  selectedTimeSlot: SelectedTimeSlot
  professionalId: string
  professionalName: string
  sessionId: string
  onPetsReceived: (customerInfo: CustomerInfo, petResponse: PetResponse) => void
  onBack: () => void
}

export function CustomerForm({
  selectedService,
  selectedTimeSlot,
  professionalId,
  professionalName,
  sessionId,
  onPetsReceived,
  onBack,
}: CustomerFormProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid = () => {
    return (
      customerInfo.firstName.trim() !== "" &&
      customerInfo.lastName.trim() !== "" &&
      customerInfo.email.trim() !== "" &&
      customerInfo.email.includes("@")
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid()) {
      setError("Please fill in all fields with valid information.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook-test/5671c1dd-48f6-47a9-85ac-4e20cf261520"

      const customerData = {
        professional_id: professionalId,
        action: "get_customer_pets",
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        customer_info: {
          first_name: customerInfo.firstName.trim(),
          last_name: customerInfo.lastName.trim(),
          email: customerInfo.email.trim().toLowerCase(),
        },
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Pet data received:", result)

      // Pass the customer info and pet response to parent
      onPetsReceived(customerInfo, result[0] || result)
    } catch (err) {
      console.error("Error fetching pets:", err)
      setError("Failed to retrieve pet information. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPrice = (price: string) => {
    return `$${Number.parseFloat(price).toFixed(0)}`
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="text-gray-600 hover:text-gray-900 body-font">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Schedule
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl header-font text-[#E75837]">Customer Information</CardTitle>
          <p className="text-gray-600 body-font">Enter your information to find your pets and continue booking.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 header-font">Booking Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                    {selectedTimeSlot.dayOfWeek},{" "}
                    {new Date(selectedTimeSlot.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
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
                  <span className="text-gray-500 body-font">Cost:</span>
                  <p className="font-medium body-font">{formatPrice(selectedService.customer_cost)}</p>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="font-medium text-gray-900 body-font">{selectedService.name}</p>
              <p className="text-sm text-gray-600 body-font">
                {formatDuration(selectedService.duration_number, selectedService.duration_unit)}
              </p>
              {selectedService.description && (
                <p className="text-sm text-gray-600 body-font mt-1">{selectedService.description}</p>
              )}
            </div>
          </div>

          {/* Customer Information Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="body-font">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={customerInfo.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Enter your first name"
                  required
                  className="body-font"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="body-font">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={customerInfo.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Enter your last name"
                  required
                  className="body-font"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="body-font">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email address"
                required
                className="body-font"
              />
              <p className="text-xs text-gray-500 body-font">
                We'll use this to find your pets and send booking confirmations.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm body-font">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="w-full bg-[#E75837] hover:bg-[#d14a2a] text-white body-font"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Finding Your Pets...
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

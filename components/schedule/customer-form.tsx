"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Calendar, Clock, DollarSign } from "lucide-react"
import type { Service, SelectedTimeSlot, CustomerInfo, PetResponse } from "@/types/schedule"
import type { BookingType, RecurringConfig } from "./booking-type-selection"
import { DEMO_SERVICE_REQUEST } from "@/utils/demo-data"

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
}: CustomerFormProps) {
  // Prepopulate with demo data
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: DEMO_SERVICE_REQUEST.contactInfo.firstName,
    lastName: DEMO_SERVICE_REQUEST.contactInfo.lastName,
    email: DEMO_SERVICE_REQUEST.contactInfo.email,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook/5671c1dd-48f6-47a9-85ac-4e20cf261520"

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          professional_id: professionalId,
          action: "get_customer_pets",
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
      console.log("Customer pets response:", result)

      // Handle the response - it should contain pets data
      if (result && Array.isArray(result) && result.length > 0) {
        const petResponse: PetResponse = {
          pets: result.map((pet: any) => ({
            pet_id: pet.pet_id,
            pet_name: pet.pet_name,
            pet_type: pet.pet_type,
            breed: pet.breed || "",
            age: pet.age || 0,
            weight: pet.weight || 0,
            special_notes: pet.special_notes || "",
          })),
        }

        onPetsReceived(customerInfo, petResponse)
      } else {
        throw new Error("No pets found for this customer")
      }
    } catch (err) {
      console.error("Error fetching customer pets:", err)
      setError("Failed to load customer information. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const totalCost = selectedServices.reduce((sum, service) => sum + service.customer_cost, 0)

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <CardTitle className="text-2xl">Customer Information</CardTitle>
              <p className="text-gray-600 mt-1">Please provide your contact details to continue</p>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Services:</span>
              <span className="text-gray-700">{selectedServices.map((s) => s.name).join(", ")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Date & Time:</span>
              <div className="text-right">
                <div className="flex items-center gap-1 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(selectedTimeSlot.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span>{selectedTimeSlot.startTime}</span>
                </div>
              </div>
            </div>
            {bookingType === "recurring" && recurringConfig && (
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Recurring:</span>
                <span className="text-gray-700">
                  Every {recurringConfig.frequency} {recurringConfig.unit}
                  {recurringConfig.endDate && ` until ${recurringConfig.endDate}`}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-medium text-gray-900">Total Cost:</span>
              <div className="flex items-center gap-1 font-semibold text-green-600">
                <DollarSign className="w-4 h-4" />
                <span>${totalCost}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={customerInfo.lastName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                required
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
                Back to Schedule
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading Pets...
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

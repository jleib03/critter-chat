"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, User, Calendar, Clock, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import type { Service, SelectedTimeSlot, CustomerInfo, PetResponse } from "@/types/schedule"
import type { BookingType, RecurringConfig } from "./booking-type-selection"

interface CustomerData {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
}

interface CustomerFormProps {
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  professionalId: string
  professionalName: string
  sessionId: string
  bookingType: BookingType | null
  recurringConfig: RecurringConfig | null
  onPetsReceived: (customerInfo: CustomerInfo, petResponse: PetResponse) => void
  onBack: () => void
  showPrices: boolean
}

export function CustomerForm({
  selectedServices,
  selectedTimeSlot,
  professionalId,
  professionalName,
  sessionId,
  bookingType,
  recurringConfig,
  onPetsReceived,
  onBack,
  showPrices,
}: CustomerFormProps) {
  const [customerData, setCustomerData] = useState<CustomerData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<CustomerData>>({})

  // Calculate totals
  const totalCost = selectedServices.reduce((sum, service) => {
    return sum + Number.parseFloat(service.customer_cost.toString())
  }, 0)

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

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const validateForm = () => {
    const newErrors: Partial<CustomerData> = {}

    if (!customerData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!customerData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!customerData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(customerData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Please fill in all required fields",
        description: "First name, last name, and email are required.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook/b550ab35-0e19-48d0-a831-a12dd775dfce"

      console.log("Sending webhook to:", webhookUrl)

      const payload = {
        professional_id: professionalId,
        action: "get_customer_pets",
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        customer_info: {
          first_name: customerData.firstName.trim(),
          last_name: customerData.lastName.trim(),
          email: customerData.email.trim().toLowerCase(),
          phone: customerData.phone.trim(),
          notes: customerData.notes.trim(),
        },
        booking_context: {
          selected_services: selectedServices.map((service) => service.name),
          selected_date: selectedTimeSlot.date,
          selected_time: selectedTimeSlot.startTime,
          booking_type: bookingType,
          recurring_config: recurringConfig,
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
      console.log("Pets webhook response received:", result)

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

      console.log("Parsed pets:", petResponse)

      const customerInfo: CustomerInfo = {
        firstName: customerData.firstName.trim(),
        lastName: customerData.lastName.trim(),
        email: customerData.email.trim().toLowerCase(),
      }

      console.log("Final pet response:", petResponse)

      toast({
        title: "Customer information saved",
        description: `Found ${petResponse.pets.length} pet${petResponse.pets.length !== 1 ? "s" : ""} for your account.`,
      })

      onPetsReceived(customerInfo, petResponse)
    } catch (error) {
      console.error("Error getting customer pets:", error)
      toast({
        title: "Error",
        description: "Failed to get pet information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="text-gray-600 hover:text-gray-900 body-font">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Schedule
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl header-font text-[#E75837] flex items-center gap-2">
              <User className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="body-font">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={customerData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={`body-font ${errors.firstName ? "border-red-500" : ""}`}
                    placeholder="First Name"
                    required
                  />
                  {errors.firstName && <p className="text-sm text-red-500 mt-1 body-font">{errors.firstName}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName" className="body-font">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={customerData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={`body-font ${errors.lastName ? "border-red-500" : ""}`}
                    placeholder="Last Name"
                    required
                  />
                  {errors.lastName && <p className="text-sm text-red-500 mt-1 body-font">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="body-font">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`body-font ${errors.email ? "border-red-500" : ""}`}
                    placeholder="your@email.com"
                    required
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1 body-font">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone" className="body-font">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="body-font"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <Label htmlFor="notes" className="body-font">
                  Special Instructions or Notes
                </Label>
                <Textarea
                  id="notes"
                  value={customerData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="body-font min-h-[100px]"
                  placeholder="Any special requests or information we should know..."
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#E75837] hover:bg-[#d14a2a] text-white body-font"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting Pet Information...
                  </>
                ) : (
                  <>Continue to Pet Selection</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl header-font text-[#E75837]">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date & Time */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <h3 className="font-medium text-gray-900 body-font">Date & Time</h3>
              </div>
              <p className="text-gray-700 body-font">{formatDate(selectedTimeSlot.date)}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <p className="text-gray-700 body-font">{selectedTimeSlot.startTime}</p>
              </div>
            </div>

            {/* Services */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <h3 className="font-medium text-gray-900 body-font">Services</h3>
              </div>
              <div className="space-y-3">
                {selectedServices.map((service, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 body-font">{service.name}</p>
                      <p className="text-sm text-gray-600 body-font">
                        {service.duration_number}{" "}
                        {service.duration_unit === "Minutes"
                          ? service.duration_number === 1
                            ? "minute"
                            : "minutes"
                          : service.duration_unit.toLowerCase()}
                      </p>
                    </div>
                    {showPrices && (
                      <p className="font-medium text-gray-900 body-font">
                        {formatCurrency(Number.parseFloat(service.customer_cost.toString()))}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              {showPrices && (
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-gray-900 body-font">Total</p>
                  <p className="font-semibold text-gray-900 body-font text-lg">{formatCurrency(totalCost)}</p>
                </div>
              )}
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 body-font">Duration</p>
                <p className="text-sm text-gray-600 body-font">{formatDuration(totalDuration)}</p>
              </div>
            </div>

            {/* Booking Type */}
            {bookingType && (
              <div className="pt-4 border-t">
                <Badge
                  className={`body-font ${
                    bookingType === "one-time"
                      ? "bg-[#E75837] hover:bg-[#d14a2a] text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {bookingType === "one-time" ? "One-time Booking" : "Recurring Booking"}
                </Badge>
                {recurringConfig && bookingType === "recurring" && (
                  <p className="text-sm text-gray-600 mt-2 body-font">
                    Every {recurringConfig.frequency} {recurringConfig.unit}
                    {recurringConfig.frequency > 1 ? "s" : ""} until {recurringConfig.endDate}
                  </p>
                )}
              </div>
            )}

            {/* Professional Info */}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 body-font">
                <span className="font-medium">with</span> {professionalName}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Export both named and default
export default CustomerForm

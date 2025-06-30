"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, User, Phone, Mail, MapPin, Calendar, Clock, DollarSign, CheckCircle } from "lucide-react"
import type { BookingData } from "@/types/booking"

interface CustomerFormProps {
  bookingData: BookingData
  onSubmit: (customerData: CustomerData) => void
  onBack: () => void
  loading?: boolean
}

interface CustomerData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  specialInstructions: string
}

export function CustomerForm({ bookingData, onSubmit, onBack, loading = false }: CustomerFormProps) {
  const [customerData, setCustomerData] = useState<CustomerData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    specialInstructions: "",
  })

  const [errors, setErrors] = useState<Partial<CustomerData>>({})

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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!customerData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[\d\s\-$$$$+]+$/.test(customerData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!customerData.address.trim()) {
      newErrors.address = "Address is required"
    }

    if (!customerData.city.trim()) {
      newErrors.city = "City is required"
    }

    if (!customerData.state.trim()) {
      newErrors.state = "State is required"
    }

    if (!customerData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Send webhook with complete booking data
    try {
      const webhookUrl =
        process.env.NEXT_PUBLIC_WEBHOOK_URL || "https://jleib03.app.n8n.cloud/webhook/critter-booking-webhook"

      const webhookPayload = {
        action: "booking_submitted",
        timestamp: new Date().toISOString(),
        professional_id: bookingData.professionalId,
        booking_data: {
          // Customer information
          customer: {
            first_name: customerData.firstName,
            last_name: customerData.lastName,
            email: customerData.email,
            phone: customerData.phone,
            address: {
              street: customerData.address,
              city: customerData.city,
              state: customerData.state,
              zip_code: customerData.zipCode,
            },
            special_instructions: customerData.specialInstructions,
          },
          // Booking details
          booking_type: bookingData.bookingType,
          selected_services: bookingData.selectedServices,
          selected_pets: bookingData.selectedPets,
          selected_date: bookingData.selectedDate,
          selected_time: bookingData.selectedTime,
          frequency: bookingData.frequency,
          duration_weeks: bookingData.durationWeeks,
          total_cost: bookingData.totalCost,
          // Additional booking metadata
          booking_id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          status: "pending_confirmation",
        },
      }

      console.log("Sending booking webhook:", webhookPayload)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`)
      }

      const webhookResponse = await response.json()
      console.log("Webhook response:", webhookResponse)

      // Call the onSubmit callback
      onSubmit(customerData)
    } catch (error) {
      console.error("Error sending booking webhook:", error)
      // Still call onSubmit to show confirmation, but log the webhook error
      onSubmit(customerData)
    }
  }

  const updateField = (field: keyof CustomerData, value: string) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 header-font">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="body-font">
                  <strong>Date:</strong> {formatDate(bookingData.selectedDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="body-font">
                  <strong>Time:</strong> {formatTime(bookingData.selectedTime)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="body-font">
                  <strong>Total Cost:</strong> {formatCurrency(bookingData.totalCost)}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <strong className="body-font">Services:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {bookingData.selectedServices.map((service) => (
                    <Badge key={service.id} variant="secondary" className="text-xs">
                      {service.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <strong className="body-font">Pets:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {bookingData.selectedPets.map((pet) => (
                    <Badge key={pet.id} variant="outline" className="text-xs">
                      {pet.name} ({pet.type})
                    </Badge>
                  ))}
                </div>
              </div>
              {bookingData.bookingType === "recurring" && (
                <div>
                  <strong className="body-font">Frequency:</strong>
                  <span className="ml-2 body-font">
                    {bookingData.frequency} for {bookingData.durationWeeks} weeks
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 header-font">
            <User className="w-5 h-5 text-[#E75837]" />
            Your Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="body-font">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={customerData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className={`body-font ${errors.firstName ? "border-red-500" : ""}`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1 body-font">{errors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="lastName" className="body-font">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={customerData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className={`body-font ${errors.lastName ? "border-red-500" : ""}`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1 body-font">{errors.lastName}</p>}
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="body-font">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={`pl-10 body-font ${errors.email ? "border-red-500" : ""}`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1 body-font">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="phone" className="body-font">
                  Phone Number *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={`pl-10 body-font ${errors.phone ? "border-red-500" : ""}`}
                    placeholder="(555) 123-4567"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1 body-font">{errors.phone}</p>}
              </div>
            </div>

            {/* Address Fields */}
            <div>
              <Label htmlFor="address" className="body-font">
                Street Address *
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="address"
                  value={customerData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className={`pl-10 body-font ${errors.address ? "border-red-500" : ""}`}
                  placeholder="123 Main Street"
                />
              </div>
              {errors.address && <p className="text-red-500 text-sm mt-1 body-font">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city" className="body-font">
                  City *
                </Label>
                <Input
                  id="city"
                  value={customerData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={`body-font ${errors.city ? "border-red-500" : ""}`}
                  placeholder="City"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1 body-font">{errors.city}</p>}
              </div>
              <div>
                <Label htmlFor="state" className="body-font">
                  State *
                </Label>
                <Input
                  id="state"
                  value={customerData.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className={`body-font ${errors.state ? "border-red-500" : ""}`}
                  placeholder="State"
                />
                {errors.state && <p className="text-red-500 text-sm mt-1 body-font">{errors.state}</p>}
              </div>
              <div>
                <Label htmlFor="zipCode" className="body-font">
                  ZIP Code *
                </Label>
                <Input
                  id="zipCode"
                  value={customerData.zipCode}
                  onChange={(e) => updateField("zipCode", e.target.value)}
                  className={`body-font ${errors.zipCode ? "border-red-500" : ""}`}
                  placeholder="12345"
                />
                {errors.zipCode && <p className="text-red-500 text-sm mt-1 body-font">{errors.zipCode}</p>}
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <Label htmlFor="specialInstructions" className="body-font">
                Special Instructions (Optional)
              </Label>
              <Textarea
                id="specialInstructions"
                value={customerData.specialInstructions}
                onChange={(e) => updateField("specialInstructions", e.target.value)}
                className="body-font"
                placeholder="Any special instructions or notes for your appointment..."
                rows={3}
              />
            </div>

            <Separator />

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-4">
              <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
                Back to Date & Time
              </Button>
              <Button type="submit" disabled={loading} className="bg-[#E75837] hover:bg-[#d14a2a]">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Complete Booking"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CustomerForm

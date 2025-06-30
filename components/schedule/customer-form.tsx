"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Clock, User, Check } from "lucide-react"

interface CustomerFormProps {
  selectedServices: Array<{
    id: string
    name: string
    duration: number
    price: number
  }>
  selectedDateTime: {
    date: string
    time: string
  }
  bookingType: "one-time" | "recurring"
  recurringFrequency?: "weekly" | "bi-weekly" | "monthly"
  professionalId: string
  onSubmit: (customerData: any) => void
  onBack: () => void
}

export function CustomerForm({
  selectedServices,
  selectedDateTime,
  bookingType,
  recurringFrequency,
  professionalId,
  onSubmit,
  onBack,
}: CustomerFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    petName: "",
    petType: "",
    petBreed: "",
    petAge: "",
    specialInstructions: "",
    emergencyContact: "",
    emergencyPhone: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.petName.trim()) newErrors.petName = "Pet name is required"
    if (!formData.petType.trim()) newErrors.petType = "Pet type is required"

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-$$$$+]+$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0)
  }

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`)
    return dateObj.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Prepare booking data
      const bookingData = {
        action: "create_booking",
        professional_id: professionalId,
        session_id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        booking_details: {
          customer_info: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            emergency_contact: formData.emergencyContact,
            emergency_phone: formData.emergencyPhone,
          },
          pet_info: {
            name: formData.petName,
            type: formData.petType,
            breed: formData.petBreed,
            age: formData.petAge,
          },
          booking_info: {
            services: selectedServices,
            date: selectedDateTime.date,
            time: selectedDateTime.time,
            booking_type: bookingType,
            recurring_frequency: recurringFrequency,
            special_instructions: formData.specialInstructions,
            total_amount: calculateTotal(),
          },
        },
      }

      console.log("Submitting booking data:", bookingData)

      // Send to webhook
      const webhookUrl =
        process.env.NEXT_PUBLIC_WEBHOOK_URL || "https://jleib03.app.n8n.cloud/webhook/customer-booking-submission"

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Booking submission result:", result)

      // Call the onSubmit callback with the form data
      onSubmit({
        ...formData,
        services: selectedServices,
        dateTime: selectedDateTime,
        bookingType,
        recurringFrequency,
        total: calculateTotal(),
      })
    } catch (error) {
      console.error("Error submitting booking:", error)
      setErrors({ submit: "Failed to submit booking. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 header-font">
            <Calendar className="w-5 h-5" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 header-font">Selected Services</h4>
              <div className="space-y-2">
                {selectedServices.map((service) => (
                  <div key={service.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium body-font">{service.name}</span>
                      <span className="text-sm text-gray-500 ml-2 body-font">({service.duration} min)</span>
                    </div>
                    <span className="font-semibold body-font">${service.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold header-font">Total:</span>
                  <span className="font-bold text-lg text-[#E75837] body-font">${calculateTotal()}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 header-font">Appointment Details</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="body-font">{formatDateTime(selectedDateTime.date, selectedDateTime.time)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={bookingType === "recurring" ? "default" : "secondary"} className="body-font">
                    {bookingType === "recurring" ? `Recurring (${recurringFrequency})` : "One-time"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 header-font">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="body-font">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={`body-font ${errors.firstName ? "border-red-500" : ""}`}
                  placeholder="Enter first name"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1 body-font">{errors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="lastName" className="body-font">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={`body-font ${errors.lastName ? "border-red-500" : ""}`}
                  placeholder="Enter last name"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1 body-font">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="body-font">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`body-font ${errors.email ? "border-red-500" : ""}`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1 body-font">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="phone" className="body-font">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`body-font ${errors.phone ? "border-red-500" : ""}`}
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1 body-font">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="body-font">
                Address
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="body-font"
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city" className="body-font">
                  City
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="body-font"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <Label htmlFor="state" className="body-font">
                  State
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="body-font"
                  placeholder="Enter state"
                />
              </div>
              <div>
                <Label htmlFor="zipCode" className="body-font">
                  ZIP Code
                </Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  className="body-font"
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact" className="body-font">
                  Emergency Contact Name
                </Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  className="body-font"
                  placeholder="Enter emergency contact name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone" className="body-font">
                  Emergency Contact Phone
                </Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  className="body-font"
                  placeholder="Enter emergency contact phone"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pet Information */}
        <Card>
          <CardHeader>
            <CardTitle className="header-font">Pet Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="petName" className="body-font">
                  Pet Name *
                </Label>
                <Input
                  id="petName"
                  value={formData.petName}
                  onChange={(e) => handleInputChange("petName", e.target.value)}
                  className={`body-font ${errors.petName ? "border-red-500" : ""}`}
                  placeholder="Enter pet's name"
                />
                {errors.petName && <p className="text-red-500 text-sm mt-1 body-font">{errors.petName}</p>}
              </div>
              <div>
                <Label htmlFor="petType" className="body-font">
                  Pet Type *
                </Label>
                <Select value={formData.petType} onValueChange={(value) => handleInputChange("petType", value)}>
                  <SelectTrigger className={`body-font ${errors.petType ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select pet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="bird">Bird</SelectItem>
                    <SelectItem value="rabbit">Rabbit</SelectItem>
                    <SelectItem value="hamster">Hamster</SelectItem>
                    <SelectItem value="guinea-pig">Guinea Pig</SelectItem>
                    <SelectItem value="reptile">Reptile</SelectItem>
                    <SelectItem value="fish">Fish</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.petType && <p className="text-red-500 text-sm mt-1 body-font">{errors.petType}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="petBreed" className="body-font">
                  Breed
                </Label>
                <Input
                  id="petBreed"
                  value={formData.petBreed}
                  onChange={(e) => handleInputChange("petBreed", e.target.value)}
                  className="body-font"
                  placeholder="Enter pet's breed"
                />
              </div>
              <div>
                <Label htmlFor="petAge" className="body-font">
                  Age
                </Label>
                <Input
                  id="petAge"
                  value={formData.petAge}
                  onChange={(e) => handleInputChange("petAge", e.target.value)}
                  className="body-font"
                  placeholder="Enter pet's age"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="specialInstructions" className="body-font">
                Special Instructions or Notes
              </Label>
              <Textarea
                id="specialInstructions"
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                className="body-font"
                placeholder="Any special instructions, medical conditions, or behavioral notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 body-font">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack} className="body-font bg-transparent">
            Back to Date & Time
          </Button>
          <Button type="submit" disabled={loading} className="bg-[#E75837] hover:bg-[#d14a2a] body-font">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Confirm Booking
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CustomerForm

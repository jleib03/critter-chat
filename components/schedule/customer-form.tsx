"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Phone, Mail, MapPin, Calendar, Clock, Loader2, PawPrint, Heart } from "lucide-react"
import type { BookingData } from "@/types/booking"

interface CustomerFormProps {
  bookingData: BookingData
  onSubmit: (customerData: any) => void
  onBack: () => void
  loading?: boolean
}

export function CustomerForm({ bookingData, onSubmit, onBack, loading = false }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    // Customer Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",

    // Address Information
    address: "",
    city: "",
    state: "",
    zipCode: "",

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",

    // Special Instructions
    specialInstructions: "",

    // Agreement
    agreedToTerms: false,
    allowMarketing: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.agreedToTerms) newErrors.agreedToTerms = "You must agree to the terms and conditions"

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation (basic)
    if (formData.phone && !/^[\d\s\-$$$$+]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Prepare the complete booking data
    const completeBookingData = {
      ...bookingData,
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        specialInstructions: formData.specialInstructions,
        allowMarketing: formData.allowMarketing,
      },
      timestamp: new Date().toISOString(),
    }

    onSubmit(completeBookingData)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // Calculate total cost
  const totalCost =
    bookingData.selectedServices?.reduce((total, service) => {
      return total + (service.price || 0)
    }, 0) || 0

  // Format date and time for display
  const formatDateTime = (date: string, time: string) => {
    const bookingDate = new Date(`${date}T${time}`)
    return {
      date: bookingDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: bookingDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    }
  }

  const { date: formattedDate, time: formattedTime } =
    bookingData.selectedDate && bookingData.selectedTime
      ? formatDateTime(bookingData.selectedDate, bookingData.selectedTime)
      : { date: "", time: "" }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 header-font">
            <Calendar className="w-5 h-5 text-[#E75837]" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Services */}
          <div>
            <h4 className="font-semibold mb-2 header-font">Selected Services</h4>
            <div className="space-y-2">
              {bookingData.selectedServices?.map((service, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium body-font">{service.name}</span>
                    {service.duration && (
                      <span className="text-gray-500 body-font text-sm ml-2">({service.duration} min)</span>
                    )}
                  </div>
                  {service.price && (
                    <span className="font-semibold text-[#E75837] body-font">${service.price.toFixed(2)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Pets */}
          {bookingData.selectedPets && bookingData.selectedPets.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 header-font">Selected Pets</h4>
              <div className="flex flex-wrap gap-2">
                {bookingData.selectedPets.map((pet, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <PawPrint className="w-3 h-3" />
                    {pet.name} ({pet.type})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="body-font">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="body-font">{formattedTime}</span>
            </div>
          </div>

          {/* Total Cost */}
          {totalCost > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-semibold header-font">Total Cost:</span>
              <span className="text-xl font-bold text-[#E75837] header-font">${totalCost.toFixed(2)}</span>
            </div>
          )}
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
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="body-font">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
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
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  className={`body-font ${errors.lastName ? "border-red-500" : ""}`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1 body-font">{errors.lastName}</p>}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="body-font">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
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
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    className={`pl-10 body-font ${errors.phone ? "border-red-500" : ""}`}
                    placeholder="(555) 123-4567"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1 body-font">{errors.phone}</p>}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h4 className="font-semibold header-font">Address (Optional)</h4>

              <div>
                <Label htmlFor="address" className="body-font">
                  Street Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                    className="pl-10 body-font"
                    placeholder="123 Main Street"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className="body-font">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData("city", e.target.value)}
                    className="body-font"
                    placeholder="City"
                  />
                </div>

                <div>
                  <Label htmlFor="state" className="body-font">
                    State
                  </Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateFormData("state", e.target.value)}
                    className="body-font"
                    placeholder="State"
                  />
                </div>

                <div>
                  <Label htmlFor="zipCode" className="body-font">
                    ZIP Code
                  </Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData("zipCode", e.target.value)}
                    className="body-font"
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold header-font">Emergency Contact (Optional)</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContactName" className="body-font">
                    Emergency Contact Name
                  </Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => updateFormData("emergencyContactName", e.target.value)}
                    className="body-font"
                    placeholder="Contact person name"
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyContactPhone" className="body-font">
                    Emergency Contact Phone
                  </Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => updateFormData("emergencyContactPhone", e.target.value)}
                    className="body-font"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <Label htmlFor="specialInstructions" className="body-font">
                Special Instructions or Notes
              </Label>
              <Textarea
                id="specialInstructions"
                value={formData.specialInstructions}
                onChange={(e) => updateFormData("specialInstructions", e.target.value)}
                className="body-font"
                placeholder="Any special instructions, allergies, or notes about your pet(s)..."
                rows={4}
              />
            </div>

            {/* Agreements */}
            <div className="space-y-4">
              <Separator />

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) => updateFormData("agreedToTerms", checked)}
                    className={errors.agreedToTerms ? "border-red-500" : ""}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="agreedToTerms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 body-font"
                    >
                      I agree to the terms and conditions *
                    </Label>
                    <p className="text-xs text-muted-foreground body-font">
                      By checking this box, you agree to our service terms and cancellation policy.
                    </p>
                  </div>
                </div>
                {errors.agreedToTerms && <p className="text-red-500 text-sm body-font">{errors.agreedToTerms}</p>}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="allowMarketing"
                    checked={formData.allowMarketing}
                    onCheckedChange={(checked) => updateFormData("allowMarketing", checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="allowMarketing"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 body-font"
                    >
                      Send me promotional emails and updates
                    </Label>
                    <p className="text-xs text-muted-foreground body-font">
                      Receive updates about services, promotions, and pet care tips.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={loading}
                className="flex-1 body-font bg-transparent"
              >
                Back to Date Selection
              </Button>

              <Button type="submit" disabled={loading} className="flex-1 bg-[#E75837] hover:bg-[#d14a2a] body-font">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirming Booking...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Named export

// Default export
export default CustomerForm

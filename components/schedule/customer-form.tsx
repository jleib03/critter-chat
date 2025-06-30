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
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, User, CreditCard, Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import type { BookingData } from "@/types/booking"

interface CustomerFormProps {
  bookingData: BookingData
  onBack: () => void
  onComplete: (customerData: CustomerData) => void
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
  notes: string
}

export function CustomerForm({ bookingData, onBack, onComplete }: CustomerFormProps) {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  })

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerData.firstName || !customerData.lastName || !customerData.email || !customerData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Prepare webhook payload
      const webhookPayload = {
        action: "create_booking",
        booking_data: {
          professional_id: bookingData.professionalId,
          service_ids: bookingData.selectedServices.map((s) => s.id),
          service_names: bookingData.selectedServices.map((s) => s.name),
          booking_type: bookingData.bookingType,
          date: bookingData.selectedDate,
          time: bookingData.selectedTime,
          duration: bookingData.totalDuration,
          total_cost: bookingData.totalCost,
          frequency: bookingData.frequency,
          end_date: bookingData.endDate,
          customer: {
            first_name: customerData.firstName,
            last_name: customerData.lastName,
            email: customerData.email,
            phone: customerData.phone,
            address: customerData.address,
            city: customerData.city,
            state: customerData.state,
            zip_code: customerData.zipCode,
            notes: customerData.notes,
          },
          pets: bookingData.selectedPets || [],
          session_id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        },
      }

      console.log("Sending booking webhook:", webhookPayload)

      // Send to webhook
      const webhookUrl =
        process.env.NEXT_PUBLIC_WEBHOOK_URL ||
        "https://jleib03.app.n8n.cloud/webhook/5671c1dd-48f6-47a9-85ac-4e20cf261520"

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Webhook response:", result)

      toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been successfully scheduled.",
      })

      onComplete(customerData)
    } catch (error) {
      console.error("Error submitting booking:", error)
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T12:00:00")
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 header-font">Complete Your Booking</h1>
          <p className="text-gray-600 body-font">
            Please provide your contact information to confirm your appointment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 header-font">
                <User className="w-5 h-5" />
                Contact Information
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
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter your first name"
                      required
                      className="body-font"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="body-font">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      value={customerData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                      required
                      className="body-font"
                    />
                  </div>
                </div>

                {/* Contact Fields */}
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
                      placeholder="your@email.com"
                      required
                      className="body-font"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="body-font">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                      required
                      className="body-font"
                    />
                  </div>
                </div>

                {/* Address Fields */}
                <div>
                  <Label htmlFor="address" className="body-font">
                    Street Address
                  </Label>
                  <Input
                    id="address"
                    value={customerData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="123 Main Street"
                    className="body-font"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="body-font">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={customerData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="City"
                      className="body-font"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="body-font">
                      State
                    </Label>
                    <Input
                      id="state"
                      value={customerData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="State"
                      className="body-font"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="body-font">
                      ZIP Code
                    </Label>
                    <Input
                      id="zipCode"
                      value={customerData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      placeholder="12345"
                      className="body-font"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="body-font">
                    Special Instructions or Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={customerData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any special requests or information we should know..."
                    rows={3}
                    className="body-font"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#E75837] hover:bg-[#d14a2a] text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Confirming Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="header-font">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date & Time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium body-font">Date & Time</span>
                </div>
                <div className="text-sm text-gray-600 body-font ml-6">
                  <div>{formatDate(bookingData.selectedDate)}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(bookingData.selectedTime)}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Services */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="font-medium body-font">Services</span>
                </div>
                <div className="space-y-2 ml-6">
                  {bookingData.selectedServices.map((service) => (
                    <div key={service.id} className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium body-font">{service.name}</div>
                        <div className="text-xs text-gray-500 body-font">{service.duration} min</div>
                      </div>
                      <div className="text-sm font-medium body-font">${service.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pets */}
              {bookingData.selectedPets && bookingData.selectedPets.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium body-font">Pets</span>
                    </div>
                    <div className="space-y-1 ml-6">
                      {bookingData.selectedPets.map((pet, index) => (
                        <div key={index} className="text-sm text-gray-600 body-font">
                          {pet.name} ({pet.type})
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Booking Type */}
              {bookingData.bookingType === "recurring" && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium body-font">Recurring</span>
                    </div>
                    <div className="text-sm text-gray-600 body-font ml-6">
                      <div>Every {bookingData.frequency}</div>
                      {bookingData.endDate && <div>Until {formatDate(bookingData.endDate)}</div>}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold body-font">Total</span>
                <span className="font-semibold text-lg body-font">${bookingData.totalCost}</span>
              </div>

              {/* Booking Type Badge */}
              <div className="pt-2">
                <Badge variant={bookingData.bookingType === "one-time" ? "default" : "secondary"}>
                  {bookingData.bookingType === "one-time" ? "One-time Booking" : "Recurring Booking"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CustomerForm

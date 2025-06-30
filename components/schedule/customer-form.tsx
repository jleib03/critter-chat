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
  bookingType: BookingType | null
  recurringConfig: RecurringConfig | null
}

interface CustomerData {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
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
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  })

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }))
  }

  // Calculate total cost and duration
  const totalCost = selectedServices.reduce((sum, service) => sum + service.customer_cost, 0)
  const totalDuration = selectedServices.reduce((sum, service) => {
    let durationInMinutes = service.duration_number
    if (service.duration_unit === "Hours") {
      durationInMinutes = service.duration_number * 60
    } else if (service.duration_unit === "Days") {
      durationInMinutes = service.duration_number * 24 * 60
    }
    return sum + durationInMinutes
  }, 0)

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
      // Prepare webhook payload to get customer's pets
      const webhookPayload = {
        action: "get_customer_pets",
        professional_id: professionalId,
        session_id: sessionId,
        customer_info: {
          first_name: customerData.firstName.trim(),
          last_name: customerData.lastName.trim(),
          email: customerData.email.trim().toLowerCase(),
          phone: customerData.phone.trim(),
          notes: customerData.notes.trim(),
        },
        timestamp: new Date().toISOString(),
      }

      console.log("Sending webhook to get customer pets:", webhookPayload)

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
      console.log("Pets webhook response received:", result)

      // Extract customer info for next step
      const customerInfo: CustomerInfo = {
        firstName: customerData.firstName.trim(),
        lastName: customerData.lastName.trim(),
        email: customerData.email.trim().toLowerCase(),
      }

      // Pass pets data to parent component
      onPetsReceived(customerInfo, result)

      toast({
        title: "Success",
        description: "Customer information saved. Proceeding to pet selection.",
      })
    } catch (error) {
      console.error("Error getting customer pets:", error)
      toast({
        title: "Error",
        description: "There was an error retrieving your pet information. Please try again.",
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
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
            Please provide your contact information to continue to pet selection.
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
                        Getting Pet Information...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Continue to Pet Selection
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
                  <div>{formatDate(selectedTimeSlot.date)}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(selectedTimeSlot.startTime)}
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
                  {selectedServices.map((service, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium body-font">{service.name}</div>
                        <div className="text-xs text-gray-500 body-font">
                          {service.duration_number} {service.duration_unit.toLowerCase()}
                        </div>
                      </div>
                      <div className="text-sm font-medium body-font">{formatCurrency(service.customer_cost)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Type */}
              {bookingType === "recurring" && recurringConfig && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium body-font">Recurring</span>
                    </div>
                    <div className="text-sm text-gray-600 body-font ml-6">
                      <div>
                        Every {recurringConfig.frequency} {recurringConfig.unit}(s)
                      </div>
                      {recurringConfig.endDate && <div>Until {formatDate(recurringConfig.endDate)}</div>}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold body-font">Total</span>
                <span className="font-semibold text-lg body-font">{formatCurrency(totalCost)}</span>
              </div>

              {/* Duration */}
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span className="body-font">Duration</span>
                <span className="body-font">
                  {totalDuration >= 60
                    ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`
                    : `${totalDuration}m`}
                </span>
              </div>

              {/* Booking Type Badge */}
              <div className="pt-2">
                <Badge variant={bookingType === "one-time" ? "default" : "secondary"}>
                  {bookingType === "one-time" ? "One-time Booking" : "Recurring Booking"}
                </Badge>
              </div>

              {/* Professional */}
              <div className="pt-2 text-sm text-gray-600 body-font">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>with {professionalName}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CustomerForm

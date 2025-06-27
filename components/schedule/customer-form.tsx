"use client"

import type React from "react"
import { useState } from "react"
import { User, Calendar, Clock, DollarSign, ArrowLeft, Repeat, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import type { Service, SelectedTimeSlot, CustomerInfo, PetResponse } from "@/types/schedule"
import { useRouter } from "next/navigation"

type RecurringConfig = {
  selectedDays: string[]
  endDate: string
  totalAppointments: number
}

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
  isDirectBooking: boolean
}

export function CustomerForm({
  selectedServices,
  selectedTimeSlot,
  professionalId,
  professionalName,
  sessionId,
  onPetsReceived,
  onBack,
  bookingType = "one-time",
  recurringConfig,
  isDirectBooking,
}: CustomerFormProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL
      if (!webhookUrl) {
        throw new Error("Webhook URL not configured")
      }

      const payload = {
        action: "get_customer_pets",
        customer_info: customerInfo,
        professional_id: professionalId,
        session_id: sessionId,
      }

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

      const data = await response.json()

      if (data.success) {
        onPetsReceived(customerInfo, data)
      } else {
        throw new Error(data.message || "Failed to retrieve customer pets")
      }
    } catch (error) {
      console.error("Error submitting customer form:", error)
      toast({
        title: "Error",
        description: "Failed to retrieve customer information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: string | number) => {
    return `$${Number.parseFloat(price.toString()).toFixed(0)}`
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

  // Calculate totals for all selected services
  const totalDuration = selectedServices.reduce((sum, service) => {
    let durationInMinutes = service.duration_number
    if (service.duration_unit === "Hours") {
      durationInMinutes = service.duration_number * 60
    } else if (service.duration_unit === "Days") {
      durationInMinutes = service.duration_number * 24 * 60
    }
    return sum + durationInMinutes
  }, 0)

  const totalCost = selectedServices.reduce((sum, service) => {
    return sum + Number.parseFloat(service.customer_cost.toString())
  }, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-gray-600 hover:text-gray-900 body-font hover:bg-gray-50 rounded-xl transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Time Selection
      </Button>

      {/* Booking Summary */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E75837] to-[#d14a2a]"></div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E75837] to-[#d14a2a] rounded-2xl flex items-center justify-center shadow-lg">
              {isDirectBooking ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <AlertCircle className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold header-font text-gray-900">
                {isDirectBooking ? "Booking Summary" : "Booking Request Summary"}
              </h2>
              <p className="text-gray-600 body-font">
                {isDirectBooking ? "Review your appointment details" : "Your request will be sent for approval"}
              </p>
            </div>
          </div>

          {!isDirectBooking && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 body-font mb-1">Approval Required</p>
                  <p className="text-sm text-blue-800 body-font">
                    This will be submitted as a booking request that requires approval from {professionalName}.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 body-font">Professional</span>
                <p className="font-semibold body-font text-gray-900">{professionalName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 body-font">Date</span>
                <p className="font-semibold body-font text-gray-900">
                  {selectedTimeSlot.dayOfWeek}, {(() => {
                    const [year, month, day] = selectedTimeSlot.date.split("-").map(Number)
                    const date = new Date(year, month - 1, day)
                    return date.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  })()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 body-font">Time</span>
                <p className="font-semibold body-font text-gray-900">
                  {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 body-font">Total Cost</span>
                <p className="font-semibold body-font text-gray-900">${totalCost.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Recurring Booking Info */}
          {bookingType === "recurring" && recurringConfig && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Repeat className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 body-font mb-1">Recurring Appointment</p>
                  <p className="text-sm text-blue-800 body-font">
                    This appointment will repeat weekly on {recurringConfig.selectedDays.join(", ")} until{" "}
                    {new Date(recurringConfig.endDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    . Total appointments: {recurringConfig.totalAppointments}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Services List */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="font-semibold text-gray-900 body-font mb-4">Selected Services</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedServices.map((service, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <p className="font-semibold text-gray-900 body-font">{service.name}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-600 body-font flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(service.duration_number, service.duration_unit)}
                    </span>
                    <span className="text-sm font-semibold text-[#E75837] body-font flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatPrice(service.customer_cost)}
                    </span>
                  </div>
                  {service.description && <p className="text-sm text-gray-600 body-font mt-2">{service.description}</p>}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 body-font">Total Duration:</span>
                <span className="font-semibold text-gray-900 body-font">
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold header-font text-gray-900">Customer Information</h3>
          </div>
          <p className="text-gray-600 body-font">
            Please provide your contact information to continue with the{" "}
            {isDirectBooking ? "booking" : "booking request"}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 body-font">
                First Name *
              </Label>
              <Input
                id="firstName"
                type="text"
                value={customerInfo.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
                className="rounded-xl border-gray-200 focus:border-[#E75837] focus:ring-[#E75837] body-font"
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 body-font">
                Last Name *
              </Label>
              <Input
                id="lastName"
                type="text"
                value={customerInfo.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
                className="rounded-xl border-gray-200 focus:border-[#E75837] focus:ring-[#E75837] body-font"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 body-font">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="rounded-xl border-gray-200 focus:border-[#E75837] focus:ring-[#E75837] body-font"
                placeholder="Enter your email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 body-font">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="rounded-xl border-gray-200 focus:border-[#E75837] focus:ring-[#E75837] body-font"
                placeholder="Enter your phone number (optional)"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#E75837] to-[#d14a2a] hover:from-[#d14a2a] hover:to-[#c13e26] text-white body-font py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Retrieving Customer Information...
                </div>
              ) : (
                "Continue to Pet Selection"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

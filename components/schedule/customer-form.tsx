"use client"

import type React from "react"
import { useState } from "react"
import { User, Calendar, Clock, DollarSign, ArrowLeft, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import type { Service, SelectedTimeSlot, CustomerInfo, PetResponse } from "@/types/schedule"
import { useRouter } from "next/navigation"

type RecurringConfig = {
  frequency: number
  unit: "day" | "week" | "month"
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
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  selectedServices,
  selectedTimeSlot,
  professionalId,
  professionalName,
  sessionId,
  onPetsReceived,
  onBack,
  bookingType,
  recurringConfig,
}) => {
  const { toast } = useToast()
  const router = useRouter()

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const detectUserTimezone = () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const now = new Date()
      const offsetMinutes = now.getTimezoneOffset()
      const offsetHours = Math.abs(offsetMinutes / 60)
      const offsetSign = offsetMinutes <= 0 ? "+" : "-"
      const offsetString = `UTC${offsetSign}${offsetHours.toString().padStart(2, "0")}:${Math.abs(offsetMinutes % 60)
        .toString()
        .padStart(2, "0")}`

      return {
        timezone: timezone,
        offset: offsetString,
        offsetMinutes: offsetMinutes,
        timestamp: now.toISOString(),
        localTime: now.toLocaleString(),
      }
    } catch (error) {
      console.error("Error detecting timezone:", error)
      return {
        timezone: "UTC",
        offset: "UTC+00:00",
        offsetMinutes: 0,
        timestamp: new Date().toISOString(),
        localTime: new Date().toLocaleString(),
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
      setError("Please fill in all required fields.")
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
        user_timezone: detectUserTimezone(),
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

      onPetsReceived(customerInfo, result[0] || result)
    } catch (err) {
      console.error("Error fetching pets:", err)
      setError("Failed to retrieve pet information. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0)
  const totalCost = selectedServices.reduce((sum, service) => sum + service.customer_cost, 0)

  return (
    <div className="flex flex-col max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="self-start mb-4">
        <ArrowLeft className="mr-2 w-4 h-4" />
        Back
      </Button>

      <h2 className="text-2xl font-semibold mb-6 header-font">Booking Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm body-font">{professionalName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm body-font">
            {selectedTimeSlot.dayOfWeek},{" "}
            {new Date(selectedTimeSlot.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm body-font">
            {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
          </span>
        </div>

        {selectedServices.map((service) => (
          <div key={service.id} className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-sm body-font">
              {service.name}: ${service.customer_cost} ({service.duration} mins)
            </span>
          </div>
        ))}

        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <span className="text-sm body-font">Total Cost: ${totalCost}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm body-font">Total Duration: {totalDuration} minutes</span>
        </div>
      </div>

      {/* Add this after the service details grid and before the form */}
      {bookingType === "recurring" && recurringConfig && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3 header-font flex items-center gap-2">
            <Repeat className="w-4 h-4" />
            Recurring Booking Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700 body-font">Frequency:</span>
              <span className="font-medium text-blue-900 body-font">
                Every {recurringConfig.frequency} {recurringConfig.unit.toLowerCase()}
                {recurringConfig.frequency > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700 body-font">End Date:</span>
              <span className="font-medium text-blue-900 body-font">
                {new Date(recurringConfig.endDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            type="text"
            id="firstName"
            placeholder="John"
            required
            value={customerInfo.firstName}
            onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            type="text"
            id="lastName"
            placeholder="Doe"
            required
            value={customerInfo.lastName}
            onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            placeholder="john.doe@example.com"
            required
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Confirm Booking"}
        </Button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  )
}

export { CustomerForm }
export default CustomerForm

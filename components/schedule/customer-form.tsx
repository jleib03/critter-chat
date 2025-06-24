"use client"

import type React from "react"
import { useState } from "react"
import { User, Calendar, Clock, DollarSign, ArrowLeft, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createCustomer } from "@/lib/actions/customer.actions"
import { createPet } from "@/lib/actions/pet.actions"
import type { Service, SelectedTimeSlot } from "@/lib/types"
import { useRouter } from "next/navigation"

type CustomerInfo = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  notes: string
}

type PetResponse = {
  petId: string
}

type RecurringConfig = {
  frequency: number
  unit: "day" | "week" | "month"
  endDate: string
  totalAppointments: number
}

type CustomerFormProps = {
  selectedService: Service
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
  selectedService,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone) {
      toast({
        title: "Error",
        description: "Please fill out all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const customerResponse = await createCustomer({
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        state: customerInfo.state,
        zip: customerInfo.zip,
        notes: customerInfo.notes,
      })

      if (customerResponse && customerResponse.id) {
        const petResponse = await createPet({
          name: `${customerInfo.firstName}'s Pet`,
          customerId: customerResponse.id,
          animal: "Unknown",
          breed: "Unknown",
        })

        if (petResponse && petResponse.id) {
          onPetsReceived(customerInfo, { petId: petResponse.id })
          toast({
            title: "Success",
            description: "Customer and pet created successfully!",
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to create pet.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to create customer.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error creating customer and pet:", error)
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      })
    }
  }

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
            {new Date(selectedTimeSlot.startTime).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm body-font">
            {new Date(selectedTimeSlot.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} -{" "}
            {new Date(selectedTimeSlot.endTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <span className="text-sm body-font">Service Cost: ${selectedService.customer_cost}</span>
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
            <div className="flex justify-between md:col-span-2">
              <span className="text-blue-700 body-font">Total Appointments:</span>
              <span className="font-medium text-blue-900 body-font">
                {recurringConfig.totalAppointments} appointments
              </span>
            </div>
            <div className="flex justify-between md:col-span-2">
              <span className="text-blue-700 body-font">Total Cost:</span>
              <span className="font-medium text-blue-900 body-font text-lg">
                ${(Number.parseFloat(selectedService.customer_cost) * recurringConfig.totalAppointments).toFixed(0)}
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
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            type="tel"
            id="phone"
            placeholder="123-456-7890"
            required
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            type="text"
            id="address"
            placeholder="123 Main St"
            value={customerInfo.address}
            onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              type="text"
              id="city"
              placeholder="Anytown"
              value={customerInfo.city}
              onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              type="text"
              id="state"
              placeholder="CA"
              value={customerInfo.state}
              onChange={(e) => setCustomerInfo({ ...customerInfo, state: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="zip">Zip Code</Label>
            <Input
              type="text"
              id="zip"
              placeholder="12345"
              value={customerInfo.zip}
              onChange={(e) => setCustomerInfo({ ...customerInfo, zip: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any special requests?"
            value={customerInfo.notes}
            onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
          />
        </div>

        <Button type="submit">Confirm Booking</Button>
      </form>
    </div>
  )
}

export default CustomerForm

"use client"

import type React from "react"
import { useState } from "react"
import type { Service, SelectedTimeSlot, PetResponse, BookingType, RecurringConfig } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

type CustomerInfo = {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
}

type CustomerFormProps = {
  selectedService: Service
  selectedTimeSlot: SelectedTimeSlot
  professionalId: string
  professionalName: string
  sessionId: string
  onPetsReceived: (customerInfo: CustomerInfo, petResponse: PetResponse) => void
  onBack: () => void
  bookingType?: BookingType
  recurringConfig?: RecurringConfig
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
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName || !lastName || !email || !phone) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      })
      return
    }

    const customerInfo: CustomerInfo = {
      firstName,
      lastName,
      email,
      phone,
      notes,
    }

    // Mock pet response data
    const petResponse: PetResponse = {
      pets: [
        {
          id: "pet-1",
          name: "Buddy",
          breed: "Golden Retriever",
        },
      ],
    }

    onPetsReceived(customerInfo, petResponse)
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/2">
        <h2 className="text-2xl font-semibold mb-4 header-font">Customer Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={onBack}>
              Back
            </Button>
            <Button type="submit">Next: Confirm</Button>
          </div>
        </form>
      </div>

      <div className="md:w-1/2">
        <h2 className="text-2xl font-semibold mb-4 header-font">Booking Summary</h2>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2 header-font">{selectedService.name}</h3>
          <p className="text-sm text-gray-800 body-font">{selectedService.description}</p>
          {bookingType === "recurring" && recurringConfig && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 header-font">Recurring Schedule</h4>
              <div className="space-y-1 text-sm text-blue-800 body-font">
                <p>
                  Frequency: Every {recurringConfig.frequency} {recurringConfig.unit.toLowerCase()}
                  {recurringConfig.frequency > 1 ? "s" : ""}
                </p>
                <p>
                  End Date:{" "}
                  {new Date(recurringConfig.endDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-blue-600">
                  This will create multiple recurring appointments at the same time each{" "}
                  {recurringConfig.unit.toLowerCase()}
                </p>
              </div>
            </div>
          )}
          <div className="mt-4">
            <p className="text-sm text-gray-600 body-font">
              Date: {new Date(selectedTimeSlot.startTime).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600 body-font">
              Time:{" "}
              {new Date(selectedTimeSlot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
              {new Date(selectedTimeSlot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-sm text-gray-600 body-font">Professional: {professionalName}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerForm

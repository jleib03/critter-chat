"use client"

import type React from "react"
import { useState } from "react"

interface Service {
  id: string
  name: string
  duration_number: number
  duration_unit: "Minutes" | "Hours" | "Days"
  customer_cost: number
}

interface SelectedTimeSlot {
  start: Date
  end: Date
}

interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes?: string
}

interface PetResponse {
  petName: string
  petType: string
  petBreed: string
}

type BookingType = "single" | "recurring"

interface RecurringConfig {
  frequency: "weekly" | "monthly"
  interval: number
  endDate: Date
}

interface CustomerFormProps {
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  professionalId: string
  professionalName: string
  sessionId: string
  onPetsReceived: (customerInfo: CustomerInfo, petResponse: PetResponse) => void
  onBack: () => void
  bookingType?: BookingType | null
  recurringConfig?: RecurringConfig | null
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
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  })

  const [petInfo, setPetInfo] = useState<PetResponse>({
    petName: "",
    petType: "",
    petBreed: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCustomerInfo({ ...customerInfo, [name]: value })
  }

  const handlePetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPetInfo({ ...petInfo, [name]: value })
  }

  const handleSubmit = () => {
    onPetsReceived(customerInfo, petInfo)
  }

  // Calculate total duration and cost for all selected services
  const totalDuration = selectedServices.reduce((total, service) => {
    let durationInMinutes = service.duration_number
    if (service.duration_unit === "Hours") {
      durationInMinutes = service.duration_number * 60
    } else if (service.duration_unit === "Days") {
      durationInMinutes = service.duration_number * 24 * 60
    }
    return total + durationInMinutes
  }, 0)

  const totalCost = selectedServices.reduce((total, service) => {
    return total + Number.parseFloat(service.customer_cost.toString())
  }, 0)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Customer Information</h1>

      <div className="mb-4">
        <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
          First Name:
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={customerInfo.firstName}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
          Last Name:
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={customerInfo.lastName}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
          Email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={customerInfo.email}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
          Phone:
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={customerInfo.phone}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">
          Notes:
        </label>
        <textarea
          id="notes"
          name="notes"
          value={customerInfo.notes || ""}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-4">Pet Information</h2>

      <div className="mb-4">
        <label htmlFor="petName" className="block text-gray-700 text-sm font-bold mb-2">
          Pet Name:
        </label>
        <input
          type="text"
          id="petName"
          name="petName"
          value={petInfo.petName}
          onChange={handlePetInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="petType" className="block text-gray-700 text-sm font-bold mb-2">
          Pet Type:
        </label>
        <input
          type="text"
          id="petType"
          name="petType"
          value={petInfo.petType}
          onChange={handlePetInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="petBreed" className="block text-gray-700 text-sm font-bold mb-2">
          Pet Breed:
        </label>
        <input
          type="text"
          id="petBreed"
          name="petBreed"
          value={petInfo.petBreed}
          onChange={handlePetInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-4">Booking Summary</h2>

      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <span className="text-gray-600 body-font">Services:</span>
          <div className="text-right">
            {selectedServices.map((service, index) => (
              <div key={index} className="font-medium body-font">
                {service.name}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 body-font">Total Duration:</span>
          <span className="font-medium body-font">
            {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 body-font">Total Cost:</span>
          <span className="font-medium body-font">${totalCost.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </div>
    </div>
  )
}

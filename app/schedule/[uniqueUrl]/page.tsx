"use client"

import type React from "react"
import { useState } from "react"
import type { Pet, Service, TimeSlot, CustomerInfo } from "@/types"
import PetSelection from "@/components/PetSelection"
import BookingConfirmation from "@/components/BookingConfirmation"

interface Props {
  uniqueUrl: string
}

const SchedulePage: React.FC<Props> = ({ uniqueUrl }) => {
  const [step, setStep] = useState<number>(1)
  const [professional, setProfessional] = useState<any | null>(null)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [selectedPets, setSelectedPets] = useState<Pet[]>([])
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [bookingType, setBookingType] = useState<string>("one-time")
  const [recurringConfig, setRecurringConfig] = useState<any | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  const handlePetSelection = (selected: Pet[]) => {
    setSelectedPets(selected)
  }

  const handleServiceSelection = (selected: Service[]) => {
    setSelectedServices(selected)
  }

  const handleTimeSlotSelection = (selected: TimeSlot) => {
    setSelectedTimeSlot(selected)
  }

  const handleBookingSubmit = async () => {
    if (
      !professional ||
      !customerInfo ||
      selectedPets.length === 0 ||
      !selectedTimeSlot ||
      selectedServices.length === 0
    ) {
      alert("Please fill in all required fields.")
      return
    }

    const payload = {
      action: "create_booking",
      customer: customerInfo,
      pets: selectedPets, // Changed from pet: selectedPet
      services: selectedServices,
      timeSlot: selectedTimeSlot,
      bookingType,
      recurringConfig: bookingType === "recurring" ? recurringConfig : undefined,
    }

    // Assuming there is a function to send the booking data
    await sendBookingData(payload)

    alert("Booking created successfully!")
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            {/* Step 1 components */}
            <button onClick={() => setStep(2)}>Next</button>
          </div>
        )
      case 2:
        return (
          <div>
            <PetSelection
              pets={pets}
              selectedPets={selectedPets}
              onSelectedPetsChange={handlePetSelection}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          </div>
        )
      case 3:
        return (
          <div>
            <BookingConfirmation
              professionalName={professional.name}
              customerInfo={customerInfo!}
              selectedPets={selectedPets}
              selectedServices={selectedServices}
              selectedTimeSlot={selectedTimeSlot}
              bookingType={bookingType}
              recurringConfig={recurringConfig}
              onNewBooking={() => {
                setSelectedPets([])
                setStep(1)
              }}
              onSubmit={handleBookingSubmit}
            />
          </div>
        )
      default:
        return <div>Invalid step</div>
    }
  }

  return <div>{renderStep()}</div>
}

export default SchedulePage

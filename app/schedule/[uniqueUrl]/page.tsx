import React, { useState } from 'react';
import { Pet, Service, Customer } from '@/types';
import PetSelection from '@/components/PetSelection';
import BookingConfirmation from '@/components/BookingConfirmation';

interface SchedulePageProps {
  uniqueUrl: string;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ uniqueUrl }) => {
  const [selectedPets, setSelectedPets] = useState<Pet[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [professionalConfig, setProfessionalConfig] = useState<any | null>(null);

  const handlePetToggle = (pet: Pet) => {
    setSelectedPets((prevSelectedPets) => {
      const isSelected = prevSelectedPets.some((p) => p.id === pet.id);
      if (isSelected) {
        return prevSelectedPets.filter((p) => p.id !== pet.id);
      } else {
        return [...prevSelectedPets, pet];
      }
    });
  };

  const isNextDisabled = () => {
    if (currentStep === 0 && !selectedService) return true;
    if (currentStep === 1 && !selectedDate) return true;
    if (currentStep === 2 && selectedPets.length === 0) return true;
    return false;
  };

  const handleBookingConfirmation = () => {
    // Logic to handle booking confirmation
  };

  const bookingDetails = {
    service: selectedService?.name || "",
    duration: selectedService?.duration || 0,
    date: selectedDate ? selectedDate.toLocaleDateString() : "",
    time: selectedTime || "",
    pet_info: selectedPets.map((pet) => ({
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      notes: pet.notes,
    })),
    customer_info: {
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
    },
  };

  return (
    <div>
      {/* Step 0: Service Selection */}
      {currentStep === 0 && (
        <div>
          {/* Service selection logic here */}
          <button onClick={() => setCurrentStep(currentStep + 1)} disabled={isNextDisabled()}>
            Next
          </button>
        </div>
      )}

      {/* Step 1: Date and Time Selection */}
      {currentStep === 1 && (
        <div>
          {/* Date and time selection logic here */}
          <button onClick={() => setCurrentStep(currentStep + 1)} disabled={isNextDisabled()}>
            Next
          </button>
          <button onClick={() => setCurrentStep(currentStep - 1)}>Back</button>
        </div>
      )}

      {/* Step 2: Pet Selection */}
      {currentStep === 2 && (
        <div>
          <PetSelection
            pets={customer?.pets || []}
            selectedPets={selectedPets}
            onPetToggle={handlePetToggle}
            onAddNewPet={() => console.log("Add new pet")}
          />
          <button onClick={() => setCurrentStep(currentStep + 1)} disabled={isNextDisabled()}>
            Next
          </button>
          <button onClick={() => setCurrentStep(currentStep - 1)}>Back</button>
        </div>
      )}

      {/* Step 3: Booking Confirmation */}
      {currentStep === 3 && (
        <div>
          <BookingConfirmation
            bookingDetails={bookingDetails}
            onConfirm={handleBookingConfirmation}
            onBack={() => setCurrentStep(currentStep - 1)}
            professionalName={professionalConfig?.business_name || "the professional"}
          />
        </div>
      )}
    </div>
  );
};

export default SchedulePage;

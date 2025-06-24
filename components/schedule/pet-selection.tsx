"use client"

import type { Pet } from "@/types/pet"
import type { CustomerInfo } from "@/types/customer-info"
import type { SelectedTimeSlot } from "@/types/time-slot"
import type { Service } from "@/types/service"

interface PetSelectionProps {
  pets: Pet[]
  customerInfo: CustomerInfo
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  professionalName: string
  onPetSelect: (pet: Pet) => void
  onBack: () => void
}

export function PetSelection({
  pets,
  customerInfo,
  selectedServices,
  selectedTimeSlot,
  professionalName,
  onPetSelect,
  onBack,
}: PetSelectionProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4">
        <h2 className="text-lg font-semibold mb-4">Select a Pet</h2>
        {pets.length === 0 ? (
          <p>No pets found. Please add a pet to continue.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => onPetSelect(pet)}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300 ease-in-out"
              >
                <h3 className="text-md font-semibold">{pet.name}</h3>
                <p className="text-sm text-gray-500">Type: {pet.type}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <h3 className="text-md font-semibold mb-2">Booking Summary</h3>
        <div className="space-y-3 text-sm">
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
            <span className="text-gray-600 body-font">Date:</span>
            <span className="font-medium body-font">{selectedTimeSlot.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 body-font">Time:</span>
            <span className="font-medium body-font">{selectedTimeSlot.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 body-font">Professional:</span>
            <span className="font-medium body-font">{professionalName}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition duration-300"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}

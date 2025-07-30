import type React from "react"
import type { Pet, Service } from "../../types"
import PawPrint from "../icons/PawPrint"
import CalendarIcon from "../icons/CalendarIcon"
import ClockIcon from "../icons/ClockIcon"
import LocationMarkerIcon from "../icons/LocationMarkerIcon"

interface BookingConfirmationProps {
  selectedPets: Pet[]
  selectedServices: Service[]
  bookingDate: string
  bookingTime: string
  location: string
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  selectedPets,
  selectedServices,
  bookingDate,
  bookingTime,
  location,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Booking Confirmation</h2>
      <div className="flex items-start gap-3">
        <PawPrint className="w-5 h-5 text-gray-500 mt-1" />
        <div>
          <p className="text-sm text-gray-600 body-font">Pet(s)</p>
          <p className="font-medium body-font">{selectedPets.map((pet) => pet.pet_name).join(", ")}</p>
        </div>
      </div>
      <div className="flex items-start gap-3 mt-4">
        <CalendarIcon className="w-5 h-5 text-gray-500 mt-1" />
        <div>
          <p className="text-sm text-gray-600 body-font">Date</p>
          <p className="font-medium body-font">{bookingDate}</p>
        </div>
      </div>
      <div className="flex items-start gap-3 mt-4">
        <ClockIcon className="w-5 h-5 text-gray-500 mt-1" />
        <div>
          <p className="text-sm text-gray-600 body-font">Time</p>
          <p className="font-medium body-font">{bookingTime}</p>
        </div>
      </div>
      <div className="flex items-start gap-3 mt-4">
        <LocationMarkerIcon className="w-5 h-5 text-gray-500 mt-1" />
        <div>
          <p className="text-sm text-gray-600 body-font">Location</p>
          <p className="font-medium body-font">{location}</p>
        </div>
      </div>
      <div className="flex items-start gap-3 mt-4">
        <PawPrint className="w-5 h-5 text-gray-500 mt-1" />
        <div>
          <p className="text-sm text-gray-600 body-font">Service(s)</p>
          <p className="font-medium body-font">{selectedServices.map((service) => service.service_name).join(", ")}</p>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation

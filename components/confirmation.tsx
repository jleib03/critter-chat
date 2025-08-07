"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { CheckCircle, ArrowLeft } from 'lucide-react'

// Helper to format date
const formatDate = (date: Date | string | undefined) => {
  if (!date) return "Not specified"
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Helper to format time
const formatTime = (time: string) => {
  if (!time) return "Not specified"
  const [hours, minutes] = time.split(":")
  const ampm = parseInt(hours) >= 12 ? "PM" : "AM"
  const formattedHours = parseInt(hours) % 12 || 12
  return `${formattedHours}:${minutes} ${ampm}`
}

export default function Confirmation({
  onSubmit,
  onCancel,
  onBack,
  formData,
  serviceData,
  schedulingData,
  title,
  message,
  buttonText,
  onButtonClick,
}) {
  const selectedServices = serviceData?.services?.filter((s) => s.selected) || []

  // Generic confirmation for password reset, etc.
  if (title && message) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="items-center">
          <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
          <CardTitle className="text-2xl header-font">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 body-font text-center">{message}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={onButtonClick} className="w-full bg-[#E75837] hover:bg-[#d04e30] text-white">
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Detailed confirmation for new customer intake
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl header-font text-center">Confirm Your Request</CardTitle>
        <p className="text-gray-600 body-font text-center">
          Please review the details below before submitting your request.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Info */}
        {formData && (
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold header-font mb-2">Your Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm body-font">
              <p>
                <strong>Name:</strong> {formData.firstName} {formData.lastName}
              </p>
              <p>
                <strong>Email:</strong> {formData.email}
              </p>
              {formData.phone && (
                <p>
                  <strong>Phone:</strong> {formData.phone}
                </p>
              )}
              {formData.address && (
                <p className="sm:col-span-2">
                  <strong>Address:</strong> {formData.address}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pet Information */}
        {formData && formData.pets && formData.pets.length > 0 && (
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold header-font mb-2">Pet Information</h3>
            <div className="space-y-3">
              {formData.pets.map((pet, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm body-font">
                    <p>
                      <strong>Name:</strong> {pet.name}
                    </p>
                    <p>
                      <strong>Type:</strong> {pet.type}
                    </p>
                    {pet.breed && (
                      <p>
                        <strong>Breed:</strong> {pet.breed}
                      </p>
                    )}
                    {pet.age && (
                      <p>
                        <strong>Age:</strong> {pet.age}
                      </p>
                    )}
                    {pet.weight && (
                      <p>
                        <strong>Weight:</strong> {pet.weight}
                      </p>
                    )}
                    {pet.specialNotes && (
                      <p className="sm:col-span-2">
                        <strong>Special Notes:</strong> {pet.specialNotes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Info */}
        {selectedServices.length > 0 && (
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold header-font mb-2">Selected Services</h3>
            <ul className="list-disc list-inside space-y-1 text-sm body-font">
              {selectedServices.map((service) => (
                <li key={service.id}>
                  {service.name} ({service.duration}, {service.price})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Scheduling Info */}
        {schedulingData && (
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold header-font mb-2">Requested Schedule</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm body-font">
              <p>
                <strong>Booking Type:</strong>{" "}
                <span className="capitalize">{schedulingData.bookingType.replace("-", " ")}</span>
              </p>
              <p>
                <strong>Preferred Date:</strong> {formatDate(schedulingData.date)}
              </p>
              <p>
                <strong>Preferred Time:</strong> {formatTime(schedulingData.time)}
              </p>
              {schedulingData.bookingType === "recurring" && (
                <>
                  <p>
                    <strong>Recurring Days:</strong> {schedulingData.recurringDays?.join(", ") || "Not specified"}
                  </p>
                  <p>
                    <strong>Recurring End Date:</strong> {formatDate(schedulingData.recurringEndDate)}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onSubmit} className="bg-[#E75837] hover:bg-[#d04e30] text-white">
          <CheckCircle className="w-4 h-4 mr-2" />
          Submit Request
        </Button>
      </CardFooter>
    </Card>
  )
}

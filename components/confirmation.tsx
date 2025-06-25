"use client"
import { useState } from "react"
import { Check, ArrowLeft } from "lucide-react"

type ConfirmationProps = {
  onSubmit: (data: any) => void
  onCancel: () => void
  onBack?: () => void
  formData: any
  serviceData?: any
}

export default function Confirmation({ onSubmit, onCancel, onBack, formData, serviceData }: ConfirmationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        confirmed: true,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error submitting confirmation:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateTime = (date: string, time: string, timezone: string) => {
    if (!date || !time) return "Not specified"

    const formattedTime = time.split(":").map(Number)
    const hours = formattedTime[0]
    const minutes = formattedTime[1]
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    const timeString = `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`

    const displayTimezone = timezone.replace(/_/g, " ")

    return `${date} at ${timeString} (${displayTimezone})`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#E75837] mb-2 header-font">Review Your Onboarding Request</h2>
        <p className="text-gray-600 body-font">
          Please review all information below before submitting your onboarding and booking request.
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3 header-font">Personal Information</h3>
          {formData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 body-font">Name:</span>
                <p className="font-medium header-font">
                  {formData.firstName} {formData.lastName}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 body-font">Email:</span>
                <p className="font-medium header-font">{formData.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 body-font">Phone:</span>
                <p className="font-medium header-font">{formData.phone}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 body-font">Address:</span>
                <p className="font-medium header-font">
                  {formData.address}, {formData.city}, {formData.state} {formData.zipCode}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pet Information */}
        {formData?.pets && formData.pets.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3 header-font">Pet Information</h3>
            <div className="space-y-3">
              {formData.pets.map((pet: any, index: number) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <h4 className="font-medium header-font mb-2">{pet.name}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 body-font">Type:</span>
                      <p className="body-font">{pet.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 body-font">Breed:</span>
                      <p className="body-font">{pet.breed}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 body-font">Age:</span>
                      <p className="body-font">{pet.age}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 body-font">Spayed/Neutered:</span>
                      <p className="body-font">{pet.isSpayedOrNeutered ? "Yes" : "No"}</p>
                    </div>
                  </div>
                  {pet.notes && (
                    <div className="mt-2">
                      <span className="text-gray-500 body-font text-sm">Notes:</span>
                      <p className="body-font text-sm">{pet.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Selection */}
        {serviceData && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3 header-font">Selected Services</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500 body-font">Services:</span>
                <p className="font-medium header-font">{serviceData.services?.join(", ") || "None selected"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 body-font">Date & Time:</span>
                <p className="font-medium header-font">
                  {formatDateTime(serviceData.date, serviceData.time, serviceData.timezone)}
                </p>
              </div>
              {serviceData.isRecurring && (
                <div>
                  <span className="text-sm text-gray-500 body-font">Recurring:</span>
                  <p className="font-medium header-font">
                    {serviceData.recurringFrequency} until {serviceData.recurringEndDate}
                  </p>
                </div>
              )}
              {serviceData.isMultiDay && (
                <div>
                  <span className="text-sm text-gray-500 body-font">Multi-day until:</span>
                  <p className="font-medium header-font">{serviceData.endDate}</p>
                </div>
              )}
              {serviceData.notes && (
                <div>
                  <span className="text-sm text-gray-500 body-font">Notes:</span>
                  <p className="font-medium header-font">{serviceData.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors body-font"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors body-font"
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </button>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-[#E75837] text-white rounded-lg hover:bg-[#d04e30] transition-colors body-font flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            "Submit Onboarding & Booking Request"
          )}
        </button>
      </div>
    </div>
  )
}

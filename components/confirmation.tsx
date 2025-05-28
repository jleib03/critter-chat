"use client"
import { useState } from "react"
import { Check } from "lucide-react"

type ConfirmationProps = {
  onSubmit: (data: any) => void
  onCancel: () => void
  formData: any
}

export default function Confirmation({ onSubmit, onCancel, formData }: ConfirmationProps) {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2 header-font">Review Your Information</h2>
        <p className="text-gray-600 body-font">
          Please review the information below before submitting your onboarding request.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium mb-3 header-font">Your Information</h3>

        {formData && (
          <div className="space-y-2">
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

            {formData.pets && formData.pets.length > 0 && (
              <div>
                <span className="text-sm text-gray-500 body-font">Pets:</span>
                <ul className="list-disc list-inside mt-1">
                  {formData.pets.map((pet: any, index: number) => (
                    <li key={index} className="font-medium header-font">
                      {pet.name} ({pet.type}, {pet.breed}, {pet.age})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors body-font"
          disabled={isSubmitting}
        >
          Cancel
        </button>

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
            "Submit Onboarding Request"
          )}
        </button>
      </div>
    </div>
  )
}

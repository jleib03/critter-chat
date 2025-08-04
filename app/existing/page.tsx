"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, User, ArrowLeft } from "lucide-react"

type UserInfo = {
  email: string
  firstName: string
  lastName: string
}

export default function ExistingCustomerPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<UserInfo>({
    email: "",
    firstName: "",
    lastName: "",
  })
  const [formErrors, setFormErrors] = useState<{
    email?: string
    firstName?: string
    lastName?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Function to validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Function to validate form
  const validateForm = () => {
    const errors: typeof formErrors = {}

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!isValidEmail(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Function to handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field when user types
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Function to handle form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For now, just redirect to a placeholder page
      // In the future, this would integrate with the actual booking system
      alert("Feature coming soon! This will connect you to your existing bookings and services.")
      router.push("/")
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#fff8f6] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-[#E75837]" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 header-font mb-2">Welcome back!</h1>
              <p className="text-gray-600 body-font">Enter your information to access your bookings and services.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 body-font mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="your.email@example.com"
                />
                {formErrors.email && <p className="mt-1 text-sm text-red-500 body-font">{formErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 body-font mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font ${
                    formErrors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="John"
                />
                {formErrors.firstName && <p className="mt-1 text-sm text-red-500 body-font">{formErrors.firstName}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 body-font mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font ${
                    formErrors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Doe"
                />
                {formErrors.lastName && <p className="mt-1 text-sm text-red-500 body-font">{formErrors.lastName}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#E75837] text-white py-3 px-4 rounded-lg hover:bg-[#d04e30] transition-colors body-font font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Continue to Booking"
                )}
              </button>
            </form>

            {/* Back Link */}
            <div className="mt-6 text-center">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 body-font transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

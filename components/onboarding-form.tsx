"use client"
import { useState } from "react"
import { PlusCircle, MinusCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import type { OnboardingFormData, PetFormData } from "../types/booking"

type UserInfo = {
  email: string
  firstName: string
  lastName: string
}

type OnboardingFormProps = {
  onSubmit: (data: OnboardingFormData) => void
  onCancel: () => void
  skipProfessionalStep?: boolean
  professionalId?: string
  userInfo?: UserInfo | null
}

export default function OnboardingForm({
  onSubmit,
  onCancel,
  skipProfessionalStep = false,
  professionalId,
  userInfo,
}: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(skipProfessionalStep ? 2 : 1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<{
    professionalName?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    pets?: { [key: number]: { name?: string; type?: string; breed?: string; age?: string } }
  }>({})

  const [formData, setFormData] = useState<OnboardingFormData>({
    professionalName: "",
    firstName: userInfo?.firstName || "",
    lastName: userInfo?.lastName || "",
    email: userInfo?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    pets: [
      {
        name: "",
        type: "",
        breed: "",
        age: "",
        isSpayedOrNeutered: false,
        notes: "",
      },
    ],
  })

  const updateFormData = (field: keyof Omit<OnboardingFormData, "pets">, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for this field when user types
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const updatePetData = (index: number, field: keyof PetFormData, value: string | boolean) => {
    setFormData((prev) => {
      const updatedPets = [...prev.pets]
      updatedPets[index] = {
        ...updatedPets[index],
        [field]: value,
      }
      return {
        ...prev,
        pets: updatedPets,
      }
    })

    // Clear error for this pet field when user types
    if (
      formErrors.pets &&
      formErrors.pets[index] &&
      formErrors.pets[index][field as keyof (typeof formErrors.pets)[0]]
    ) {
      setFormErrors((prev) => ({
        ...prev,
        pets: {
          ...prev.pets,
          [index]: {
            ...prev.pets?.[index],
            [field]: undefined,
          },
        },
      }))
    }
  }

  const addPet = () => {
    setFormData((prev) => ({
      ...prev,
      pets: [
        ...prev.pets,
        {
          name: "",
          type: "",
          breed: "",
          age: "",
          isSpayedOrNeutered: false,
          notes: "",
        },
      ],
    }))
  }

  const removePet = (index: number) => {
    if (formData.pets.length <= 1) return
    setFormData((prev) => ({
      ...prev,
      pets: prev.pets.filter((_, i) => i !== index),
    }))
  }

  const nextStep = () => {
    const isValid = validateStep()
    if (isValid) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const prevStep = () => {
    if (currentStep > (skipProfessionalStep ? 2 : 1)) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateStep = () => {
    const errors: typeof formErrors = {}

    if (currentStep === 1 && !skipProfessionalStep) {
      if (!formData.professionalName.trim()) {
        errors.professionalName = "Professional name is required"
      }
    } else if (currentStep === 2) {
      if (!formData.firstName.trim()) errors.firstName = "First name is required"
      if (!formData.lastName.trim()) errors.lastName = "Last name is required"

      if (!formData.email.trim()) {
        errors.email = "Email is required"
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        errors.email = "Please enter a valid email address"
      }

      if (!formData.phone.trim()) {
        errors.phone = "Phone number is required"
      }

      if (!formData.address.trim()) errors.address = "Address is required"
      if (!formData.city.trim()) errors.city = "City is required"
      if (!formData.state.trim()) errors.state = "State is required"
      if (!formData.zipCode.trim()) errors.zipCode = "ZIP code is required"
    } else if (currentStep === 3) {
      const petErrors: { [key: number]: { name?: string; type?: string; breed?: string; age?: string } } = {}
      let hasPetErrors = false

      formData.pets.forEach((pet, index) => {
        const petError: { name?: string; type?: string; breed?: string; age?: string } = {}

        if (!pet.name.trim()) {
          petError.name = "Pet name is required"
          hasPetErrors = true
        }

        if (!pet.type) {
          petError.type = "Pet type is required"
          hasPetErrors = true
        }

        if (!pet.breed.trim()) {
          petError.breed = "Breed/species is required"
          hasPetErrors = true
        }

        if (!pet.age.trim()) {
          petError.age = "Age is required"
          hasPetErrors = true
        }

        if (Object.keys(petError).length > 0) {
          petErrors[index] = petError
        }
      })

      if (hasPetErrors) {
        errors.pets = petErrors
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#E75837] mb-2 header-font">
          {userInfo ? "Complete Your Profile" : "New Customer Onboarding"}
        </h2>
        <p className="text-gray-600 body-font">
          {userInfo
            ? "We have your basic information. Let's add a few more details to get you set up with your Critter professional."
            : "Please provide the following information to get started with your Critter professional."}
        </p>
        {professionalId && skipProfessionalStep && (
          <p className="text-sm text-gray-500 mt-2 body-font">Professional ID: {professionalId}</p>
        )}
      </div>

      {/* User Info Summary - Only show if we have user info */}
      {userInfo && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2 header-font">Your Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 body-font">Name:</span>
              <p className="font-medium header-font">
                {userInfo.firstName} {userInfo.lastName}
              </p>
            </div>
            <div>
              <span className="text-gray-500 body-font">Email:</span>
              <p className="font-medium header-font">{userInfo.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {!skipProfessionalStep && (
            <>
              <div
                className={`flex flex-col items-center ${
                  currentStep >= 1 ? "text-[#E75837]" : "text-gray-400"
                } transition-colors`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    currentStep >= 1 ? "bg-[#E75837] text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  1
                </div>
                <span className="text-xs">Professional</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? "bg-[#E75837]" : "bg-gray-200"}`}></div>
            </>
          )}
          <div
            className={`flex flex-col items-center ${
              currentStep >= 2 ? "text-[#E75837]" : "text-gray-400"
            } transition-colors`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                currentStep >= 2 ? "bg-[#E75837] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {skipProfessionalStep ? "1" : "2"}
            </div>
            <span className="text-xs">{userInfo ? "Contact Info" : "Your Info"}</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? "bg-[#E75837]" : "bg-gray-200"}`}></div>
          <div
            className={`flex flex-col items-center ${
              currentStep >= 3 ? "text-[#E75837]" : "text-gray-400"
            } transition-colors`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                currentStep >= 3 ? "bg-[#E75837] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {skipProfessionalStep ? "2" : "3"}
            </div>
            <span className="text-xs">Pet Info</span>
          </div>
        </div>
      </div>

      {/* Step 1: Professional Information */}
      {currentStep === 1 && !skipProfessionalStep && (
        <div className="space-y-4">
          <div>
            <label htmlFor="professionalName" className="block text-sm font-medium text-gray-700 mb-1 header-font">
              Critter Professional Name*
            </label>
            <input
              type="text"
              id="professionalName"
              value={formData.professionalName}
              onChange={(e) => updateFormData("professionalName", e.target.value)}
              className={`w-full p-3 border ${formErrors.professionalName ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font`}
              placeholder="Enter the name of your Critter professional"
              required
            />
            {formErrors.professionalName && (
              <p className="mt-1 text-xs text-red-500 body-font">{formErrors.professionalName}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 body-font">
              Please enter the full name of the pet professional you'd like to work with
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Personal Information */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {/* Only show name and email fields if we don't have user info */}
          {!userInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1 header-font">
                  First Name*
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  className={`w-full p-3 border ${formErrors.firstName ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font`}
                  placeholder="Your first name"
                  required
                />
                {formErrors.firstName && <p className="mt-1 text-xs text-red-500 body-font">{formErrors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1 header-font">
                  Last Name*
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  className={`w-full p-3 border ${formErrors.lastName ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font`}
                  placeholder="Your last name"
                  required
                />
                {formErrors.lastName && <p className="mt-1 text-xs text-red-500 body-font">{formErrors.lastName}</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!userInfo && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 header-font">
                  Email Address*
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  className={`w-full p-3 border ${formErrors.email ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font`}
                  placeholder="your.email@example.com"
                  required
                />
                {formErrors.email && <p className="mt-1 text-xs text-red-500 body-font">{formErrors.email}</p>}
              </div>
            )}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 header-font">
                Phone Number*
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                className={`w-full p-3 border ${formErrors.phone ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font`}
                placeholder="(123) 456-7890"
                required
              />
              {formErrors.phone && <p className="mt-1 text-xs text-red-500 body-font">{formErrors.phone}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 header-font">
              Street Address*
            </label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => updateFormData("address", e.target.value)}
              className={`w-full p-3 border ${formErrors.address ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font`}
              placeholder="123 Main St"
              required
            />
            {formErrors.address && <p className="mt-1 text-xs text-red-500 body-font">{formErrors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1 header-font">
                City*
              </label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => updateFormData("city", e.target.value)}
                className={`w-full p-3 border ${formErrors.city ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font`}
                placeholder="City"
                required
              />
              {formErrors.city && <p className="mt-1 text-xs text-red-500 body-font">{formErrors.city}</p>}
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1 header-font">
                State*
              </label>
              <input
                type="text"
                id="state"
                value={formData.state}
                onChange={(e) => updateFormData("state", e.target.value)}
                className={`w-full p-3 border ${formErrors.state ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font`}
                placeholder="State"
                required
              />
              {formErrors.state && <p className="mt-1 text-xs text-red-500 body-font">{formErrors.state}</p>}
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1 header-font">
                ZIP Code*
              </label>
              <input
                type="text"
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => updateFormData("zipCode", e.target.value)}
                className={`w-full p-3 border ${formErrors.zipCode ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font`}
                placeholder="12345"
                required
              />
              {formErrors.zipCode && <p className="mt-1 text-xs text-red-500 body-font">{formErrors.zipCode}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Pet Information */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {formData.pets.map((pet, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium header-font">Pet #{index + 1}</h3>
                {formData.pets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePet(index)}
                    className="text-red-500 hover:text-red-700 flex items-center"
                  >
                    <MinusCircle className="w-5 h-5 mr-1" />
                    <span className="text-sm">Remove</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor={`petName-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1 header-font"
                  >
                    Pet Name*
                  </label>
                  <input
                    type="text"
                    id={`petName-${index}`}
                    value={pet.name}
                    onChange={(e) => updatePetData(index, "name", e.target.value)}
                    className={`w-full p-3 border ${formErrors.pets?.[index]?.name ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font`}
                    placeholder="Pet's name"
                    required
                  />
                  {formErrors.pets?.[index]?.name && (
                    <p className="mt-1 text-xs text-red-500 body-font">{formErrors.pets[index].name}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor={`petType-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1 header-font"
                  >
                    Pet Type*
                  </label>
                  <select
                    id={`petType-${index}`}
                    value={pet.type}
                    onChange={(e) => updatePetData(index, "type", e.target.value)}
                    className={`w-full p-3 border ${formErrors.pets?.[index]?.type ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font`}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Fish">Fish</option>
                    <option value="Reptile">Reptile</option>
                    <option value="Small Animal">Small Animal</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.pets?.[index]?.type && (
                    <p className="mt-1 text-xs text-red-500 body-font">{formErrors.pets[index].type}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor={`petBreed-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1 header-font"
                  >
                    Breed/Variety*
                  </label>
                  <input
                    type="text"
                    id={`petBreed-${index}`}
                    value={pet.breed}
                    onChange={(e) => updatePetData(index, "breed", e.target.value)}
                    className={`w-full p-3 border ${formErrors.pets?.[index]?.breed ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font`}
                    placeholder="e.g., Labrador, Siamese"
                    required
                  />
                  {formErrors.pets?.[index]?.breed && (
                    <p className="mt-1 text-xs text-red-500 body-font">{formErrors.pets[index].breed}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor={`petAge-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1 header-font"
                  >
                    Age*
                  </label>
                  <input
                    type="text"
                    id={`petAge-${index}`}
                    value={pet.age}
                    onChange={(e) => updatePetData(index, "age", e.target.value)}
                    className={`w-full p-3 border ${formErrors.pets?.[index]?.age ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font`}
                    placeholder="e.g., 3 years"
                    required
                  />
                  {formErrors.pets?.[index]?.age && (
                    <p className="mt-1 text-xs text-red-500 body-font">{formErrors.pets[index].age}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <label className="flex items-center body-font">
                    <input
                      type="checkbox"
                      checked={pet.isSpayedOrNeutered}
                      onChange={(e) => updatePetData(index, "isSpayedOrNeutered", e.target.checked)}
                      className="mr-2 h-4 w-4 text-[#E75837] focus:ring-2 focus:ring-[#E75837] border-gray-300 rounded"
                    />
                    Spayed/Neutered
                  </label>
                </div>
              </div>

              <div>
                <label
                  htmlFor={`petNotes-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1 header-font"
                >
                  Important Notes
                </label>
                <textarea
                  id={`petNotes-${index}`}
                  value={pet.notes}
                  onChange={(e) => updatePetData(index, "notes", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
                  placeholder="Any important information your pet professional should know"
                  rows={3}
                ></textarea>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addPet}
            className="flex items-center text-[#E75837] hover:text-[#d04e30] transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-1" />
            <span>Add Another Pet</span>
          </button>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        {currentStep > (skipProfessionalStep ? 2 : 1) ? (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors body-font"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors body-font"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}

        <button
          type="button"
          onClick={nextStep}
          disabled={isSubmitting}
          className="flex items-center px-6 py-2 rounded-lg text-white transition-colors body-font bg-[#E75837] hover:bg-[#d04e30]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {currentStep < 3 ? "Processing..." : "Submitting..."}
            </>
          ) : currentStep < 3 ? (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </div>
  )
}

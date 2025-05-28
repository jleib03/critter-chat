"use client"

import type React from "react"
import { useState } from "react"

type OnboardingFormData = {
  professionalName: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  pets: {
    name: string
    type: string
    breed: string
    age: string
    isSpayedOrNeutered: boolean
    notes: string
  }[]
}

type OnboardingFormProps = {
  onSubmit: (data: OnboardingFormData) => void
  onCancel: () => void
  skipProfessionalStep?: boolean
  professionalId?: string
}

export default function OnboardingForm({
  onSubmit,
  onCancel,
  skipProfessionalStep = false,
  professionalId,
}: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(skipProfessionalStep ? 2 : 1)
  const [formData, setFormData] = useState<OnboardingFormData>({
    professionalName: "", // Keep blank even when professionalId is provided
    firstName: "",
    lastName: "",
    email: "",
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
  const [formErrors, setFormErrors] = useState<Partial<OnboardingFormData>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target
    if (name.startsWith("pets[")) {
      const petIndex = Number.parseInt(name.substring(5, name.indexOf("]")))
      const petField = name.substring(name.indexOf("]") + 2)
      setFormData((prevData) => {
        const newPets = [...prevData.pets]
        if (!newPets[petIndex]) {
          newPets[petIndex] = {
            name: "",
            type: "",
            breed: "",
            age: "",
            isSpayedOrNeutered: false,
            notes: "",
          }
        }
        if (petField === "isSpayedOrNeutered") {
          newPets[petIndex][petField] = checked as boolean
        } else {
          newPets[petIndex][petField] = value
        }
        return { ...prevData, pets: newPets }
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const addPet = () => {
    setFormData({
      ...formData,
      pets: [...formData.pets, { name: "", type: "", breed: "", age: "", isSpayedOrNeutered: false, notes: "" }],
    })
  }

  const removePet = (index: number) => {
    const newPets = [...formData.pets]
    newPets.splice(index, 1)
    setFormData({ ...formData, pets: newPets })
  }

  const validateStep = () => {
    const errors: typeof formErrors = {}

    if (currentStep === 1 && !skipProfessionalStep) {
      if (!formData.professionalName.trim()) {
        errors.professionalName = "Professional name is required"
      }
    } else if (currentStep === 2) {
      if (!formData.firstName.trim()) {
        errors.firstName = "First name is required"
      }
      if (!formData.lastName.trim()) {
        errors.lastName = "Last name is required"
      }
      if (!formData.email.trim()) {
        errors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Invalid email format"
      }
      if (!formData.phone.trim()) {
        errors.phone = "Phone is required"
      }
    } else if (currentStep === 3) {
      if (!formData.address.trim()) {
        errors.address = "Address is required"
      }
      if (!formData.city.trim()) {
        errors.city = "City is required"
      }
      if (!formData.state.trim()) {
        errors.state = "State is required"
      }
      if (!formData.zipCode.trim()) {
        errors.zipCode = "Zip code is required"
      } else if (!/^\d{5}(?:-\d{4})?$/.test(formData.zipCode)) {
        errors.zipCode = "Invalid zip code format"
      }
      if (formData.pets.length === 0) {
        errors.pets = "At least one pet is required"
      } else {
        formData.pets.forEach((pet, index) => {
          if (!pet.name.trim()) {
            if (!errors.pets) errors.pets = []
            if (!Array.isArray(errors.pets)) errors.pets = []
            errors.pets[index] = { ...errors.pets[index], name: "Pet name is required" }
          }
          if (!pet.type.trim()) {
            if (!errors.pets) errors.pets = []
            if (!Array.isArray(errors.pets)) errors.pets = []
            errors.pets[index] = { ...errors.pets[index], type: "Pet type is required" }
          }
          if (!pet.age.trim()) {
            if (!errors.pets) errors.pets = []
            if (!Array.isArray(errors.pets)) errors.pets = []
            errors.pets[index] = { ...errors.pets[index], age: "Pet age is required" }
          }
        })
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const maxStep = 3
  const minStep = skipProfessionalStep ? 2 : 1

  const prevStep = () => {
    if (currentStep > minStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    if (validateStep()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="container mx-auto mt-10">
      {professionalId && skipProfessionalStep && (
        <div className="mb-4">
          <p>Professional ID: {professionalId}</p>
        </div>
      )}
      <div className="mb-4">
        <p>
          Step {currentStep} of {maxStep}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-green-500 h-2.5 rounded-full"
            style={{
              width:
                currentStep === 1 && !skipProfessionalStep
                  ? "33.33%"
                  : currentStep === 2
                    ? skipProfessionalStep
                      ? "66.66%"
                      : "66.66%"
                    : "100%",
            }}
          ></div>
        </div>
      </div>

      {currentStep === 1 && !skipProfessionalStep && (
        <div className="mb-4">
          <label htmlFor="professionalName" className="block text-gray-700 text-sm font-bold mb-2">
            Professional Name:
          </label>
          <input
            type="text"
            id="professionalName"
            name="professionalName"
            value={formData.professionalName}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {formErrors.professionalName && <p className="text-red-500 text-xs italic">{formErrors.professionalName}</p>}
        </div>
      )}

      {currentStep === 2 && (
        <>
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
              First Name:
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.firstName && <p className="text-red-500 text-xs italic">{formErrors.firstName}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
              Last Name:
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.lastName && <p className="text-red-500 text-xs italic">{formErrors.lastName}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.email && <p className="text-red-500 text-xs italic">{formErrors.email}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
              Phone:
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.phone && <p className="text-red-500 text-xs italic">{formErrors.phone}</p>}
          </div>
        </>
      )}

      {currentStep === 3 && (
        <>
          <div className="mb-4">
            <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">
              Address:
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.address && <p className="text-red-500 text-xs italic">{formErrors.address}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">
              City:
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.city && <p className="text-red-500 text-xs italic">{formErrors.city}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="state" className="block text-gray-700 text-sm font-bold mb-2">
              State:
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.state && <p className="text-red-500 text-xs italic">{formErrors.state}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="zipCode" className="block text-gray-700 text-sm font-bold mb-2">
              Zip Code:
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {formErrors.zipCode && <p className="text-red-500 text-xs italic">{formErrors.zipCode}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Pets:</label>
            {formData.pets.map((pet, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <h4 className="text-md font-semibold mb-2">Pet #{index + 1}</h4>
                <div className="mb-2">
                  <label htmlFor={`pets[${index}].name`} className="block text-gray-700 text-sm font-bold mb-2">
                    Name:
                  </label>
                  <input
                    type="text"
                    id={`pets[${index}].name`}
                    name={`pets[${index}].name`}
                    value={pet.name}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                  {formErrors.pets &&
                    Array.isArray(formErrors.pets) &&
                    formErrors.pets[index] &&
                    formErrors.pets[index].name && (
                      <p className="text-red-500 text-xs italic">{formErrors.pets[index].name}</p>
                    )}
                </div>

                <div className="mb-2">
                  <label htmlFor={`pets[${index}].type`} className="block text-gray-700 text-sm font-bold mb-2">
                    Type:
                  </label>
                  <input
                    type="text"
                    id={`pets[${index}].type`}
                    name={`pets[${index}].type`}
                    value={pet.type}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                  {formErrors.pets &&
                    Array.isArray(formErrors.pets) &&
                    formErrors.pets[index] &&
                    formErrors.pets[index].type && (
                      <p className="text-red-500 text-xs italic">{formErrors.pets[index].type}</p>
                    )}
                </div>

                <div className="mb-2">
                  <label htmlFor={`pets[${index}].breed`} className="block text-gray-700 text-sm font-bold mb-2">
                    Breed:
                  </label>
                  <input
                    type="text"
                    id={`pets[${index}].breed`}
                    name={`pets[${index}].breed`}
                    value={pet.breed}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="mb-2">
                  <label htmlFor={`pets[${index}].age`} className="block text-gray-700 text-sm font-bold mb-2">
                    Age:
                  </label>
                  <input
                    type="text"
                    id={`pets[${index}].age`}
                    name={`pets[${index}].age`}
                    value={pet.age}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                  {formErrors.pets &&
                    Array.isArray(formErrors.pets) &&
                    formErrors.pets[index] &&
                    formErrors.pets[index].age && (
                      <p className="text-red-500 text-xs italic">{formErrors.pets[index].age}</p>
                    )}
                </div>

                <div className="mb-2">
                  <label
                    htmlFor={`pets[${index}].isSpayedOrNeutered`}
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Spayed/Neutered:
                  </label>
                  <input
                    type="checkbox"
                    id={`pets[${index}].isSpayedOrNeutered`}
                    name={`pets[${index}].isSpayedOrNeutered`}
                    checked={pet.isSpayedOrNeutered}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="mb-2">
                  <label htmlFor={`pets[${index}].notes`} className="block text-gray-700 text-sm font-bold mb-2">
                    Notes:
                  </label>
                  <textarea
                    id={`pets[${index}].notes`}
                    name={`pets[${index}].notes`}
                    value={pet.notes}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePet(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Remove Pet
                </button>
              </div>
            ))}
            {formErrors.pets && !Array.isArray(formErrors.pets) && (
              <p className="text-red-500 text-xs italic">At least one pet is required</p>
            )}
            <button
              type="button"
              onClick={addPet}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Pet
            </button>
          </div>
        </>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancel
        </button>
        {currentStep > minStep && (
          <button
            type="button"
            onClick={prevStep}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Previous
          </button>
        )}
        {currentStep < maxStep ? (
          <button
            type="button"
            onClick={nextStep}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  )
}

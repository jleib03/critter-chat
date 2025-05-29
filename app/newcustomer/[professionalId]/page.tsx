"use client"
import { useParams } from "next/navigation"

const NewCustomerPage = () => {
  const { professionalId } = useParams()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">New Customer Intake</h1>

      {/* Beige Box with Professional Name */}
      <div className="bg-beige p-4 rounded-md mb-4">
        <p className="text-gray-700">You're completing the intake process for:</p>
        <p className="text-lg font-semibold">Professional ID: {professionalId}</p>
      </div>

      {/* Rest of the form or intake process components will go here */}
      <div>
        {/* Example form fields */}
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
          First Name:
        </label>
        <input
          type="text"
          id="firstName"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />

        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mt-4">
          Last Name:
        </label>
        <input
          type="text"
          id="lastName"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
    </div>
  )
}

export default NewCustomerPage

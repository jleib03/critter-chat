"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface UserInfo {
  email: string
  firstName: string
  lastName: string
}

interface LandingPageProps {
  onNewCustomer?: () => void
  onExistingCustomer?: (userInfo: UserInfo) => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onNewCustomer, onExistingCustomer }) => {
  const [showUserForm, setShowUserForm] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
  })
  const [formErrors, setFormErrors] = useState({
    email: "",
    firstName: "",
    lastName: "",
  })

  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Function to handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error when input changes
    setFormErrors({
      ...formErrors,
      [name]: "",
    })
  }

  // Function to validate form
  const validateForm = () => {
    let isValid = true
    const newErrors = { ...formErrors }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is not valid"
      isValid = false
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
      isValid = false
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
      isValid = false
    }

    setFormErrors(newErrors)
    return isValid
  }

  // Function to handle action card click
  const handleActionCardClick = (action: "existing" | "new" | "find") => {
    if (!isClient) return

    if (action === "find") {
      router.push("/findprofessional")
      return
    }

    if (action === "new") {
      // For new customers, go directly to the URL without popup
      if (onNewCustomer) {
        onNewCustomer()
      } else {
        router.push("/newcustomer")
      }
      return
    }

    if (action === "existing") {
      // Only show the form popup for existing customers
      setShowUserForm(true)
    }
  }

  // Function to handle form submit (only for existing customers)
  const handleFormSubmit = () => {
    if (!validateForm()) {
      return
    }

    const userInfo: UserInfo = {
      email: formData.email.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
    }

    if (onExistingCustomer) {
      onExistingCustomer(userInfo)
    } else if (isClient) {
      router.push("/existing")
    }
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome!</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Action Card 1: Existing Customer */}
        <div
          className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow duration-300"
          onClick={() => handleActionCardClick("existing")}
        >
          <h2 className="text-xl font-semibold mb-2">Existing Customer</h2>
          <p className="text-gray-700">Log in to manage your account.</p>
        </div>

        {/* Action Card 2: New Customer */}
        <div
          className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow duration-300"
          onClick={() => handleActionCardClick("new")}
        >
          <h2 className="text-xl font-semibold mb-2">New Customer</h2>
          <p className="text-gray-700">Create a new account and get started.</p>
        </div>

        {/* Action Card 3: Find a Professional */}
        <div
          className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow duration-300"
          onClick={() => handleActionCardClick("find")}
        >
          <h2 className="text-xl font-semibold mb-2">Find a Professional</h2>
          <p className="text-gray-700">Connect with experts in your area.</p>
        </div>
      </div>

      {/* User Form Popup */}
      {showUserForm && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Enter Your Information</h2>
            <form>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {formErrors.email && <p className="text-red-500 text-xs italic">{formErrors.email}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
                  First Name:
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {formErrors.firstName && <p className="text-red-500 text-xs italic">{formErrors.firstName}</p>}
              </div>
              <div className="mb-6">
                <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
                  Last Name:
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {formErrors.lastName && <p className="text-red-500 text-xs italic">{formErrors.lastName}</p>}
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={handleFormSubmit}
                >
                  Submit
                </button>
                <button
                  className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                  type="button"
                  onClick={() => setShowUserForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingPage
